pub mod configure;
mod copy;
pub mod drive;
mod replace;
mod startup;
pub mod windows;

use std::path::Path;
use std::sync::{Condvar, Mutex};

use anyhow::{Context, Result};
use luft_meet::Handoff;

pub use configure::account::Account;
pub use configure::regional::Regional;

use crate::config::Image;
use configure::deployment::Deployment;
use configure::{handoff, networks};
use drive::encryption::Encryption;
use drive::partition;
use drive::plan::Plan;
use drive::target::Mounted;
use luft_i18n::t;
use replace::Kept;
use windows::Windows;

use crate::survey::linux;
use crate::system::wait;

use crate::L10N;
use crate::meet::{self, reclaim, start, unpack};

const PREPARED: f64 = 0.04;
const COPIED: f64 = 0.96;
const COPIED_BEFORE_UNPACKING: f64 = 0.8;
const STATE: &str = "lib/luft-installer";
const TRUST_STATE: &str = "lib/trustd";

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Stage {
    Idle,
    Preparing,
    Copying,
    Waiting,
    Configuring,
    Finished,
    Failed,
}

impl Stage {
    pub fn name(self) -> &'static str {
        match self {
            Self::Idle => "idle",
            Self::Preparing => "preparing",
            Self::Copying => "copying",
            Self::Waiting => "waiting",
            Self::Configuring => "configuring",
            Self::Finished => "finished",
            Self::Failed => "failed",
        }
    }
}

#[derive(Clone)]
pub struct Status {
    pub stage: Stage,
    pub progress: f64,
    pub error: String,
    pub secure_boot_code: String,
}

impl Status {
    pub fn idle() -> Self {
        Self::at(Stage::Idle, 0.0)
    }

    fn at(stage: Stage, progress: f64) -> Self {
        Self {
            stage,
            progress,
            error: String::new(),
            secure_boot_code: String::new(),
        }
    }
}

#[derive(Default)]
struct Inputs {
    regional: Option<Regional>,
    account: Option<Account>,
}

#[derive(Default)]
pub struct Answers {
    inputs: Mutex<Inputs>,
    given: Condvar,
}

impl Answers {
    pub fn set_regional(&self, regional: Regional) {
        self.inputs.lock().expect("answers lock").regional = Some(regional);
        self.given.notify_all();
    }

    pub fn set_account(&self, account: Account) {
        self.inputs.lock().expect("answers lock").account = Some(account);
        self.given.notify_all();
    }

    fn wait(&self, account_needed: bool) -> (Regional, Option<Account>) {
        let mut inputs = self.inputs.lock().expect("answers lock");
        loop {
            if let Some(regional) = &inputs.regional
                && (inputs.account.is_some() || !account_needed)
            {
                let regional = regional.clone();
                return (regional, inputs.account.take());
            }
            inputs = self.given.wait(inputs).expect("answers lock");
        }
    }
}

pub enum Destination {
    Partitions(Plan),
    Replace(Box<linux::Plan>),
}

impl Destination {
    pub fn drive(&self) -> &str {
        match self {
            Self::Partitions(plan) => &plan.drive,
            Self::Replace(plan) => &plan.root.drive,
        }
    }
}

pub struct Job<'a> {
    pub image: &'a Image,
    pub destination: Destination,
    pub target: &'a Path,
    pub answers: &'a Answers,
    pub windows: Option<Windows>,
    pub meet: Option<Handoff>,
    pub encryption: Option<Encryption>,
}

fn unpack_box(
    guid: &str,
    deployment: &Deployment,
    account: &Account,
    at: &Path,
    progress: &dyn Fn(f64),
) -> Result<()> {
    let opened = meet::Opened::mount(guid, at)?;
    let manifest = opened.manifest()?;
    unpack::unpack(deployment, account, opened.root(), &manifest, progress)
}

pub fn run(job: Job, report: impl Fn(Status)) {
    if let Err(error) = install(&job, &report) {
        eprintln!("Installing failed: {error:#}");
        report(Status {
            stage: Stage::Failed,
            progress: 0.0,
            error: format!("{error:#}"),
            secure_boot_code: String::new(),
        });
    }
}

