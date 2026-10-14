use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use anyhow::{Context, Result, bail};

use super::state::{Change, MAPPING, Mode, Plan};
use super::{keys, luks, mask, stage};
use crate::paths;
use crate::system::command::Tool;
use crate::system::journal::STAGE_REFUSED;
use crate::system::secret::Secret;
use crate::system::{efi, keyring};

const DEVICE_WAIT: Duration = Duration::from_secs(90);
const ATTEMPTS: usize = 5;
pub const RESULT: &str = "/run/trustd/encryption-result";
const ESP: &str = "/run/trustd/esp";

struct MountedEsp;

impl MountedEsp {
    fn mount() -> Result<Self> {
        let partuuid =
            efi::boot_partition().context("The firmware didn't say where it started from")?;
        let device = Path::new("/dev/disk/by-partuuid").join(partuuid);
        wait_for(&device)?;
        std::fs::create_dir_all(ESP)?;
        Tool::new("mount")
            .args(["-o", "ro"])
            .arg(&device)
            .arg(ESP)
            .status()?;
        Ok(Self)
    }

    fn stage(&self) -> PathBuf {
        Path::new(ESP).join(stage::FOLDER)
    }
}

impl Drop for MountedEsp {
    fn drop(&mut self) {
        let _ = Tool::new("umount").arg(ESP).status();
    }
}

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
        .arg(format!("--id=trustd:{id}"))
        .arg("--timeout=0")
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

fn recovery_key(plan: &Plan, folder: &Path, device: Option<&Path>) -> Result<Secret> {
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

fn attach(plan: &Plan, device: &Path, header: Option<&Path>) -> Result<()> {
    let mut options = vec!["discard".to_owned()];
    if plan.mode == Mode::Tpm {
        options.push("tpm2-device=auto".to_owned());
    }
    if let Some(header) = header {
        options.push(format!("header={}", header.display()));
    }
    Tool::new("/usr/lib/systemd/systemd-cryptsetup")
        .arg("attach")
        .arg(MAPPING)
        .arg(device)
        .arg("none")
        .arg(options.join(","))
        .status()
        .context("The disk couldn't be opened")
}

fn still_decrypting(header: &Path, device: &Path) -> bool {
    let size = crate::system::blocks::kernel_name(device)
        .map_or(0, |name| crate::system::blocks::size_bytes(&name));
    luks::read(device, Some(header), size)
        .is_ok_and(|header| header.is_some_and(|header| header.reencrypting.is_some()))
}

fn open_while_decrypting(plan: &Plan, folder: &Path, device: &Path) -> Result<()> {
    if current_uuid(device).as_deref() == Some(plan.uuid.as_str()) {
        return attach(plan, device, None);
    }
    let Some(name) = &plan.header else {
        return Ok(());
    };
    let header = folder.join(name);
    if !still_decrypting(&header, device) {
        return Ok(());
    }
    mask::mask_system_disk(&plan.partuuid, &plan.uuid)?;
    let _ = Tool::new("udevadm")
        .args(["trigger", "--action=change", "--settle"])
        .arg(device)
        .status();
    attach(plan, device, Some(&header))
}

fn open_while_encrypting(plan: &Plan, folder: &Path, device: &Path) -> Result<()> {
    let key = match current_uuid(device) {
        None => {
            let key = match recovery_key(plan, folder, None) {
                Ok(key) => key,
                Err(error) => {
                    record("failed");
                    return Err(error);
                }
            };
            start_encrypting(plan, device, &key)?;
            key
        }
        Some(uuid) if uuid == plan.uuid => recovery_key(plan, folder, Some(device))?,
        Some(_) => return Ok(()),
    };
    Tool::new("cryptsetup")
        .args(["open", "--key-file", "-"])
        .arg(device)
        .arg(MAPPING)
        .input(&key)
        .status()
        .context("The disk couldn't be opened")?;
    keyring::keep(keys::HANDED_OVER, &key);
    record("started");
    Ok(())
}

pub fn run() -> Result<()> {
    let esp = MountedEsp::mount()?;
    let folder = esp.stage();
    let Some(plan) = stage::plan_in(&folder) else {
        return Ok(());
    };
    let device = plan.partition();
    wait_for(&device)?;
    match plan.change {
        Change::Encrypt => open_while_encrypting(&plan, &folder, &device),
        Change::Decrypt => open_while_decrypting(&plan, &folder, &device),
    }
}
