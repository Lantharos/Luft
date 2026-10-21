use std::path::Path;

use anyhow::{Context, Result};
use luft_i18n::t;
use luft_trust::{TRUST, get, group};

use super::drive::target::Mounted;
use crate::L10N;
use crate::system::command::Tool;
use crate::system::wait;

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

pub fn ask_shim_to_trust_luft() -> Result<String> {
    let properties = wait(TRUST.read())
        .map_err(anyhow::Error::msg)?
        .ok_or_else(|| anyhow::anyhow!(luft_trust::unavailable()))?;
    let secure_boot = get::<String>(&properties, "SecureBoot");
    let key = get::<String>(&group(&properties, "SigningKey"), "State");
    if secure_boot.as_deref() != Some("on") || key.as_deref() == Some("enrolled") {
        return Ok(String::new());
    }
    wait(luft_trust::call(&TRUST, "EnrollSigningKey", &()))
        .map_err(anyhow::Error::msg)
        .with_context(|| t!(L10N, "installer-key-queue-failed"))
}
