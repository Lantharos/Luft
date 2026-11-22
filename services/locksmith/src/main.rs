mod dconf;
mod polkit;
mod sessions;

use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::path::Path;
use std::process::{Command, ExitCode};

use anyhow::{Context, Result, bail};
use luft_policy::Policy;

const PUBLISHED: &str = "/run/luft/policy/policy.json";
const DATABASE: &str = "/etc/dconf/db/luft_policy";
const KEYFILES: &str = "/run/luft/policy/keyfiles";
const RULES: &str = "/run/polkit-1/rules.d/00-luft-policy.rules";

fn main() -> ExitCode {
    let policy = Policy::load();
    let applied = publish(&policy)
        .and_then(|()| lock_settings(&policy))
        .and_then(|()| lock_accounts(&policy));
    match applied {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}

fn replace(path: &str, text: &str) -> Result<()> {
    let staged = format!("{path}.new");
    fs::write(&staged, text).with_context(|| format!("Writing {staged}"))?;
    fs::rename(&staged, path).with_context(|| format!("Replacing {path}"))
}

fn remove(path: &str) -> Result<()> {
    match fs::remove_file(path) {
        Err(error) if error.kind() != io::ErrorKind::NotFound => {
            Err(error).with_context(|| format!("Removing {path}"))
        }
        _ => Ok(()),
    }
}

fn publish(policy: &Policy) -> Result<()> {
    let text = serde_json::to_string(policy).expect("the policy serializes");
    replace(PUBLISHED, &text)
}

fn lock_accounts(policy: &Policy) -> Result<()> {
    match polkit::rules(&policy.accounts) {
        Some(rules) => replace(RULES, &rules),
        None => remove(RULES),
    }
}

fn lock_settings(policy: &Policy) -> Result<()> {
    let locked = dconf::locked(policy);
    let keyfiles = Path::new(KEYFILES);
    let _ = fs::remove_dir_all(keyfiles);
    fs::create_dir_all(keyfiles.join("locks"))?;
    fs::write(keyfiles.join("policy"), dconf::keyfile(&locked))?;
    fs::write(keyfiles.join("locks/policy"), dconf::locks(&locked))?;
    let compiled = format!("{DATABASE}.new");
    let status = Command::new("dconf")
        .arg("compile")
        .arg(&compiled)
        .arg(keyfiles)
        .status()
        .context("Running dconf compile")?;
    fs::remove_dir_all(keyfiles)?;
    if !status.success() {
        bail!("dconf compile couldn't build the locked settings: {status}");
    }
    let previous = OpenOptions::new().write(true).open(DATABASE).ok();
    fs::rename(&compiled, DATABASE).with_context(|| format!("Replacing {DATABASE}"))?;
    if let Some(mut previous) = previous {
        previous
            .write_all(&[0; 8])
            .context("Marking the previous locked settings as replaced")?;
    }
    sessions::tell()
}
