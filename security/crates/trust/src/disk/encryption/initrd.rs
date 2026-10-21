use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use anyhow::{Context, Result, bail, ensure};

use super::mask;
use super::stage::{self, Staged};
use super::state::{Change, MAPPING, Mode, Plan};
use crate::disk::layout::room::{self, HEADER_ROOM};
use crate::disk::unlock::{keys, luks};
use crate::paths;
use crate::system::firmware::efi;
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use crate::system::secrets::keyring;
use crate::system::secrets::secret::Secret;

const DEVICE_WAIT: Duration = Duration::from_secs(90);
const ATTEMPTS: usize = 5;
const RESULT: &str = "/run/trustd/encryption-result";
const STARTED: &str = "started";
const FAILED: &str = "failed";
const REFUSED: &str = "refused";
const ESP: &str = "/run/trustd/esp";
const ROOT_PARTITION: &str = "/dev/luft-root-partition";
const PLAN_REFUSED: &str = "The encryption plan on the EFI system partition didn't check out, so the disk was left as it was";

struct MountedEsp;

impl MountedEsp {
    fn mount() -> Result<Self> {
        let partuuid =
            efi::boot_partition().context("The firmware didn't say where it started from")?;
        let device = Path::new("/dev/disk/by-partuuid").join(partuuid);
        wait_for(&device)?;
        paths::ensure_private(paths::RUNTIME)?;
        paths::ensure_private(ESP)?;
        blocks::mount_boot_partition(&device, Path::new(ESP), true)?;
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

fn key_from_person(device: &Path, header: Option<&Path>, mode: Mode) -> Result<Secret> {
    let (id, message) = match mode {
        Mode::Tpm => ("recovery", "Enter the recovery key"),
        Mode::Passphrase => ("passphrase", "Enter the disk's passphrase"),
    };
    loop {
        let typed = keys::normalize(&ask(&format!("{id}:{}", device.display()), message)?);
        if keys::opens(device, header, &typed) {
            return Ok(typed);
        }
    }
}

fn recovery_key(staged: &Staged, device: Option<&Path>) -> Result<Secret> {
    match staged.plan.mode {
        Mode::Tpm => staged.open_sealed().or_else(|error| {
            eprintln!("{error:#}");
            let Some(device) = device else {
                return Err(error);
            };
            key_from_person(device, None, Mode::Tpm)
        }),
        Mode::Passphrase => {
            let attempts = if device.is_some() {
                usize::MAX
            } else {
                ATTEMPTS
            };
            for _ in 0..attempts {
                let typed = ask(
                    &format!("passphrase:{}", staged.plan.partition().display()),
                    "Enter the disk's passphrase",
                )?;
                let opens_disk = || {
                    let key = keys::normalize(&typed);
                    device
                        .is_some_and(|device| keys::opens(device, None, &key))
                        .then_some(key)
                };
                if let Some(key) = staged.open_boxed(&typed).or_else(opens_disk) {
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
        .arg("--reduce-device-size")
        .arg(format!("{}M", HEADER_ROOM >> 20))
        .args(["--uuid", &plan.uuid, "--key-file", "-"])
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

pub fn record_refused() {
    record(REFUSED);
}

pub fn refused() -> bool {
    std::fs::read_to_string(RESULT).is_ok_and(|result| result == REFUSED)
}

pub fn start_failed() -> bool {
    std::fs::read_to_string(RESULT).is_ok_and(|result| result == FAILED)
}

pub fn forget_result() {
    let _ = std::fs::remove_file(RESULT);
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

fn open_with(device: &Path, header: Option<&Path>, key: &Secret) -> Result<()> {
    let open = Tool::new("cryptsetup").args(["open", "--allow-discards", "--key-file", "-"]);
    let open = match header {
        Some(header) => open.arg("--header").arg(header),
        None => open,
    };
    open.arg(device)
        .arg(MAPPING)
        .input(key)
        .status()
        .context("The disk couldn't be opened")?;
    keyring::keep(keys::HANDED_OVER, key);
    Ok(())
}

fn still_decrypting(plan: &Plan, header: &Path, device: &Path) -> bool {
    let size = blocks::kernel_name(device).map_or(0, |name| blocks::size_bytes(&name));
    luks::read(device, Some(header), size).is_ok_and(|header| {
        header.is_some_and(|header| header.reencrypting.is_some() && header.uuid == plan.uuid)
    })
}

fn open_while_decrypting(staged: &Staged, device: &Path) -> Result<()> {
    let plan = &staged.plan;
    if current_uuid(device).as_deref() == Some(plan.uuid.as_str()) {
        return attach(plan, device, None);
    }
    let header = staged.header().context("The plan has no header file")?;
    if !still_decrypting(plan, &header, device) {
        return Ok(());
    }
    let key = match plan.mode {
        Mode::Tpm => match staged.open_sealed() {
            Ok(_) => None,
            Err(error) => {
                eprintln!("{error:#}");
                Some(key_from_person(device, Some(&header), Mode::Tpm)?)
            }
        },
        Mode::Passphrase => Some(key_from_person(device, Some(&header), Mode::Passphrase)?),
    };
    mask::mask_system_disk(&plan.partuuid, &plan.uuid)?;
    let _ = Tool::new("udevadm")
        .args(["trigger", "--action=change", "--settle"])
        .arg(device)
        .status();
    match key {
        Some(key) => open_with(device, Some(&header), &key),
        None => attach(plan, device, Some(&header)),
    }
}

fn open_while_encrypting(staged: &Staged, device: &Path) -> Result<()> {
    let plan = &staged.plan;
    let key = match current_uuid(device) {
        None => {
            let key =
                match room::ensure_header_room(device).and_then(|()| recovery_key(staged, None)) {
                    Ok(key) => key,
                    Err(error) => {
                        record(FAILED);
                        return Err(error);
                    }
                };
            start_encrypting(plan, device, &key)?;
            key
        }
        Some(uuid) if uuid == plan.uuid => recovery_key(staged, Some(device))?,
        Some(_) => return Ok(()),
    };
    open_with(device, None, &key)?;
    record(STARTED);
    Ok(())
}

fn root_partition(plan: &Plan) -> Result<PathBuf> {
    let root = Path::new(ROOT_PARTITION);
    wait_for(root)?;
    let name = blocks::kernel_name(root).context("The partition Luft starts from vanished")?;
    ensure!(
        blocks::partuuid(&name).as_deref() == Some(plan.partuuid.as_str()),
        "The plan names a partition Luft doesn't start from"
    );
    Ok(blocks::device(&name))
}

pub fn run() -> Result<()> {
    let esp = MountedEsp::mount()?;
    let Some(staged) = stage::staged_in(&esp.stage()) else {
        return Ok(());
    };
    let checked = staged.and_then(|staged| Ok((root_partition(&staged.plan)?, staged)));
    let (device, staged) = match checked {
        Ok(checked) => checked,
        Err(error) => {
            record(FAILED);
            return Err(error.context(PLAN_REFUSED));
        }
    };
    match staged.plan.change {
        Change::Encrypt => open_while_encrypting(&staged, &device),
        Change::Decrypt => open_while_decrypting(&staged, &device),
    }
}
