use std::collections::BTreeMap;
use std::fs::File;
use std::io::{BufRead, BufReader, Read};
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::os::unix::process::CommandExt;
use std::process::{Child, ChildStderr, Command, Stdio};
use std::sync::{Arc, Mutex};

use anyhow::{Context, Result, anyhow, bail};
use luft_variant::{Variant, Version};
use serde::Deserialize;
use serde_json::{Map, Value, json};

use crate::command::{self, run};
use crate::progress::Pull;

const BOOTC: &str = "bootc";
const REGISTRY: &str = "registry";
const PROGRESS_FD: i32 = 3;
const CHECK_TIMEOUT: &str = "2m";
const SLOTS: [&str; 3] = ["booted", "staged", "rollback"];
const UNSIGNED: &str = "This update isn't signed by Luft, so it wasn't downloaded.";
const OLDER: &str =
    "This update is older than the version of Luft on this computer, so it wasn't installed.";
const VERSION: &str = "/config/Labels/org.opencontainers.image.version";
const STAGED: &str = "/status/staged/composefs/verity";
const KEPT_TO_GO_BACK_TO: &str = "same fs-verity digest as the existing Some(Rollback) deployment";
const SIGNATURE_REFUSALS: [&str; 4] = [
    "A signature was required",
    "signature verification failed",
    "is not accepted",
    "rejected by policy",
];

fn unsigned(errors: &[u8]) -> bool {
    let errors = String::from_utf8_lossy(errors);
    SIGNATURE_REFUSALS
        .iter()
        .any(|refusal| errors.contains(refusal))
}

fn bootc(arguments: &[&str]) -> Result<Vec<u8>> {
    run(Command::new(BOOTC).args(arguments))
}

fn host() -> Result<Value> {
    Ok(serde_json::from_slice(&bootc(&[
        "status",
        "--format=json",
    ])?)?)
}

fn inspect(digest: &str) -> Option<Value> {
    let reference = format!("@{digest}");
    let config = bootc(&["internals", "cfs", "oci", "inspect", &reference, "--config"])
        .inspect_err(|error| eprintln!("Reading the image config of {digest}: {error:#}"))
        .ok()?;
    let config: Value = serde_json::from_slice(&config).ok()?;
    Some(json!({
        "created": config["created"],
        "config": { "Labels": config["config"]["Labels"] },
        "rootfs": { "diff_ids": config["rootfs"]["diff_ids"] },
    }))
}

/// The config of an image on the computer. A digest names one image for good, so each is read
/// once.
fn image_config(digest: &str) -> Option<Value> {
    static KNOWN: Mutex<BTreeMap<String, Value>> = Mutex::new(BTreeMap::new());
    let mut known = KNOWN.lock().expect("image configs");
    if !known.contains_key(digest) {
        known.insert(digest.to_owned(), inspect(digest)?);
    }
    known.get(digest).cloned()
}

fn digests(host: &Value) -> impl Iterator<Item = &str> {
    SLOTS.iter().filter_map(move |slot| {
        host.pointer(&format!("/status/{slot}/image/imageDigest"))
            .and_then(Value::as_str)
    })
}

fn slot_config(host: &Value, slot: &str) -> Option<Value> {
    image_config(
        host.pointer(&format!("/status/{slot}/image/imageDigest"))?
            .as_str()?,
    )
}

fn version(config: &Value) -> Option<Version> {
    Version::parse(config.pointer(VERSION)?.as_str()?)
}

/// Whether an image is older than the running one, going by the version in its configuration,
/// which the image's signature covers. A running system without a version of Luft's, such as
/// a development build, has nothing to be older than.
fn older_than_running(host: &Value, config: Option<&Value>) -> bool {
    slot_config(host, "booted")
        .as_ref()
        .and_then(version)
        .is_some_and(|running| {
            config
                .and_then(version)
                .is_none_or(|offered| offered < running)
        })
}

/// Takes a staged version that's older than the running one away again. Only going back to
/// the version kept on the computer may start an older one.
fn refuse_older() -> Result<()> {
    let host = host()?;
    let Some(staged) = host.pointer(STAGED).and_then(Value::as_str) else {
        return Ok(());
    };
    if !older_than_running(&host, slot_config(&host, "staged").as_ref()) {
        return Ok(());
    }
    bootc(&["delete-deployment", staged])?;
    bail!(OLDER);
}

pub fn status() -> Result<String> {
    let host = host()?;
    let configs: Map<String, Value> = digests(&host)
        .filter_map(|digest| Some((digest.to_owned(), image_config(digest)?)))
        .collect();
    Ok(json!({ "host": host, "configs": configs }).to_string())
}

fn layers(config: &Value) -> Option<&Value> {
    config.pointer("/rootfs/diff_ids")
}

/// Whether the image this system follows has changed from every version on the computer.
pub fn available() -> Result<bool> {
    let host = host()?;
    let Reference { image, transport } = followed(&host)?;
    if transport != REGISTRY {
        return Ok(false);
    }
    let offered: Value = serde_json::from_slice(&run(Command::new("skopeo")
        .args(["--command-timeout", CHECK_TIMEOUT, "inspect", "--config"])
        .arg(format!("docker://{image}")))?)?;
    if older_than_running(&host, Some(&offered)) {
        eprintln!("The update server offers a version older than the running one.");
        return Ok(false);
    }
    let offered = layers(&offered).context("The update server sent no image layers.")?;
    let present = digests(&host)
        .filter_map(image_config)
        .any(|config| layers(&config) == Some(offered));
    Ok(!present)
}

