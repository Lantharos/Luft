use std::path::Path;

use luft_i18n::t;
use luft_meet::handoff::{self, Folder, Handoff, Intent, Made as Kind};
use luft_meet::regional::Hints;

use super::disks::{self, Block};
use super::efi::Efivars;
use super::esp::{self, Esp};
use super::live::{self, Spots};
use super::machine;
use super::place::{self, Spot};
use crate::L10N;
use crate::boot::entries;
use crate::check::linux::{self, LinuxFacts, Readable, START_FILES};
use crate::linux::record::Made;
use crate::live::build;
use crate::live::durable;
use crate::live::source::Source;
use crate::protocol::{Prepared, Report};
use crate::serving::Context;

const READY: Prepared = Prepared {
    room: 0,
    moving_box: None,
};

pub fn read_handoff(folder: &Path) -> Option<Handoff> {
    Handoff::parse(&std::fs::read_to_string(folder.join(handoff::FILE)).ok()?).ok()
}

pub fn write_handoff(folder: &Path, handoff: &Handoff) -> Result<(), String> {
    durable::write(&folder.join(handoff::FILE), handoff.to_json().as_bytes())
        .map_err(|error| error.to_string())
}

fn prepared(made: &Made) -> Option<&Path> {
    let folder = made.folder.as_deref()?;
    read_handoff(folder).map(|_| folder)
}

pub fn esp_of(blocks: &[Block], made: &Made) -> Result<Esp, String> {
    esp::find(blocks, made.esp.as_deref()).ok_or_else(|| t!(L10N, "drive-no-esp"))
}

pub fn check(source: &Source) -> Result<Report<LinuxFacts>, String> {
    let blocks = disks::blocks()?;
    let made = Made::read();
    let spot = place::choose(&blocks, made.folder.as_deref())?;
    let esp = esp::find(&blocks, made.esp.as_deref());
    let esp_free = esp
        .as_ref()
        .and_then(|esp| esp.open().ok())
        .and_then(|opened| {
            Some(disks::free_space(opened.root())? + disks::used_by(&opened.loader()))
        });
    let facts = LinuxFacts {
        machine: machine::gather(esp.as_ref().is_some_and(|esp| esp.gpt)),
        system: machine::system_name(),
        layout: place::layout(&blocks),
        esp_free,
        place: spot.describe(),
    };
    let listing = build::listing(source)
        .inspect_err(|error| eprintln!("Luft's download isn't reachable: {error}"))
        .ok();
    let live = listing
        .as_ref()
        .map(|listing| live::bytes(&listing.entries));
    let ready = prepared(&made);
    Ok(Report {
        findings: linux::evaluate(&facts, live),
        live: live.unwrap_or(0),
        download: listing.map_or(0, |listing| listing.download),
        smallest_luft: 0,
        most_luft: 0,
        prepared: ready.map(|_| READY),
        outdated: ready.is_some_and(|folder| build::outdated(folder, source)),
        facts,
    })
}

fn spots<'a>(loader: &'a Path, spot: &'a Spot) -> Result<Spots<'a>, String> {
    Ok(Spots {
        loader,
        folder: &spot.folder,
        filesystem: spot.uuid()?,
        on_filesystem: &spot.on_filesystem,
    })
}

fn build(context: &Context, source: &Source, blocks: &[Block], spot: &Spot) -> Result<(), String> {
    let esp = esp_of(blocks, &Made::default())?;
    let opened = esp.open()?;
    let loader = opened.loader();
    if disks::free_space(opened.root()).unwrap_or(0) < START_FILES {
        return Err(t!(L10N, "drive-esp-full"));
    }
    Made::update(|made| {
        made.folder = Some(spot.folder.clone());
        made.esp = Some(esp.partuuid.clone());
    })?;
    live::write(context, source, &spots(&loader, spot)?)?;
    let boot_entry = entries::add(&Efivars, &esp.partition()?, esp::LOADER)?;
    Made::update(|made| made.boot_entry = Some(boot_entry))?;
    let handoff = Handoff {
        intent: Intent::Try,
        boot_entry,
        made: Kind::Folder(Folder {
            esp: esp.partuuid.clone(),
            loader: esp::LOADER_FOLDER.to_owned(),
            filesystem: spot.uuid()?.to_owned(),
            folder: spot.on_filesystem.clone(),
        }),
        hints: Hints::default(),
    };
    write_handoff(&spot.folder, &handoff)
}

pub fn prepare(context: &Context, source: &Source) -> Result<Prepared, String> {
    let made = Made::read();
    if prepared(&made).is_some() {
        return Ok(READY);
    }
    if !made.is_empty() {
        super::undo::undo(context)?;
    }
    let blocks = disks::blocks()?;
    let spot = place::choose(&blocks, None)?;
    if spot.readable != Readable::Yes {
        return Err(t!(L10N, "drive-folder-unreadable"));
    }
    build(context, source, &blocks, &spot).inspect_err(|_| {
        if let Err(error) = super::undo::undo(context) {
            eprintln!("Cleaning up after a failed start didn't work: {error}");
        }
    })?;
    Ok(READY)
}

pub fn refresh(context: &Context, source: &Source) -> Result<Prepared, String> {
    let made = Made::read();
    let Some(folder) = prepared(&made) else {
        return Err(t!(L10N, "helper-not-ready-linux"));
    };
    let blocks = disks::blocks()?;
    let spot = place::choose(&blocks, Some(folder))?;
    let esp = esp_of(&blocks, &made)?;
    let opened = esp.open()?;
    let loader = opened.loader();
    live::rewrite(context, source, &spots(&loader, &spot)?)?;
    Ok(READY)
}
