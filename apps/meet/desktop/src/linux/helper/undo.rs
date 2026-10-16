use super::disks;
use super::efi::Efivars;
use super::live;
use super::prepare::{esp_of, read_handoff};
use crate::boot::entries::{self, Variables};
use crate::linux::record::Made;
use crate::protocol::Stage;
use crate::serving::Context;

const STEPS: u64 = 3;

const BOOT_NEXT: &str = "BootNext";

fn forget_boot_next(number: u16) -> Result<(), String> {
    if Efivars.read(BOOT_NEXT)?.as_deref() == Some(&number.to_le_bytes()[..]) {
        Efivars.write(BOOT_NEXT, &[])?;
    }
    Ok(())
}

pub fn undo(context: &Context) -> Result<(), String> {
    let made = Made::read();
    let boot_entry = made.boot_entry.or_else(|| {
        made.folder
            .as_deref()
            .and_then(read_handoff)
            .map(|handoff| handoff.boot_entry)
    });
    context.progress(Stage::Removing, 0, STEPS);
    if let Some(number) = boot_entry {
        forget_boot_next(number)?;
        entries::remove(&Efivars, &[number])?;
        Made::update(|made| made.boot_entry = None)?;
    }
    context.progress(Stage::Removing, 1, STEPS);
    if made.esp.is_some() {
        let blocks = disks::blocks()?;
        let opened = esp_of(&blocks, &made)?.open()?;
        live::remove(&opened.loader())?;
        Made::update(|made| made.esp = None)?;
    }
    context.progress(Stage::Removing, 2, STEPS);
    if let Some(folder) = &made.folder {
        live::remove(folder)?;
    }
    Made::default().save()?;
    context.progress(Stage::Removing, STEPS, STEPS);
    Ok(())
}