pub fn rollback() -> Result<()> {
    bootc(&["rollback"]).map(drop)
}

fn start_kept_version() -> Result<()> {
    let host = host()?;
    if older_than_running(&host, slot_config(&host, "rollback").as_ref()) {
        bail!(OLDER);
    }
    if host.pointer("/spec/bootOrder").and_then(Value::as_str) == Some("rollback") {
        return Ok(());
    }
    rollback()
}

pub fn apply() -> Result<()> {
    refuse_older()?;
    bootc(&["upgrade", "--from-downloaded"]).map(drop)
}

fn pipe() -> Result<(File, OwnedFd)> {
    let mut ends = [0; 2];
    if unsafe { libc::pipe2(ends.as_mut_ptr(), libc::O_CLOEXEC) } != 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    let (read, write) = unsafe { (File::from_raw_fd(ends[0]), OwnedFd::from_raw_fd(ends[1])) };
    Ok((read, write))
}

#[derive(Deserialize)]
pub struct Reference {
    image: String,
    transport: String,
}

fn followed(host: &Value) -> Result<Reference> {
    host.pointer("/spec/image")
        .and_then(|image| Reference::deserialize(image).ok())
        .ok_or_else(|| anyhow!("This system doesn't get its updates from an image."))
}

pub fn switch_target(variant: Variant) -> Result<Reference> {
    let Reference { image, transport } = followed(&host()?)?;
    if Variant::of(&image) == variant {
        bail!("This system already uses that image.");
    }
    let image = variant
        .reference(&image)
        .ok_or_else(|| anyhow!("This system follows one fixed build of its image."))?;
    Ok(Reference { image, transport })
}

/// bootc while it downloads, for stopping it. The process is only signalled while it hasn't
/// been waited for, so its ID can't have passed to another.
#[derive(Clone)]
pub struct Process(Arc<Mutex<Child>>);

impl Process {
    pub fn running(&self) -> bool {
        self.0
            .try_lock()
            .map_or(true, |mut child| matches!(child.try_wait(), Ok(None)))
    }

    pub fn stop(&self) {
        if let Ok(mut child) = self.0.try_lock()
            && let Ok(None) = child.try_wait()
        {
            unsafe { libc::kill(child.id() as i32, libc::SIGTERM) };
        }
    }
}

pub struct Fetch {
    process: Process,
    errors: ChildStderr,
    events: File,
    switching: bool,
}

impl Fetch {
    pub fn upgrade() -> Result<Self> {
        Self::start(&["upgrade", "--download-only"], false)
    }

    pub fn switch(target: &Reference) -> Result<Self> {
        Self::start(
            &["switch", "--transport", &target.transport, &target.image],
            true,
        )
    }

    fn start(arguments: &[&str], switching: bool) -> Result<Self> {
        let (events, writer) = pipe()?;
        let source = writer.as_raw_fd();
        let mut command = Command::new(BOOTC);
        command
            .args(arguments)
            .arg("--quiet")
            .arg(format!("--progress-fd={PROGRESS_FD}"))
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::piped());
        unsafe {
            command.pre_exec(move || match libc::dup2(source, PROGRESS_FD) {
                -1 => Err(std::io::Error::last_os_error()),
                _ => Ok(()),
            });
        }
        let mut child = command.spawn().context("Starting bootc")?;
        drop(writer);
        let errors = child.stderr.take().context("bootc has no error output")?;
        Ok(Self {
            process: Process(Arc::new(Mutex::new(child))),
            errors,
            events,
            switching,
        })
    }

    pub fn process(&self) -> Process {
        self.process.clone()
    }

    pub fn follow(self, mut downloaded: impl FnMut(u64)) -> Result<()> {
        let mut stderr = self.errors;
        let errors = std::thread::spawn(move || {
            let mut text = Vec::new();
            let _ = stderr.read_to_end(&mut text);
            text
        });
        let mut pull = Pull::default();
        let read = BufReader::new(self.events).lines().try_for_each(|line| {
            if let Some(bytes) = pull.update(&line?) {
                downloaded(bytes);
            }
            std::io::Result::Ok(())
        });
        let status = {
            let mut child = self.process.0.lock().expect("bootc");
            if read.is_err() {
                let _ = child.kill();
            }
            child.wait()?
        };
        let errors = errors.join().unwrap_or_default();
        read.context("Following the download")?;
        if !status.success() {
            if status.code().is_none() {
                bail!("The download was stopped.");
            }
            if unsigned(&errors) {
                bail!(UNSIGNED);
            }
            if self.switching && String::from_utf8_lossy(&errors).contains(KEPT_TO_GO_BACK_TO) {
                return start_kept_version();
            }
            return Err(command::failure(BOOTC, &errors));
        }
        refuse_older()
    }
}

#[cfg(test)]
mod tests {
    use super::unsigned;

    #[test]
    fn signature_refusals_are_told_apart_from_other_failures() {
        for refused in [
            "Opening image docker://ghcr.io/lantharos/luft:1-nightly: failed to invoke method OpenImage: A signature was required, but no signature exists",
            "failed to invoke method OpenImage: cryptographic signature verification failed: invalid signature when validating ASN.1 encoded signature",
        ] {
            assert!(unsigned(refused.as_bytes()));
        }
        assert!(!unsigned(
            b"Opening image: pinging container registry ghcr.io: connection refused"
        ));
    }
}
