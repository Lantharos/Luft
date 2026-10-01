use std::io::{BufRead, BufReader};
use std::os::unix::process::CommandExt;
use std::process::{Child, Command, Stdio};
use std::time::Duration;

use anyhow::{Context, Result, bail};
use serde::Deserialize;

use super::initrd::RESULT;
use super::state::{self, Change, Mode, Plan};
use super::{SystemDisk, keys, luks, stage};
use crate::boot::cmdline;
use crate::boot::startup::rebuild_boot_files;
use crate::errors::NeedsKey;
use crate::system::secret::Secret;
use crate::system::{keyring, power};

const IDLE_IO: libc::c_int = 3 << 13;
const BATTERY_CHECK: Duration = Duration::from_secs(20);

#[derive(Clone, Copy, Debug, Default)]
pub struct Progress {
    pub done: f64,
    pub remaining_seconds: u64,
}

#[derive(Deserialize)]
struct Line {
    device_bytes: String,
    device_size: String,
    eta_ms: String,
}

pub fn pending() -> Option<Plan> {
    Plan::load()
}

fn spawn(plan: &Plan, key: &Secret) -> Result<Child> {
    let mut command = Command::new("cryptsetup");
    command.args([
        "reencrypt",
        "--resume-only",
        "--progress-json",
        "--progress-frequency",
        "1",
    ]);
    command.args(["--key-file", "-"]);
    if let Some(header) = &plan.header {
        command.arg("--header").arg(header);
    }
    command
        .arg(plan.partition())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null());
    unsafe {
        command.pre_exec(|| {
            libc::setpriority(libc::PRIO_PROCESS, 0, 19);
            libc::syscall(libc::SYS_ioprio_set, 1, 0, IDLE_IO);
            Ok(())
        });
    }
    let mut child = command.spawn().context("cryptsetup couldn't be started")?;
    if let Some(mut input) = child.stdin.take() {
        std::io::Write::write_all(&mut input, key.bytes())?;
    }
    Ok(child)
}

fn follow(child: &mut Child, report: &mut impl FnMut(Progress)) -> bool {
    let Some(output) = child.stdout.take() else {
        return false;
    };
    let (sender, receiver) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        for line in BufReader::new(output).lines().map_while(Result::ok) {
            if sender.send(line).is_err() {
                break;
            }
        }
    });
    loop {
        match receiver.recv_timeout(BATTERY_CHECK) {
            Ok(line) => {
                if let Ok(line) = serde_json::from_str::<Line>(&line) {
                    let done = line.device_bytes.parse::<f64>().unwrap_or(0.0);
                    let size = line.device_size.parse::<f64>().unwrap_or(1.0).max(1.0);
                    report(Progress {
                        done: (done / size).clamp(0.0, 1.0),
                        remaining_seconds: line.eta_ms.parse::<u64>().unwrap_or(0) / 1000,
                    });
                }
            }
            Err(std::sync::mpsc::RecvTimeoutError::Timeout) => {}
            Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => {
                return child.wait().is_ok_and(|status| status.success());
            }
        }
        if power::on_battery() {
            unsafe { libc::kill(child.id() as libc::c_int, libc::SIGTERM) };
            let _ = child.wait();
            return false;
        }
    }
}

fn key_for(plan: &Plan) -> Result<Secret> {
    let device = plan.partition();
    keyring::take("recovery-key")
        .into_iter()
        .chain(keys::escrowed())
        .chain(keyring::systemd_cached())
        .find(|key| keys::opens(&device, plan.header.as_deref(), key))
        .ok_or_else(|| NeedsKey.into())
}

fn finish_encrypting(plan: &Plan, key: &Secret) -> Result<()> {
    let disk = SystemDisk::find()?;
    let device = plan.partition();
    let header =
        luks::read(&device, None, disk.size())?.context("The disk lost its encryption header")?;
    let header = if header.has(luks::RECOVERY) {
        header
    } else {
        keys::add_recovery_token(&device, 0)?;
        luks::read(&device, None, disk.size())?.context("The disk lost its encryption header")?
    };
    let options = match plan.mode {
        Mode::Tpm => {
            keys::enroll_tpm(&device, key, &keys::pin_kept_for_later())?;
            keys::forget_kept_pin();
            "discard,tpm2-device=auto"
        }
        Mode::Passphrase => {
            if header.passphrase_slots().is_empty() {
                let passphrase = keyring::take("passphrase").ok_or(NeedsKey)?;
                keys::add_keyslot(&device, key, &passphrase, &header)?;
            }
            "discard"
        }
    };
    state::set_crypttab(
        &plan.mapping(),
        Some(format!(
            "{} UUID={} none {options}",
            plan.mapping(),
            plan.uuid
        )),
    )?;
    cmdline::change(
        &[format!("rd.luks.uuid={}", plan.mapping())],
        &["rd.luks.uuid", "rd.luks.data", "rd.luks.options"],
    )?;
    stage::remove();
    rebuild_boot_files()?;
    Plan::finish();
    keyring::forget("recovery-key");
    keyring::forget("passphrase");
    Ok(())
}

fn finish_decrypting(plan: &Plan) -> Result<()> {
    stage::remove();
    rebuild_boot_files()?;
    if let Some(header) = &plan.header {
        let _ = std::fs::remove_file(header);
    }
    keys::forget_escrow();
    Plan::finish();
    Ok(())
}

fn abandon_start() -> Result<()> {
    stage::remove();
    keys::forget_escrow();
    keys::forget_kept_pin();
    Plan::finish();
    let _ = std::fs::remove_file(RESULT);
    rebuild_boot_files()
}

pub fn run(plan: &Plan, mut report: impl FnMut(Progress)) -> Result<bool> {
    let disk = SystemDisk::find()?;
    let header = luks::read(&plan.partition(), plan.header.as_deref(), disk.size())?;
    if plan.change == Change::Encrypt && header.is_none() {
        if std::fs::read_to_string(RESULT).is_ok_and(|result| result == "failed") {
            abandon_start()?;
        }
        return Ok(false);
    }
    let Some(header) = header else {
        bail!("The disk lost its encryption header");
    };
    let key = key_for(plan)?;
    if header.reencrypting.is_some() {
        if power::on_battery() {
            return Ok(false);
        }
        let mut child = spawn(plan, &key)?;
        if !follow(&mut child, &mut report) {
            return Ok(false);
        }
    }
    match plan.change {
        Change::Encrypt => finish_encrypting(plan, &key)?,
        Change::Decrypt => finish_decrypting(plan)?,
    }
    Ok(true)
}
