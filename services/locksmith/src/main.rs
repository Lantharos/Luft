mod dconf;

use std::fs;
use std::io;
use std::path::Path;
use std::process::{Command, ExitCode};

use anyhow::{Context, Result, bail};
use luft_policy::Policy;

const FOLDER: &str = "/run/luft/policy";
const DATABASE: &str = "/run/luft/policy/dconf";

fn main() -> ExitCode {
    match apply(&Policy::load()) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}

fn apply(policy: &Policy) -> Result<()> {
    let locked = dconf::locked(&policy.screen_lock);
    if locked.is_empty() {
        return match fs::remove_file(DATABASE) {
            Err(error) if error.kind() != io::ErrorKind::NotFound => {
                Err(error).with_context(|| format!("Removing {DATABASE}"))
            }
            _ => Ok(()),
        };
    }
    let keyfiles = Path::new(FOLDER).join("keyfiles");
    let _ = fs::remove_dir_all(&keyfiles);
    fs::create_dir_all(keyfiles.join("locks"))?;
    fs::write(keyfiles.join("policy"), dconf::keyfile(&locked))?;
    fs::write(keyfiles.join("locks/policy"), dconf::locks(&locked))?;
    let compiled = format!("{DATABASE}.new");
    let status = Command::new("dconf")
        .arg("compile")
        .arg(&compiled)
        .arg(&keyfiles)
        .status()
        .context("Running dconf compile")?;
    fs::remove_dir_all(&keyfiles)?;
    if !status.success() {
        bail!("dconf compile couldn't build the locked settings: {status}");
    }
    fs::rename(&compiled, DATABASE).with_context(|| format!("Replacing {DATABASE}"))
}
