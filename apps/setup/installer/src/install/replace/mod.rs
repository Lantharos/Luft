mod accounts;
mod carry;
mod disks;
mod record;
mod toolbox;

use std::path::Path;

use anyhow::{Context, Result};

use super::configure::deployment::Deployment;
use super::drive::layout::Role;
use super::drive::target::Mounted;
use crate::survey::linux::old::{self, OldSystem};
use crate::survey::linux::{Part, Plan};
use crate::system::command::Tool;
use crate::system::mount::{self, Mounted as Opened};

const OLD_SYSTEM: &str = "old-system";
const LIVE_HOST: &str = "/run/luft/host";

pub struct Kept {
    pub old: OldSystem,
    plan: Plan,
    top: Option<Opened>,
    startups: Vec<String>,
    old_name: Option<String>,
}

fn writable(part: &Part) -> Result<()> {
    for point in part
        .mount_points
        .iter()
        .filter(|point| point.starts_with(LIVE_HOST))
    {
        Tool::new("mount")
            .args(["-o", "remount,rw"])
            .arg(point)
            .run()?;
    }
    Ok(())
}

fn uuid_of(part: &Part) -> Result<String> {
    Ok(Tool::new("blkid")
        .args(["--output", "value", "--match-tag", "UUID"])
        .arg(&part.device)
        .output()?
        .trim()
        .to_owned())
}

fn startups(plan: &Plan, at: &Path) -> Result<Vec<String>> {
    let esp = Opened::new(&plan.esp.device, "ro", at)?;
    Ok(record::startups_on(esp.path()))
}

fn startup_partition(plan: &Plan) -> Result<()> {
    match &plan.boot {
        Some(boot) => disks::format(boot, Role::Xbootldr),
        None => Ok(()),
    }
}

pub fn prepare(plan: &Plan, target: &Path) -> Result<(Mounted, Kept)> {
    writable(&plan.root)?;
    writable(&plan.home.part)?;
    let startups = startups(plan, &target.with_extension("esp"))?;
    let esp = plan.esp.device.clone();
    if let Some(subvolume) = &plan.subvolume {
        let top = Opened::new(
            &plan.root.device,
            mount::top_level(&plan.root.fs_type),
            &target.with_extension("top"),
        )?;
        let old = old::read(&top.path().join(subvolume));
        let old_name = disks::free_name(top.path(), OLD_SYSTEM);
        disks::new_subvolume(top.path())?;
        startup_partition(plan)?;
        disks::mark_root(&plan.root)?;
        let mounted = Mounted::open(
            &plan.root.device,
            &format!("subvol={}", disks::LUFT_SUBVOLUME),
            target,
            &plan.root.uuid,
            esp,
        )?;
        return Ok((
            mounted,
            Kept {
                old,
                plan: plan.clone(),
                top: Some(top),
                startups,
                old_name: Some(old_name),
            },
        ));
    }
    let old = {
        let opened = Opened::new(
            &plan.root.device,
            mount::looking_into(&plan.root.fs_type),
            &target.with_extension("old"),
        )?;
        old::read(opened.path())
    };
    startup_partition(plan)?;
    disks::format(&plan.root, Role::Root)?;
    let uuid = uuid_of(&plan.root)?;
    let mounted = Mounted::open(&plan.root.device, "", target, &uuid, esp)?;
    Ok((
        mounted,
        Kept {
            old,
            plan: plan.clone(),
            top: None,
            startups,
            old_name: None,
        },
    ))
}

fn size_of(path: &Path) -> u64 {
    Tool::new("du")
        .args(["--summarize", "--one-file-system", "--bytes"])
        .arg(path)
        .output()
        .ok()
        .and_then(|text| text.split_whitespace().next()?.parse().ok())
        .unwrap_or(0)
}

impl Kept {
    pub fn owner(&self) -> &str {
        self.old.owner().map_or("", |account| account.name.as_str())
    }

    pub fn needs_password(&self) -> bool {
        self.old
            .owner()
            .is_some_and(|account| account.hash.is_none())
    }

    fn home_line(&self) -> String {
        let home = &self.plan.home;
        let pass = if home.part.fs_type == "btrfs" { 0 } else { 2 };
        format!(
            "UUID={} /var/home {} {} 0 {pass}\n",
            home.part.uuid, home.entry.vfs_type, home.entry.options
        )
    }

    fn relabel_home(&self, deployment: &Deployment) -> Result<()> {
        let home = &self.plan.home;
        let options = home
            .subvolume
            .as_ref()
            .map_or_else(String::new, |subvolume| format!("subvol={subvolume}"));
        let at = deployment.var("home");
        let opened = Opened::new(&home.part.device, &options, &at)?;
        deployment
            .relabel_kept(&[opened.path().to_owned()])
            .context("Your files couldn't be labelled for Luft")
    }

    fn record(&self) -> record::OldSystem {
        let subvolume = self.old_name.clone();
        record::OldSystem {
            name: self.old.release.name.clone(),
            size: match (&self.top, &self.plan.subvolume) {
                (Some(top), Some(current)) => size_of(&top.path().join(current)),
                _ => 0,
            },
            subvolume,
            partitions: Vec::new(),
            startups: self.startups.clone(),
        }
    }

    pub fn configure(&self, deployment: &Deployment, password: Option<&str>) -> Result<()> {
        accounts::carry(deployment, &self.old.accounts, password)?;
        carry::settings(deployment, &self.old)?;
        carry::mounts(deployment, self.home_line(), &self.plan.drives)?;
        self.relabel_home(deployment)?;
        toolbox::define(deployment, &self.old, self.owner())?;
        record::write_record(deployment, &self.record())
    }

    pub fn finish(self) -> Result<()> {
        if let (Some(top), Some(current), Some(name)) =
            (&self.top, &self.plan.subvolume, &self.old_name)
        {
            std::fs::rename(top.path().join(current), top.path().join(name))
                .context("The old system couldn't be set aside")?;
        }
        Ok(())
    }
}
