use std::process::Command;

use luft_i18n::t;
use luft_meet::Intent;
use luft_meet::regional::Hints;

use super::disks;
use super::efi::{self, Efivars};
use super::esp;
use super::prepare::{esp_of, read_handoff, write_handoff};
use crate::L10N;
use crate::boot::entries;
use crate::linux::record::Made;
use crate::live::build;

fn reboot() -> Result<(), String> {
    let status = Command::new("systemctl")
        .arg("reboot")
        .status()
        .map_err(|error| error.to_string())?;
    if status.success() {
        Ok(())
    } else {
        Err(t!(L10N, "helper-restart-failed"))
    }
}

pub fn restart(intent: Intent, hints: Hints) -> Result<(), String> {
    let made = Made::read();
    let folder = made
        .folder
        .as_deref()
        .ok_or_else(|| t!(L10N, "helper-not-ready-to-start-linux"))?;
    let mut handoff =
        read_handoff(folder).ok_or_else(|| t!(L10N, "helper-not-ready-to-start-linux"))?;
    if build::unfinished(folder) {
        return Err(t!(L10N, "helper-update-unfinished"));
    }
    let esp = esp_of(&disks::blocks()?, &made)?;
    handoff.boot_entry =
        entries::ensure(&Efivars, &esp.partition()?, esp::LOADER, handoff.boot_entry)?;
    Made::update(|made| made.boot_entry = Some(handoff.boot_entry))?;
    handoff.intent = intent;
    handoff.hints = hints;
    write_handoff(folder, &handoff)?;
    entries::boot_next(&Efivars, handoff.boot_entry)?;
    reboot()
}

pub fn firmware_settings() -> Result<(), String> {
    efi::ask_for_settings()?;
    reboot()
}
