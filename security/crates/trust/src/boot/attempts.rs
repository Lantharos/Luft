use anyhow::{Context, Result};
use serde_json::Value;

use crate::paths::RUNTIME;
use crate::system::firmware::efi;
use crate::system::host::command::Tool;

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

const SLOTS: [&str; 3] = ["booted", "staged", "rollback"];

fn bootc_status() -> Result<Value> {
    Ok(serde_json::from_str(
        &Tool::new("bootc")
            .args(["status", "--format=json"])
            .output()?,
    )?)
}

fn rollback_queued(status: &Value) -> bool {
    status
        .pointer("/status/rollbackQueued")
        .and_then(Value::as_bool)
        .unwrap_or(false)
}

fn version_of(status: &Value, image: &str) -> Option<String> {
    SLOTS
        .iter()
        .filter_map(|slot| status.pointer(&format!("/status/{slot}")))
        .find(|entry| {
            entry
                .pointer("/composefs/verity")
                .and_then(Value::as_str)
                .is_some_and(|verity| !verity.is_empty() && image.contains(verity))
        })?
        .pointer("/image/version")?
        .as_str()
        .map(display)
}

fn display(version: &str) -> String {
    match version.split_once("-nightly.") {
        Some((release, number)) => format!("Luft {release} Nightly {number}"),
        None => format!("Luft {version}"),
    }
}

fn notice(version: Option<&str>) -> String {
    let update = version.map_or_else(
        || "The update".to_owned(),
        |version| format!("The update to {version}"),
    );
    [
        "title Luft went back to the version you had before",
        &format!("line {update} didn't start on this computer, so Luft is using the version before it."),
        "line Your files and settings are just as you left them. Settings will offer the next update once it's out.",
        "footer Continuing in {seconds} seconds. Press Enter to continue now.",
        "countdown 20",
    ]
    .join("\n")
}

pub fn went_back() -> Result<()> {
    let Some(image) = efi::luft_variable(WENT_BACK) else {
        return Ok(());
    };
    let status = bootc_status()?;
    let version = version_of(&status, &String::from_utf8_lossy(&image));
    if rollback_queued(&status) {
        Tool::new("bootc").arg("rollback").status()?;
    }
    let path = std::path::Path::new(RUNTIME).join(NOTICE);
    std::fs::create_dir_all(RUNTIME)?;
    std::fs::write(&path, notice(version.as_deref()))?;
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
