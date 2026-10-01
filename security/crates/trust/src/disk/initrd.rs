use std::path::Path;
use std::time::{Duration, Instant};

use anyhow::{Context, Result, bail};

use super::state::{Mode, Plan};
use super::{keys, stage};
use crate::paths::{self, INITRD_STAGE};
use crate::system::command::Tool;
use crate::system::journal::STAGE_REFUSED;
use crate::system::keyring;
use crate::system::secret::Secret;

const DEVICE_WAIT: Duration = Duration::from_secs(90);
const ATTEMPTS: usize = 5;
pub const RESULT: &str = "/run/luft-trust/encryption-result";

fn splash(mode: &str) {
    let _ = Tool::new("sushictl").args(["show", mode]).status();
}

fn wait_for(device: &Path) -> Result<()> {
    let started = Instant::now();
    while !device.exists() {
        if started.elapsed() > DEVICE_WAIT {
            bail!("{} never appeared", device.display());
        }
        std::thread::sleep(Duration::from_millis(200));
    }
    Ok(())
}

fn ask(id: &str, message: &str) -> Result<Secret> {
    Tool::new("systemd-ask-password")
        .arg(format!("--id=luft-trust:{id}"))
        .args(["--timeout=0", "--no-output-on-error"])
        .arg(message)
        .output_bytes()
        .map(|mut answer| {
            if answer.last() == Some(&b'\n') {
                answer.pop();
            }
            Secret::new(answer)
        })
}

fn recovery_key_from_person(device: &Path) -> Result<Secret> {
    for _ in 0..ATTEMPTS {
        let typed = keys::normalize(&ask(
            &format!("recovery:{}", device.display()),
            "Enter the recovery key",
        )?);
        if keys::opens(device, None, &typed) {
            return Ok(typed);
        }
    }
    bail!("The recovery key wasn't entered")
}

fn recovery_key(
    plan: &Plan,
    device: Option<&Path>,
    passphrase: &mut Option<Secret>,
) -> Result<Secret> {
    let folder = Path::new(INITRD_STAGE);
    match plan.mode {
        Mode::Tpm => match stage::open_sealed(folder) {
            Ok(key) => Ok(key),
            Err(error) => {
                eprintln!("{STAGE_REFUSED}: {error:#}");
                let device = device.context(STAGE_REFUSED)?;
                recovery_key_from_person(device)
            }
        },
        Mode::Passphrase => {
            for _ in 0..ATTEMPTS {
                let typed = ask(
                    &format!("passphrase:{}", plan.partition().display()),
                    "Enter the disk's passphrase",
                )?;
                if let Some(key) = stage::open_boxed(folder, &typed) {
                    *passphrase = Some(typed);
                    return Ok(key);
                }
            }
            bail!("The passphrase wasn't entered")
        }
    }
}

fn start_encrypting(plan: &Plan, device: &Path, key: &Secret) -> Result<()> {
    splash("encrypting");
    let started = Tool::new("cryptsetup")
        .args([
            "reencrypt",
            "--encrypt",
            "--init-only",
            "--batch-mode",
            "--type",
            "luks2",
        ])
        .args([
            "--reduce-device-size",
            "32M",
            "--uuid",
            &plan.uuid,
            "--key-file",
            "-",
        ])
        .arg(device)
        .input(key)
        .status();
    let _ = Tool::new("udevadm")
        .args(["trigger", "--action=change", "--settle"])
        .arg(device)
        .status();
    splash("boot-up");
    started
}

fn current_uuid(device: &Path) -> Option<String> {
    Tool::new("cryptsetup")
        .arg("luksUUID")
        .arg(device)
        .output()
        .ok()
        .map(|uuid| uuid.trim().to_owned())
}

fn record(result: &str) {
    let _ = paths::ensure_private(paths::RUNTIME);
    let _ = std::fs::write(RESULT, result);
}

pub fn run() -> Result<()> {
    let Some(plan) = stage::plan_in(Path::new(INITRD_STAGE)) else {
        return Ok(());
    };
    let device = plan.partition();
    wait_for(&device)?;
    let mut passphrase = None;
    let key = match current_uuid(&device) {
        None => {
            let key = match recovery_key(&plan, None, &mut passphrase) {
                Ok(key) => key,
                Err(error) => {
                    record("failed");
                    return Err(error);
                }
            };
            start_encrypting(&plan, &device, &key)?;
            key
        }
        Some(uuid) if uuid == plan.uuid => recovery_key(&plan, Some(&device), &mut passphrase)?,
        Some(_) => return Ok(()),
    };
    Tool::new("cryptsetup")
        .args(["open", "--key-file", "-"])
        .arg(&device)
        .arg(plan.mapping())
        .input(&key)
        .status()
        .context("The disk couldn't be opened")?;
    keyring::hand_over("recovery-key", &key);
    if let Some(passphrase) = passphrase {
        keyring::hand_over("passphrase", &passphrase);
    }
    record("started");
    Ok(())
}
