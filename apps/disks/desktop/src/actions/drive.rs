use super::mounting;
use crate::udisks::{self, ATA, DRIVE, NVME, TABLE, no_options};

pub fn safely_remove(drive: &str, block: &str) -> Result<(), String> {
    let objects = udisks::objects()?;
    let partitions = objects
        .get(block, TABLE)
        .and_then(|table| table.get::<Vec<zbus::zvariant::OwnedObjectPath>>("Partitions"))
        .unwrap_or_default();
    for partition in &partitions {
        mounting::release_in(&objects, partition.as_str())?;
    }
    mounting::release_in(&objects, block)?;
    let info = objects.get(drive, DRIVE).ok_or("This drive is gone")?;
    if info.flag("CanPowerOff") {
        udisks::run(drive, DRIVE, "PowerOff", &(no_options(),))
    } else {
        udisks::run(drive, DRIVE, "Eject", &(no_options(),))
    }
}

fn health_interface(drive: &str) -> Result<&'static str, String> {
    let objects = udisks::objects()?;
    if objects.get(drive, ATA).is_some() {
        Ok(ATA)
    } else if objects.get(drive, NVME).is_some() {
        Ok(NVME)
    } else {
        Err("This drive can't test itself".to_owned())
    }
}

pub fn start_selftest(drive: &str, extended: bool) -> Result<(), String> {
    let kind = if extended { "extended" } else { "short" };
    udisks::run(
        drive,
        health_interface(drive)?,
        "SmartSelftestStart",
        &(kind, no_options()),
    )
}

pub fn stop_selftest(drive: &str) -> Result<(), String> {
    udisks::run(
        drive,
        health_interface(drive)?,
        "SmartSelftestAbort",
        &(no_options(),),
    )
}
