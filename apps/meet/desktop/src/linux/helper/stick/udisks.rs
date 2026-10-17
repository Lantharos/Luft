use std::path::PathBuf;
use std::process::Command;

use crate::stick::drives::linux::Block;

const MOUNTED: &str = "Mounted ";
const AT: &str = " at ";

fn udisksctl(arguments: &[&str]) -> Result<String, String> {
    let output = Command::new("udisksctl")
        .env("LC_ALL", "C.UTF-8")
        .args(arguments)
        .arg("--no-user-interaction")
        .output()
        .map_err(|error| format!("Meet Luft needs UDisks to use the stick: {error}"))?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_owned())
    }
}

pub fn unmount(device: &str) -> Result<(), String> {
    udisksctl(&["unmount", "--block-device", device])
        .map(drop)
        .map_err(|error| format!("{device} is still in use: {error}"))
}

pub fn mount(device: &str) -> Result<PathBuf, String> {
    let said = udisksctl(&["mount", "--block-device", device])
        .map_err(|error| format!("Ventoy's partition couldn't be opened: {error}"))?;
    said.lines()
        .find_map(|line| line.strip_prefix(MOUNTED)?.split_once(AT))
        .map(|(_, place)| PathBuf::from(place.trim_end_matches('.')))
        .ok_or_else(|| format!("UDisks didn't say where it opened {device}"))
}

pub fn release(stick: &Block) -> Result<(), String> {
    for block in std::iter::once(stick).chain(stick.descendants()) {
        if block.mounts().next().is_some() {
            unmount(&block.path)?;
        }
    }
    Ok(())
}

pub fn power_off(disk: &str) -> Result<(), String> {
    udisksctl(&["power-off", "--block-device", disk]).map(drop)
}
