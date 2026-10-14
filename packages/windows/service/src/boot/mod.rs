mod audio;

use std::fs;
use std::path::Path;
use std::process::Command;

use anyhow::Result;

use crate::installations;

pub const RECORD: &str = "/run/luft-windows/hibernated";
const SETTLE: &str = "--timeout=15";

pub fn run() -> Result<()> {
    let devices: Vec<String> = installations::drives()
        .into_iter()
        .filter(|drive| drive.hibernated)
        .map(|drive| drive.device)
        .collect();
    if devices.is_empty() {
        return Ok(());
    }
    eprintln!(
        "Windows on {} was hibernated or shut down with Fast Startup",
        devices.join(", ")
    );
    fs::create_dir_all(Path::new(RECORD).parent().expect("the record has a folder"))?;
    fs::write(RECORD, devices.join("\n") + "\n")?;
    let _ = Command::new("udevadm").args(["settle", SETTLE]).status();
    audio::reset_codecs();
    Ok(())
}
