use std::path::Path;

use anyhow::{Context, Result};
use luft_i18n::t;
use serde::Deserialize;

use super::drive::target::Mounted;
use crate::L10N;
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

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct SigningKey {
    state: Reply<String>,
}

pub fn place(mounted: &Mounted, at: &Path) -> Result<()> {
    std::fs::create_dir_all(at)?;
    Tool::new("mount").arg(&mounted.esp).arg(at).run()?;
    let placed = Tool::new("trustctl")
        .args(["startup", "install", "--esp"])
        .arg(at)
        .run()
        .with_context(|| t!(L10N, "installer-boot-menu-failed"));
    let unmounted = Tool::new("umount").arg(at).run();
    placed.and(unmounted)
}

fn property<T: for<'de> Deserialize<'de>>(name: &str) -> Result<T> {
    let reply = Tool::new("busctl")
        .args(["--json=short", "get-property"])
        .args(TRUST)
        .arg(name)
        .output()?;
    Ok(serde_json::from_str::<Reply<T>>(&reply)?.data)
}

fn already_trusted() -> Result<bool> {
    Ok(property::<SigningKey>("SigningKey")?.state.data == "enrolled")
}

pub fn ask_shim_to_trust_luft() -> Result<String> {
    if property::<String>("SecureBoot")? != "on" || already_trusted()? {
        return Ok(String::new());
    }
    let reply = Tool::new("busctl")
        .args(["--json=short", "call"])
        .args(TRUST)
        .arg("EnrollSigningKey")
        .output()
        .with_context(|| t!(L10N, "installer-key-queue-failed"))?;
    let (code,): (String,) = serde_json::from_str::<Reply<(String,)>>(&reply)?.data;
    Ok(code)
}
