use anyhow::{Context, Result};
use serde_json::Value;

use crate::paths::RUNTIME;
use crate::system::command::Tool;
use crate::system::efi;

const GOOD: &str = "LuftBootGood";
const TRIED: &str = "LuftBootTried";
const TRYING: &str = "LuftBootTrying";
const WENT_BACK: &str = "LuftBootWentBack";
const NOTICE: &str = "went-back";

pub fn mark_good() -> Result<()> {
    let Some(image) = efi::luft_variable(TRYING) else {
        return Ok(());
    };
    efi::set_luft_variable(GOOD, Some(&image)).context("Remembering the version that started")?;
    efi::set_luft_variable(TRIED, None).context("Forgetting the startup attempts")?;
    Ok(())
}

fn rollback_queued() -> Result<bool> {
    let status: Value = serde_json::from_str(
        &Tool::new("bootc")
            .args(["status", "--format=json"])
            .output()?,
    )?;
    Ok(status
        .pointer("/status/rollbackQueued")
        .and_then(Value::as_bool)
        .unwrap_or(false))
}

fn notice(version: &str) -> String {
    [
        "title Luft went back to the version you had before",
        &format!("line The update to {version} didn't start on this computer, so Luft is using the version before it."),
        "line Your files and settings are just as you left them. Settings will offer the next update once it's out.",
        "footer Continuing in {seconds} seconds. Press Enter to continue now.",
        "countdown 20",
    ]
    .join("\n")
}

pub fn went_back() -> Result<()> {
    let Some(version) = efi::luft_variable(WENT_BACK) else {
        return Ok(());
    };
    let version = String::from_utf8_lossy(&version);
    if rollback_queued()? {
        Tool::new("bootc").arg("rollback").status()?;
    }
    let path = std::path::Path::new(RUNTIME).join(NOTICE);
    std::fs::create_dir_all(RUNTIME)?;
    std::fs::write(&path, notice(&version))?;
    let shown = Tool::new("sushictl")
        .args(["notice", "show"])
        .arg(&path)
        .status();
    let _ = std::fs::remove_file(&path);
    if let Err(error) = shown {
        eprintln!("Couldn't explain going back to the version before: {error:#}");
    }
    Ok(())
}
