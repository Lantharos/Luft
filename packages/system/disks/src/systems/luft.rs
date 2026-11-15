use luft_i18n::t;
use luft_trust::{Outcome, TRUST};
use serde::Serialize;
use specta::Type;

use super::{System, find};
use crate::udisks::room::{Reach, Room};
use crate::udisks::snapshot::{self, Drive};
use crate::udisks::volumes::{Segment, Volume};
use crate::{L10N, udisks};

const MIB: u64 = 1 << 20;
const STAYS_PUT: [(&str, &str); 3] = [
    ("c12a7328-f81f-11d2-ba4b-00a0c93ec93b", "esp"),
    ("e3c9e316-0b5c-4db8-817d-f92df00215ae", "windows-reserved"),
    ("de94bba4-06d1-4d40-a16a-bfd50179d6ac", "windows-recovery"),
];

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

enum Stays<'a> {
    BelongsTo(&'a str),
    StartsTheComputer,
    UsedBySystem,
    Extended,
    ReadOnly(&'a str),
}

#[derive(Clone, Copy)]
enum Position {
    Start,
    Within,
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
        .map(|(_, part)| *part)
}

fn title(volume: &Volume, position: Position) -> String {
    if let Some(part) = starts_the_computer(volume) {
        return match position {
            Position::Start => t!(L10N, "luft-disks-luft-part-start", part = part),
            Position::Within => t!(L10N, "luft-disks-luft-part", part = part),
        };
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
    t!(L10N, "luft-disks-volume-label", label = name)
}

fn listed(names: &[String]) -> String {
    match names {
        [] => String::new(),
        [only] => only.clone(),
        [first, second] => t!(
            L10N,
            "luft-disks-list-two",
            first = first.as_str(),
            second = second.as_str()
        ),
        [first, rest @ ..] => t!(
            L10N,
            "luft-disks-list-more",
            first = first.as_str(),
            rest = listed(rest)
        ),
    }
}

fn stays_put<'a>(drive: &'a Drive, part: &Volume, systems: &'a [System]) -> Option<Stays<'a>> {
    if let Some(system) = systems
        .iter()
        .find(|system| system.parts.iter().any(|owned| owned.block == part.block))
    {
        return Some(Stays::BelongsTo(&system.name));
    }
    if starts_the_computer(part).is_some() {
        return Some(Stays::StartsTheComputer);
    }
    if part.in_use_by_system() {
        return Some(Stays::UsedBySystem);
    }
    if part.logical {
        return Some(Stays::Extended);
    }
    drive.read_only.then_some(Stays::ReadOnly(&drive.name))
}

fn refusal(part: String, stays: Stays) -> String {
    match stays {
        Stays::BelongsTo(system) => t!(
            L10N,
            "luft-disks-luft-between-belongs",
            part = part,
            system = system
        ),
        Stays::StartsTheComputer => t!(L10N, "luft-disks-luft-between-starts", part = part),
        Stays::UsedBySystem => t!(L10N, "luft-disks-luft-between-in-use", part = part),
        Stays::Extended => t!(L10N, "luft-disks-luft-between-extended", part = part),
        Stays::ReadOnly(drive) => t!(
            L10N,
            "luft-disks-luft-between-read-only",
            part = part,
            drive = drive
        ),
    }
}

async fn apart(drive: &Drive, room: &Room, between: &[String]) -> Result<Route, String> {
    let [block] = between else {
        let names: Vec<String> = between
            .iter()
            .filter_map(|block| volume(drive, block))
            .enumerate()
            .map(|(index, part)| {
                title(
                    part,
                    if index == 0 {
                        Position::Start
                    } else {
                        Position::Within
                    },
                )
            })
            .collect();
        return Ok(Route::Refused(t!(
            L10N,
            "luft-disks-luft-between-several",
            parts = listed(&names)
        )));
    };
    let part = volume(drive, block).ok_or_else(|| t!(L10N, "luft-disks-luft-next-gone"))?;
    let systems = find().await?;
    if let Some(stays) = stays_put(drive, part, &systems) {
        return Ok(Route::Refused(refusal(title(part, Position::Start), stays)));
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
        name: title(part, Position::Within),
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
        .ok_or_else(|| t!(L10N, "luft-disks-luft-space-gone"))?;
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
