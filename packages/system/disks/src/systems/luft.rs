use luft_trust::{Outcome, TRUST};
use serde::Serialize;
use specta::Type;

use super::{System, find};
use crate::udisks;
use crate::udisks::room::{Reach, Room};
use crate::udisks::snapshot::{self, Drive};
use crate::udisks::volumes::{Segment, Volume};

const MIB: u64 = 1 << 20;
const STAYS_PUT: [(&str, &str); 3] = [
    (
        "c12a7328-f81f-11d2-ba4b-00a0c93ec93b",
        "the EFI system partition",
    ),
    (
        "e3c9e316-0b5c-4db8-817d-f92df00215ae",
        "Windows' reserved partition",
    ),
    (
        "de94bba4-06d1-4d40-a16a-bfd50179d6ac",
        "Windows' recovery partition",
    ),
];
const ONLY_NEXT_TO_LUFT: &str = "Luft can only grow into free space right next to it, so this space can only become a partition of its own.";

#[derive(Serialize, Clone, Copy, Debug, Type)]
#[serde(rename = "LuftGrowth", rename_all = "kebab-case")]
pub enum Growth {
    Now,
    AtStart,
}

#[derive(Serialize, Debug, Type)]
#[serde(
    rename = "LuftGift",
    tag = "kind",
    rename_all = "kebab-case",
    rename_all_fields = "camelCase"
)]
pub enum Gift {
    Ready {
        growth: Growth,
    },
    MoveFirst {
        name: String,
        size: u64,
        growth: Growth,
    },
    Refused {
        reason: String,
    },
}

pub enum Route {
    Ready(Growth),
    Move {
        block: String,
        name: String,
        size: u64,
        to: u64,
        growth: Growth,
    },
    Refused(String),
}

fn volume<'a>(drive: &'a Drive, block: &str) -> Option<&'a Volume> {
    drive.segments.iter().find_map(|segment| match segment {
        Segment::Volume(volume) if volume.block == block => Some(volume.as_ref()),
        Segment::Volume(_) | Segment::Free { .. } => None,
    })
}

fn starts_the_computer(volume: &Volume) -> Option<&'static str> {
    let kind = volume.partition_type.as_deref()?;
    STAYS_PUT
        .iter()
        .find(|(known, _)| kind.eq_ignore_ascii_case(known))
        .map(|(_, name)| *name)
}

fn title(volume: &Volume) -> String {
    if let Some(name) = starts_the_computer(volume) {
        return name.to_owned();
    }
    let inner = volume
        .encryption
        .as_ref()
        .and_then(|encryption| encryption.cleartext.as_deref());
    let name = [
        volume.label.as_str(),
        inner.map_or("", |inner| inner.label.as_str()),
        volume.partition_name.as_str(),
        volume.device.as_str(),
    ]
    .into_iter()
    .find(|name| !name.is_empty())
    .unwrap_or_default();
    format!("“{name}”")
}

fn sentence(text: String) -> String {
    let mut characters = text.chars();
    characters.next().map_or(text.clone(), |first| {
        first.to_uppercase().chain(characters).collect()
    })
}

fn listed(names: &[String]) -> String {
    match names {
        [] => String::new(),
        [only] => only.clone(),
        [rest @ .., last] => format!("{} and {last}", rest.join(", ")),
    }
}

fn stays_put(drive: &Drive, part: &Volume, systems: &[System]) -> Option<String> {
    if let Some(system) = systems
        .iter()
        .find(|system| system.parts.iter().any(|owned| owned.block == part.block))
    {
        return Some(format!(
            "it belongs to {}, which might not start anymore if it moved",
            system.name
        ));
    }
    if starts_the_computer(part).is_some() {
        return Some("the computer needs it where it is to start".to_owned());
    }
    if part.in_use_by_system() {
        return Some("the running system uses it".to_owned());
    }
    if part.logical {
        return Some("it sits inside an extended partition".to_owned());
    }
    drive
        .read_only
        .then(|| format!("{} can only be read", drive.name))
}

async fn apart(drive: &Drive, room: &Room, between: &[String]) -> Result<Route, String> {
    let [block] = between else {
        let names: Vec<String> = between
            .iter()
            .filter_map(|block| volume(drive, block))
            .map(title)
            .collect();
        return Ok(Route::Refused(sentence(format!(
            "{} sit between Luft and this space. {ONLY_NEXT_TO_LUFT}",
            listed(&names)
        ))));
    };
    let part = volume(drive, block).ok_or("The partition next to Luft is gone")?;
    let name = title(part);
    if let Some(reason) = stays_put(drive, part, &find().await?) {
        return Ok(Route::Refused(sentence(format!(
            "{name} sits between Luft and this space, and {reason}. {ONLY_NEXT_TO_LUFT}"
        ))));
    }
    let (to, growth) = if part.offset > room.offset {
        (room.offset, Growth::AtStart)
    } else {
        (
            (room.offset + room.size - part.size) / MIB * MIB,
            Growth::Now,
        )
    };
    Ok(Route::Move {
        block: block.clone(),
        name,
        size: part.size,
        to,
        growth,
    })
}

pub async fn route(offset: u64) -> Result<Route, String> {
    let (drive, room) = snapshot::build(&udisks::objects().await?)
        .drives
        .into_iter()
        .find_map(|drive| {
            let room = drive
                .luft
                .iter()
                .find(|room| room.offset == offset)?
                .clone();
            Some((drive, room))
        })
        .ok_or("This free space is gone")?;
    match &room.reach {
        Reach::After => Ok(Route::Ready(Growth::Now)),
        Reach::Before => Ok(Route::Ready(Growth::AtStart)),
        Reach::Apart { between } => apart(&drive, &room, between).await,
    }
}

pub async fn preview(offset: u64) -> Result<Gift, String> {
    Ok(match route(offset).await? {
        Route::Ready(growth) => Gift::Ready { growth },
        Route::Move {
            name, size, growth, ..
        } => Gift::MoveFirst { name, size, growth },
        Route::Refused(reason) => Gift::Refused { reason },
    })
}

pub async fn grow(unlock: &str) -> Result<Outcome<u64>, String> {
    luft_trust::unlocking(&TRUST, "GrowSystem", &(unlock,)).await
}

pub async fn grow_at_start() -> Result<(), String> {
    luft_trust::call(&TRUST, "GrowSystemAtStart", &()).await
}

pub async fn cancel_resize() -> Result<(), String> {
    luft_trust::call(&TRUST, "CancelSystemResize", &()).await
}
