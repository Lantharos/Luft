use std::ffi::CString;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::Command;

use anyhow::{Context, Result, bail};
use luft_variant::Version;
use serde_json::{Value, json};

use super::file::Organization;
use crate::system::host::command::Tool;
use crate::system::secrets::scratch::Scratch;
use crate::system::secrets::secret::Secret;

const POLICY: &str = "/etc/containers/policy.json";
const REGISTRIES: &str = "/etc/containers/registries.d";
const VERSION: &str = "/config/Labels/org.opencontainers.image.version";

fn status() -> Result<Value> {
    let output = Tool::new("bootc")
        .args(["status", "--format=json"])
        .output_bytes()?;
    Ok(serde_json::from_slice(&output)?)
}

pub fn followed() -> Result<String> {
    status()?
        .pointer("/spec/image/image")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .context("This system doesn't get its updates from an image.")
}

fn version(status: &Value, slot: &str) -> Option<Version> {
    let digest = status
        .pointer(&format!("/status/{slot}/image/imageDigest"))?
        .as_str()?;
    let config = Tool::new("bootc")
        .args([
            "internals",
            "cfs",
            "oci",
            "inspect",
            &format!("@{digest}"),
            "--config",
        ])
        .output_bytes()
        .ok()?;
    let config: Value = serde_json::from_slice(&config).ok()?;
    Version::parse(config.pointer(VERSION)?.as_str()?)
}

/// The containers policy this system has, with `organization`'s signing key required for its
/// repository.
fn policy(organization: &Organization) -> Result<Vec<u8>> {
    let mut policy: Value = serde_json::from_slice(&std::fs::read(POLICY)?)?;
    let rules = policy
        .pointer_mut("/transports/docker")
        .and_then(Value::as_object_mut)
        .context("The containers policy has no rules for registries.")?;
    rules.insert(
        organization.repository().to_owned(),
        json!([{
            "type": "sigstoreSigned",
            "keyPath": organization.signing_key,
            "signedIdentity": { "type": "matchRepository" },
        }]),
    );
    Ok(serde_json::to_vec_pretty(&policy)?)
}

fn c_path(path: &Path) -> Result<CString> {
    Ok(CString::new(path.as_os_str().as_bytes())?)
}

fn bind(source: &CString, target: &CString) -> std::io::Result<()> {
    let done = unsafe {
        libc::mount(
            source.as_ptr(),
            target.as_ptr(),
            std::ptr::null(),
            libc::MS_BIND,
            std::ptr::null(),
        )
    };
    if done == 0 {
        Ok(())
    } else {
        Err(std::io::Error::last_os_error())
    }
}

/// Runs bootc in a mount namespace of its own, where the containers policy requires the
/// organization's signature for its image, so the very first download is checked against the
/// key the administrator handed over. The system's own /etc stays as it was, and the image
/// brings that rule along from then on.
fn switch_checked(organization: &Organization, image: &str) -> Result<()> {
    let scratch = Scratch::empty()?;
    let policy = scratch.write("policy.json", &Secret::new(policy(organization)?))?;
    let registries = scratch.directory().join("registries.d");
    std::fs::create_dir(&registries)?;
    for entry in std::fs::read_dir(REGISTRIES)? {
        let entry = entry?;
        std::fs::copy(entry.path(), registries.join(entry.file_name()))?;
    }
    std::fs::write(
        registries.join("organization.yaml"),
        format!(
            "docker:\n  {}:\n    use-sigstore-attachments: true\n",
            organization.repository()
        ),
    )?;
    let mounts = [
        (c_path(&policy)?, c_path(Path::new(POLICY))?),
        (c_path(&registries)?, c_path(Path::new(REGISTRIES))?),
    ];
    let root = CString::new("/")?;
    let mut command = Command::new("bootc");
    command.args(["switch", "--transport", "registry", image]);
    unsafe {
        command.pre_exec(move || {
            if libc::unshare(libc::CLONE_NEWNS) != 0
                || libc::mount(
                    std::ptr::null(),
                    root.as_ptr(),
                    std::ptr::null(),
                    libc::MS_REC | libc::MS_PRIVATE,
                    std::ptr::null(),
                ) != 0
            {
                return Err(std::io::Error::last_os_error());
            }
            mounts
                .iter()
                .try_for_each(|(source, target)| bind(source, target))
        });
    }
    if !command.status().context("Starting bootc")?.success() {
        bail!(
            "bootc couldn't switch to {image}. Is it published, and signed with {}'s key?",
            organization.name
        );
    }
    Ok(())
}

/// Switches to `image`, checked against the organization's key, and takes it away again when
/// it's older than the running version, as the updater does.
pub fn switch(organization: &Organization, image: &str) -> Result<()> {
    switch_checked(organization, image)?;
    let status = status()?;
    let older = version(&status, "booted")
        .is_some_and(|running| version(&status, "staged").is_none_or(|staged| staged < running));
    if !older {
        return Ok(());
    }
    if let Some(staged) = status
        .pointer("/status/staged/composefs/verity")
        .and_then(Value::as_str)
    {
        Tool::new("bootc")
            .args(["delete-deployment", staged])
            .status()?;
    }
    bail!(
        "{} is older than the version of Luft on this computer, so it wasn't installed.",
        image
    )
}