fn prepare(job: &Job) -> Result<(Mounted, Option<Kept>)> {
    match &job.destination {
        Destination::Partitions(plan) => {
            let parts = wait(partition::apply(plan, job.encryption.is_some()))?;
            let skipped: Vec<&str> = job
                .meet
                .iter()
                .flat_map(Handoff::partitions)
                .map(|(_, partition)| partition)
                .collect();
            Ok((
                Mounted::assemble(
                    job.target,
                    &plan.device,
                    &parts,
                    &skipped,
                    job.encryption.as_ref(),
                )?,
                None,
            ))
        }
        Destination::Replace(plan) => {
            let (mounted, kept) = replace::prepare(plan, job.target, job.encryption.as_ref())?;
            Ok((mounted, Some(kept)))
        }
    }
}

fn install(job: &Job, report: &impl Fn(Status)) -> Result<()> {
    report(Status::at(Stage::Preparing, 0.0));
    if let Some(windows) = &job.windows {
        windows.change();
    }
    let (mounted, kept) = prepare(job)?;
    let moving_box = job.meet.as_ref().and_then(Handoff::moving_box);
    let copied = if moving_box.is_some() {
        COPIED_BEFORE_UNPACKING
    } else {
        COPIED
    };
    report(Status::at(Stage::Copying, PREPARED));
    let hidden = match &job.destination {
        Destination::Partitions(plan) => start::Hidden::while_copying(job.meet.as_ref(), plan)?,
        Destination::Replace(_) => None,
    };
    copy::run(job.image, &mounted, |done| {
        report(Status::at(
            Stage::Copying,
            PREPARED + (copied - PREPARED) * done,
        ))
    })
    .with_context(|| t!(L10N, "installer-copy-failed"))?;
    drop(hidden);
    startup::place(&mounted, &job.target.with_extension("esp"))?;
    report(Status::at(Stage::Waiting, copied));
    let (regional, account) = job
        .answers
        .wait(kept.as_ref().is_none_or(Kept::needs_password));
    report(Status::at(Stage::Configuring, copied));
    let deployment = Deployment::mount(mounted.root(), &job.target.with_extension("system"))?;
    if let (Some(encryption), Some(opened)) = (&job.encryption, mounted.encrypted()) {
        let state = deployment.var(TRUST_STATE);
        encryption.seal(opened, &state)?;
        deployment.relabel(&[state])?;
    }
    regional.apply(&deployment)?;
    let user = match (&kept, account) {
        (Some(kept), account) => {
            kept.configure(
                &deployment,
                account.as_ref().map(|account| account.password.as_str()),
            )?;
            kept.owner().to_owned()
        }
        (None, Some(account)) => {
            account.create(&deployment)?;
            if let Some(windows) = &job.windows
                && let Err(error) = windows.bring_bluetooth(&deployment)
            {
                eprintln!("Bluetooth devices from Windows weren't brought over: {error:#}");
            }
            if let Some(guid) = moving_box
                && let Err(error) = unpack_box(
                    guid,
                    &deployment,
                    &account,
                    &job.target.with_extension("box"),
                    &|done| {
                        report(Status::at(
                            Stage::Configuring,
                            copied + (COPIED - copied) * done,
                        ))
                    },
                )
            {
                eprintln!("The moving box wasn't unpacked: {error:#}");
            }
            account.name
        }
        (None, None) => anyhow::bail!(t!(L10N, "installer-account-missing")),
    };
    if let Some(meet) = &job.meet {
        reclaim::remember(&deployment.var(STATE), meet)?;
    }
    if let Err(error) = networks::carry_from_live(&deployment) {
        eprintln!("The Wi-Fi networks joined here weren't brought over: {error:#}");
    }
    handoff::prepare(&deployment, &user)?;
    drop(deployment);
    if let Some(kept) = kept {
        kept.finish()?;
    }
    mounted.finish()?;
    let secure_boot_code = startup::ask_shim_to_trust_luft()?;
    report(Status {
        secure_boot_code,
        ..Status::at(Stage::Finished, 1.0)
    });
    Ok(())
}
