use std::path::Path;

use anyhow::{Context, Result};
use serde::Deserialize;

use super::drive::target::Mounted;
use crate::system::command::Tool;

const TRUST: [&str; 3] = [
    "com.lantharos.Trust1",
    "/com/lantharos/Trust1",
    "com.lantharos.Trust1",
];

#[derive(Deserialize)]
struct Reply<T> {
    data: T,
}

pub fn place(mounted: &Mounted, at: &Path) -> Result<()> {
    std::fs::create_dir_all(at)?;
    Tool::new("mount").arg(&mounted.esp).arg(at).run()?;
    let placed = Tool::new("trustctl")
        .args(["startup", "install", "--esp"])
        .arg(at)
        .run()
        .context("Luft's boot menu couldn't be put on the EFI system partition");
    let unmounted = Tool::new("umount").arg(at).run();
    placed.and(unmounted)
}

fn secure_boot_on() -> Result<bool> {
    let reply = Tool::new("busctl")
        .args(["--json=short", "get-property"])
        .args(TRUST)
        .arg("SecureBoot")
        .output()?;
    Ok(serde_json::from_str::<Reply<String>>(&reply)?.data == "on")
}

pub fn ask_shim_to_trust_luft() -> Result<String> {
    if !secure_boot_on()? {
        return Ok(String::new());
    }
    let reply = Tool::new("busctl")
        .args(["--json=short", "call"])
        .args(TRUST)
        .arg("EnrollSigningKey")
        .output()
        .context("Luft's Secure Boot key couldn't be queued for the next restart")?;
    let (code,): (String,) = serde_json::from_str::<Reply<(String,)>>(&reply)?.data;
    Ok(code)
}
