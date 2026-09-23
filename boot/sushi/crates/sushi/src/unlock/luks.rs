//! LUKS unlock via TPM unseal, EFI handoff key, and cryptsetup.

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::{Duration, Instant};

use anyhow::{Context, Result};
use crate::core::{SushiEvent, SushiEventKind, SushiStage, VisualFlags, VisualMode};
use crate::log::log_event;

pub const EFI_LUKS_KEY_PATH: &str = "/run/sushi/efi-luks-key";
pub const TPM2_STORE_ROOT: &str = "/etc/sushi/tpm2";
pub const DEFAULT_PCRS: &[u32] = &[0, 2, 4, 7];

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CrypttabEntry {
    pub name: String,
    pub device: String,
    pub keyfile: Option<String>,
    pub options: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum UnlockOutcome {
    NothingToDo,
    Unlocked { name: String, via_tpm: bool },
    NeedsPassphrase(CrypttabEntry),
}

pub struct LuksUnlock;

impl LuksUnlock {
    /// Load `dm_crypt` when the kernel ships it as a module (typical on Fedora).
    pub fn prepare_kernel() -> Result<()> {
        ensure_dm_crypt_module()
    }

    pub fn pending_entries() -> Vec<CrypttabEntry> {
        parse_crypttab("/etc/crypttab")
            .into_iter()
            .filter(|e| !is_mapper_open(&e.name))
            .filter(|e| e.options.iter().any(|o| o == "luks" || o.starts_with("luks,")))
            .collect()
    }

    pub fn try_silent_unlock(state: &mut crate::core::SushiVisualState) -> UnlockOutcome {
        let entries = Self::pending_entries();
        if entries.is_empty() {
            return UnlockOutcome::NothingToDo;
        }

        if tpm_store_present() {
            state.flags |= VisualFlags::TPM_CONFIGURED;
        }

        for entry in entries {
            log_event(&SushiEvent::new(SushiStage::Initramfs, SushiEventKind::UnlockTpmTry));
            state.flags |= VisualFlags::TPM_TRIED;

            if let Some(pass) = try_efi_handoff_key() {
                if unlock_entry(&entry, &pass).is_ok() {
                    wipe_str(&pass);
                    mark_success(state, &entry.name);
                    return UnlockOutcome::Unlocked {
                        name: entry.name,
                        via_tpm: true,
                    };
                }
                wipe_str(&pass);
            }

            if let Some(pass) = try_tpm_unseal(&entry) {
                if unlock_entry(&entry, &pass).is_ok() {
                    wipe_str(&pass);
                    mark_success(state, &entry.name);
                    return UnlockOutcome::Unlocked {
                        name: entry.name,
                        via_tpm: true,
                    };
                }
                wipe_str(&pass);
            }

            if try_systemd_tpm_attach(&entry) {
                mark_success(state, &entry.name);
                return UnlockOutcome::Unlocked {
                    name: entry.name,
                    via_tpm: true,
                };
            }

            state.flags |= VisualFlags::MANUAL_UNLOCK;
            log_event(&SushiEvent::new(
                SushiStage::Initramfs,
                SushiEventKind::UnlockManualRequired,
            ));
            return UnlockOutcome::NeedsPassphrase(entry);
        }

        UnlockOutcome::NothingToDo
    }

    pub fn unlock_with_passphrase(entry: &CrypttabEntry, passphrase: &str) -> Result<()> {
        unlock_entry(entry, passphrase).context("LUKS unlock failed")
    }

    pub fn try_reseal(entry: &CrypttabEntry, passphrase: &str) -> Result<()> {
        if !command_exists("tpm2_createprimary")
            || !command_exists("tpm2_create")
            || !command_exists("tpm2_load")
        {
            anyhow::bail!("tpm2 tools not available in initramfs");
        }

        let store = tpm_store_dir(&entry.name);
        fs::create_dir_all(&store).context("create tpm2 store")?;

        let primary = store.join("primary.ctx");
        let policy = store.join("policy.digest");
        let pub_path = store.join("sealed.pub");
        let priv_path = store.join("sealed.priv");
        let sealed_ctx = store.join("sealed.ctx");

        let pcr_list = pcr_policy_string(DEFAULT_PCRS);
        let status = Command::new("tpm2_createprimary")
            .args(["-C", "e", "-g", "sha256", "-G", "rsa2048", "-c"])
            .arg(&primary)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .context("tpm2_createprimary")?;
        if !status.success() {
            anyhow::bail!("tpm2_createprimary failed");
        }

        let status = Command::new("tpm2_createpolicy")
            .args(["--policy-pcr", "-l", &pcr_list, "-L", policy.to_str().unwrap()])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .context("tpm2_createpolicy")?;
        if !status.success() {
            anyhow::bail!("tpm2_createpolicy failed");
        }

        let mut child = Command::new("tpm2_create")
            .args([
                "-C",
                primary.to_str().unwrap(),
                "-g",
                "sha256",
                "-G",
                "keyedhash",
                "-u",
                pub_path.to_str().unwrap(),
                "-r",
                priv_path.to_str().unwrap(),
                "-L",
                policy.to_str().unwrap(),
                "-p",
                &format!("pcrsha256:{}", pcr_digits(DEFAULT_PCRS)),
                "-i-",
            ])
            .stdin(Stdio::piped())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .context("tpm2_create")?;
        child
            .stdin
            .as_mut()
            .context("tpm2_create stdin")?
            .write_all(passphrase.as_bytes())?;
        if !child.wait()?.success() {
            anyhow::bail!("tpm2_create failed");
        }

        let status = Command::new("tpm2_load")
            .args([
                "-C",
                primary.to_str().unwrap(),
                "-u",
                pub_path.to_str().unwrap(),
                "-r",
                priv_path.to_str().unwrap(),
                "-c",
                sealed_ctx.to_str().unwrap(),
            ])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .context("tpm2_load")?;
        if !status.success() {
            anyhow::bail!("tpm2_load failed");
        }

        log_event(&SushiEvent::new(
            SushiStage::Initramfs,
            SushiEventKind::UnlockTpmResealSuccess,
        ));
        Ok(())
    }
}

fn mark_success(state: &mut crate::core::SushiVisualState, name: &str) {
    log_event(&SushiEvent::new(
        SushiStage::Initramfs,
        SushiEventKind::UnlockTpmSuccess,
    ));
    state.flags |= VisualFlags::TPM_SUCCESS;
    state.set_mode(VisualMode::Booting);
    state.set_status(format!("Unlocked {name}"));
}

fn parse_crypttab(path: impl AsRef<Path>) -> Vec<CrypttabEntry> {
    let Ok(data) = fs::read_to_string(path.as_ref()) else {
        return Vec::new();
    };
    data.lines()
        .filter_map(parse_crypttab_line)
        .collect()
}

fn parse_crypttab_line(line: &str) -> Option<CrypttabEntry> {
    let line = line.split('#').next()?.trim();
    if line.is_empty() {
        return None;
    }
    let mut parts = line.split_whitespace();
    let name = parts.next()?.to_string();
    let device = parts.next()?.to_string();
    let keyfile = parts.next().filter(|k| *k != "-").map(str::to_string);
    let options = parts
        .next()
        .map(|o| o.split(',').map(str::to_string).collect())
        .unwrap_or_default();
    Some(CrypttabEntry {
        name,
        device,
        keyfile,
        options,
    })
}

fn is_mapper_open(name: &str) -> bool {
    Path::new(&format!("/dev/mapper/{name}")).exists()
}

fn try_efi_handoff_key() -> Option<String> {
    let data = fs::read_to_string(EFI_LUKS_KEY_PATH).ok()?;
    let key = data.trim().to_string();
    if key.is_empty() {
        return None;
    }
    let _ = fs::remove_file(EFI_LUKS_KEY_PATH);
    Some(key)
}

fn try_tpm_unseal(entry: &CrypttabEntry) -> Option<String> {
    if !command_exists("tpm2_unseal") {
        return None;
    }
    let store = tpm_store_for_entry(entry);
    let primary = store.join("primary.ctx");
    let sealed_ctx = store.join("sealed.ctx");
    let policy = store.join("policy.digest");
    if !primary.is_file() || !sealed_ctx.is_file() || !policy.is_file() {
        return None;
    }

    let session = store.join("session.ctx");
    let _ = fs::remove_file(&session);

    let status = Command::new("tpm2_startauthsession")
        .args(["-S", session.to_str()?])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .ok()?;
    if !status.success() {
        return None;
    }

    let pcr_list = pcr_policy_string(DEFAULT_PCRS);
    let status = Command::new("tpm2_policypcr")
        .args([
            "-S",
            session.to_str()?,
            "-l",
            &pcr_list,
            "-L",
            policy.to_str()?,
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .ok()?;
    if !status.success() {
        return None;
    }

    let output = Command::new("tpm2_unseal")
        .args([
            "-p",
            &format!("session:{}+{}", session.display(), policy.display()),
            "-c",
            sealed_ctx.to_str()?,
            "-o",
            "-",
        ])
        .output()
        .ok()?;
    let _ = fs::remove_file(&session);
    if !output.status.success() {
        return None;
    }
    String::from_utf8(output.stdout)
        .ok()
        .map(|s| s.trim_end_matches('\n').to_string())
        .filter(|s| !s.is_empty())
}

fn try_systemd_tpm_attach(entry: &CrypttabEntry) -> bool {
    if !entry.options.iter().any(|o| o.starts_with("tpm2-device")) {
        return false;
    }
    if !command_exists("systemd-cryptsetup") {
        return false;
    }
    let status = Command::new("systemd-cryptsetup")
        .arg("attach")
        .arg(&entry.name)
        .arg(&entry.device)
        .arg("-")
        .args(crypttab_option_args(&entry.options))
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();
    status
        .ok()
        .map(|s| s.success() && is_mapper_open(&entry.name))
        .unwrap_or(false)
}

fn crypttab_option_args(options: &[String]) -> Vec<String> {
    let mut out = Vec::new();
    for opt in options {
        if opt == "luks" {
            continue;
        }
        out.push(opt.clone());
    }
    out
}

fn unlock_entry(entry: &CrypttabEntry, passphrase: &str) -> Result<()> {
    ensure_dm_crypt_module().context("load dm_crypt module")?;
    let device = resolve_device(&entry.device)?;
    wait_for_block_device(&device)?;

    if command_exists("systemd-cryptsetup") {
        let mut cmd = Command::new("systemd-cryptsetup");
        cmd.arg("attach")
            .arg(&entry.name)
            .arg(&entry.device)
            .arg("-")
            .args(crypttab_option_args(&entry.options))
            .stdin(Stdio::piped())
            .stderr(Stdio::piped());
        let mut child = cmd.spawn().context("spawn systemd-cryptsetup")?;
        feed_passphrase_stdin(&mut child, passphrase)?;
        let output = child.wait_with_output().context("systemd-cryptsetup")?;
        if output.status.success() && is_mapper_open(&entry.name) {
            return Ok(());
        }
        let stderr = String::from_utf8_lossy(&output.stderr);
        if !stderr.trim().is_empty() {
            crate::log::log_info(
                SushiStage::Initramfs,
                &format!("systemd-cryptsetup: {}", stderr.trim()),
            );
        }
    }

    if command_exists("cryptsetup") {
        let attempts: &[&[&str]] = &[
            &["open", "--type", "luks2", "--key-file", "-"],
            &["open", "--type", "luks", "--key-file", "-"],
            &["open", "--key-file", "-"],
        ];
        for args in attempts {
            let mut cmd = Command::new("cryptsetup");
            cmd.args(*args)
                .arg(&device)
                .arg(&entry.name)
                .stdin(Stdio::piped())
                .stdout(Stdio::null())
                .stderr(Stdio::piped());
            let mut child = cmd.spawn().context("spawn cryptsetup")?;
            feed_passphrase_stdin(&mut child, passphrase)?;
            let output = child.wait_with_output().context("cryptsetup")?;
            if output.status.success() && is_mapper_open(&entry.name) {
                return Ok(());
            }
            let stderr = String::from_utf8_lossy(&output.stderr);
            if !stderr.trim().is_empty() {
                crate::log::log_info(
                    SushiStage::Initramfs,
                    &format!("cryptsetup {args:?}: {}", stderr.trim()),
                );
            }
        }
    }

    anyhow::bail!("cryptsetup/systemd-cryptsetup unavailable or unlock rejected for {}", device);
}

/// Passphrase bytes only — no trailing newline. LUKS volumes are often formatted with `echo -n`.
fn feed_passphrase_stdin(child: &mut std::process::Child, passphrase: &str) -> Result<()> {
    if let Some(stdin) = child.stdin.as_mut() {
        stdin.write_all(passphrase.as_bytes())?;
        stdin.flush()?;
    }
    child.stdin.take();
    Ok(())
}

fn ensure_dm_crypt_module() -> Result<()> {
    if Path::new("/sys/module/dm_crypt").exists() {
        return Ok(());
    }

    for modprobe in ["/usr/sbin/modprobe", "/sbin/modprobe"] {
        if !Path::new(modprobe).exists() {
            continue;
        }
        let output = Command::new(modprobe)
            .arg("dm_crypt")
            .output()
            .with_context(|| format!("run {modprobe} dm_crypt"))?;
        if output.status.success() && Path::new("/sys/module/dm_crypt").exists() {
            return Ok(());
        }
        if !output.stderr.is_empty() {
            crate::log::log_info(
                SushiStage::Initramfs,
                &format!(
                    "{modprobe} dm_crypt: {}",
                    String::from_utf8_lossy(&output.stderr).trim()
                ),
            );
        }
    }

    let kver = fs::read_to_string("/proc/sys/kernel/osrelease")
        .context("read kernel release")?
        .trim()
        .to_string();
    let ko = format!("/lib/modules/{kver}/kernel/drivers/md/dm-crypt.ko.xz");
    if Path::new(&ko).exists() {
        for insmod in ["/usr/sbin/insmod", "/sbin/insmod"] {
            if !Path::new(insmod).exists() {
                continue;
            }
            let output = Command::new(insmod)
                .arg(&ko)
                .output()
                .with_context(|| format!("run {insmod} {ko}"))?;
            if output.status.success() && Path::new("/sys/module/dm_crypt").exists() {
                return Ok(());
            }
            if !output.stderr.is_empty() {
                crate::log::log_info(
                    SushiStage::Initramfs,
                    &format!(
                        "{insmod} dm_crypt: {}",
                        String::from_utf8_lossy(&output.stderr).trim()
                    ),
                );
            }
        }
    }

    anyhow::bail!(
        "dm_crypt kernel module is not loaded; bundle it in the initramfs for LUKS unlock"
    );
}

fn wait_for_block_device(path: &str) -> Result<()> {
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if Path::new(path).exists() {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(25));
    }
    anyhow::bail!("block device not found: {path}");
}

fn resolve_device(spec: &str) -> Result<String> {
    if spec.starts_with("UUID=") {
        let uuid = &spec[5..];
        let link = format!("/dev/disk/by-uuid/{uuid}");
        if Path::new(&link).exists() {
            return Ok(link);
        }
    }
    if spec.starts_with("/dev/") {
        return Ok(spec.to_string());
    }
    Ok(spec.to_string())
}

fn tpm_store_dir(name: &str) -> PathBuf {
    PathBuf::from(TPM2_STORE_ROOT).join(name)
}

fn tpm_store_for_entry(entry: &CrypttabEntry) -> PathBuf {
    let installed = tpm_store_dir(&entry.name);
    if installed.is_dir() {
        return installed;
    }
    let efi = PathBuf::from("/run/sushi/efi-tpm").join(&entry.name);
    if efi.is_dir() {
        return efi;
    }
    installed
}

fn tpm_store_present() -> bool {
    Path::new(TPM2_STORE_ROOT).is_dir()
}

fn pcr_policy_string(pcrs: &[u32]) -> String {
    format!("sha256:{}", pcr_digits(pcrs))
}

fn pcr_digits(pcrs: &[u32]) -> String {
    pcrs.iter()
        .map(|p| p.to_string())
        .collect::<Vec<_>>()
        .join(",")
}

fn command_exists(cmd: &str) -> bool {
    if let Ok(path) = std::env::var("PATH") {
        for dir in path.split(':').filter(|d| !d.is_empty()) {
            if Path::new(dir).join(cmd).is_file() {
                return true;
            }
        }
    }
    for dir in ["/usr/sbin", "/usr/bin", "/sbin", "/bin"] {
        if Path::new(dir).join(cmd).is_file() {
            return true;
        }
    }
    Command::new("sh")
        .arg("-c")
        .arg(format!("command -v {cmd}"))
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

fn wipe_str(value: &str) {
    let mut buf = value.to_string();
    crate::unlock::secure_wipe(&mut buf);
}