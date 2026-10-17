use std::path::Path;

use anyhow::Result;

use crate::install::configure::deployment::Deployment;
use crate::survey::linux::Account;
use crate::system::command::Tool;

const HOMES: &str = "/var/home";

fn group_ids(deployment: &Deployment) -> Vec<(String, u32)> {
    std::fs::read_to_string(deployment.etc("group"))
        .unwrap_or_default()
        .lines()
        .filter_map(|line| {
            let fields: Vec<&str> = line.split(':').collect();
            Some(((*fields.first()?).to_owned(), fields.get(2)?.parse().ok()?))
        })
        .collect()
}

fn ensure_group(deployment: &Deployment, account: &Account) -> Result<()> {
    let groups = group_ids(deployment);
    if groups.iter().any(|(_, id)| *id == account.gid) {
        return Ok(());
    }
    let name = if groups.iter().any(|(name, _)| *name == account.group) {
        format!("{}-{}", account.group, account.gid)
    } else {
        account.group.clone()
    };
    Tool::new("groupadd")
        .arg("--root")
        .arg(&deployment.root)
        .args(["--gid", &account.gid.to_string(), &name])
        .run()
}

pub fn home_of(account: &Account) -> String {
    let name = Path::new(&account.home).strip_prefix("/home").map_or_else(
        |_| account.name.clone(),
        |rest| rest.to_string_lossy().into_owned(),
    );
    format!("{HOMES}/{name}")
}

fn add(deployment: &Deployment, account: &Account, admin: bool) -> Result<()> {
    ensure_group(deployment, account)?;
    let mut useradd = Tool::new("useradd")
        .arg("--root")
        .arg(&deployment.root)
        .args([
            "--uid",
            &account.uid.to_string(),
            "--gid",
            &account.gid.to_string(),
        ])
        .args(["--no-create-home", "--home-dir", &home_of(account)])
        .args(["--comment", &account.full_name]);
    if admin {
        useradd = useradd.args(["--groups", "wheel"]);
    }
    useradd.arg(&account.name).run()
}

fn set_password(deployment: &Deployment, name: &str, secret: &str, encrypted: bool) -> Result<()> {
    let mut chpasswd = Tool::new("chpasswd").arg("--root").arg(&deployment.root);
    chpasswd = if encrypted {
        chpasswd.arg("--encrypted")
    } else {
        chpasswd.args(["--crypt-method", "YESCRYPT"])
    };
    chpasswd
        .input(format!("{name}:{secret}\n").as_bytes())
        .run()
}

pub fn carry(deployment: &Deployment, accounts: &[Account], password: Option<&str>) -> Result<()> {
    for (index, account) in accounts.iter().enumerate() {
        add(deployment, account, index == 0 || account.admin)?;
        match (&account.hash, index == 0, password) {
            (Some(hash), _, _) => set_password(deployment, &account.name, hash, true)?,
            (None, true, Some(password)) => {
                set_password(deployment, &account.name, password, false)?
            }
            _ => {}
        }
    }
    deployment.relabel(&["passwd", "shadow", "group", "gshadow"].map(|name| deployment.etc(name)))
}
