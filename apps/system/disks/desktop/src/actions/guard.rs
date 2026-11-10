use std::ops::Range;

use luft_app::dbus::objects::Objects;

use super::plan::moving;
use crate::udisks;
use crate::udisks::snapshot::{self, Drive, PartitionTable, Snapshot};
use crate::udisks::volumes::{Segment, Volume};

const ALIGNMENT: u64 = 1024 * 1024;
const DOS_LIMIT: u64 = 2 * 1024 * 1024 * 1024 * 1024;

pub struct Guard {
    pub offset: u64,
    pub size: u64,
    pub system: bool,
    name: String,
    logical: bool,
    encrypted: bool,
    room: Room,
}

pub struct Room {
    usable: Range<u64>,
    taken: Vec<Range<u64>>,
    extended: Option<Range<u64>>,
}

impl Room {
    fn around(drive: &Drive, moving: Option<&Volume>) -> Self {
        let end = match drive.table {
            Some(PartitionTable::Gpt) => drive.size.saturating_sub(ALIGNMENT),
            _ => drive.size.min(DOS_LIMIT),
        };
        let own = moving.map(|volume| volume.offset..volume.offset + volume.size);
        Self {
            usable: own.as_ref().map_or(ALIGNMENT..end, |own| {
                own.start.min(ALIGNMENT)..own.end.max(end)
            }),
            taken: drive
                .segments
                .iter()
                .filter_map(|segment| match segment {
                    Segment::Volume(volume)
                        if moving.is_none_or(|moving| moving.block != volume.block) =>
                    {
                        Some(volume.offset..volume.offset + volume.size)
                    }
                    _ => None,
                })
                .collect(),
            extended: drive
                .extended
                .as_ref()
                .map(|extended| extended.offset..extended.offset + extended.size),
        }
    }

    fn holds(&self, offset: u64, size: u64) -> bool {
        let Some(end) = offset.checked_add(size) else {
            return false;
        };
        let apart = |other: &Range<u64>| end <= other.start || other.end <= offset;
        self.usable.start <= offset
            && end <= self.usable.end
            && self.taken.iter().all(apart)
            && self.extended.as_ref().is_none_or(|extended| {
                apart(extended) || (extended.start <= offset && end <= extended.end)
            })
    }

    pub fn free(&self, offset: u64, size: u64) -> Result<(), String> {
        if self.holds(offset, size) {
            return Ok(());
        }
        Err(
            "The drive has changed since this was planned, so that space is no longer free"
                .to_owned(),
        )
    }
}

fn writable(objects: &Objects, drive: &Drive) -> Result<(), String> {
    if drive.read_only {
        return Err(format!("{} can only be read", drive.name));
    }
    let interrupted = moving::interrupted(objects)
        .iter()
        .any(|pending| pending.drive == drive.block);
    if interrupted {
        return Err(format!(
            "A move on {} was interrupted and has to finish first",
            drive.name
        ));
    }
    Ok(())
}

fn display_name(volume: &Volume) -> String {
    let inner = volume
        .encryption
        .as_ref()
        .and_then(|encryption| encryption.cleartext.as_deref());
    [
        volume.label.as_str(),
        inner.map_or("", |inner| inner.label.as_str()),
    ]
    .into_iter()
    .find(|label| !label.is_empty())
    .unwrap_or(volume.device.as_str())
    .to_owned()
}

fn idle(objects: &Objects, drive: &Drive) -> Result<(), String> {
    writable(objects, drive)?;
    if drive.system {
        return Err(format!(
            "The running system uses “{}”, so it can't be erased while it runs",
            drive.name
        ));
    }
    Ok(())
}

impl Guard {
    pub async fn table(table: &str) -> Result<Room, String> {
        let objects = udisks::objects().await?;
        let snapshot = snapshot::build(&objects);
        let drive = snapshot
            .drives
            .iter()
            .find(|drive| drive.block == table)
            .ok_or("This drive is gone")?;
        writable(&objects, drive)?;
        Ok(Room::around(drive, None))
    }

    pub async fn erasable(block: &str) -> Result<(), String> {
        let objects = udisks::objects().await?;
        let snapshot = snapshot::build(&objects);
        match snapshot.drives.iter().find(|drive| drive.block == block) {
            Some(drive) => idle(&objects, drive),
            None => Self::within(&objects, &snapshot, block)?.changeable(),
        }
    }

    pub async fn volume(block: &str) -> Result<Self, String> {
        let objects = udisks::objects().await?;
        Self::within(&objects, &snapshot::build(&objects), block)
    }

    pub fn label(&self) -> &str {
        &self.name
    }

    fn within(objects: &Objects, snapshot: &Snapshot, block: &str) -> Result<Self, String> {
        let (drive, volume) = snapshot
            .drives
            .iter()
            .find_map(|drive| {
                drive.segments.iter().find_map(|segment| match segment {
                    Segment::Volume(volume) if volume.block == block => Some((drive, volume)),
                    _ => None,
                })
            })
            .ok_or("This partition is gone")?;
        writable(objects, drive)?;
        Ok(Self {
            offset: volume.offset,
            size: volume.size,
            system: volume.in_use_by_system(),
            name: display_name(volume),
            logical: volume.logical,
            encrypted: volume.encryption.is_some(),
            room: Room::around(drive, Some(volume)),
        })
    }

    pub fn fits(&self, offset: u64, size: u64) -> Result<(), String> {
        if self.room.holds(offset, size) {
            return Ok(());
        }
        Err(format!(
            "The drive has changed since this was planned, so “{}” no longer fits there",
            self.name
        ))
    }

    pub fn changeable(&self) -> Result<(), String> {
        if self.system {
            return Err(format!(
                "The running system uses “{}”, so it can't be changed while it runs",
                self.name
            ));
        }
        Ok(())
    }

    pub fn movable(&self) -> Result<(), String> {
        self.changeable()?;
        if self.logical {
            return Err(format!(
                "“{}” sits inside an extended partition, so it can't be moved",
                self.name
            ));
        }
        Ok(())
    }

    pub fn resizable(&self) -> Result<(), String> {
        if self.logical {
            return Err(format!(
                "“{}” sits inside an extended partition, so it can't be resized",
                self.name
            ));
        }
        if self.encrypted {
            return Err(format!(
                "“{}” is encrypted, so it can't be resized",
                self.name
            ));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const GIB: u64 = 1 << 30;

    fn room(extended: Option<Range<u64>>) -> Room {
        Room {
            usable: ALIGNMENT..100 * GIB,
            taken: vec![ALIGNMENT..GIB, 40 * GIB..60 * GIB],
            extended,
        }
    }

    #[test]
    fn a_span_fits_only_in_space_no_other_partition_holds() {
        let room = room(None);
        assert!(room.holds(GIB, 39 * GIB));
        assert!(room.holds(60 * GIB, 40 * GIB));
        assert!(!room.holds(GIB, 39 * GIB + 1));
        assert!(!room.holds(39 * GIB, 22 * GIB));
        assert!(!room.holds(45 * GIB, GIB));
        assert!(!room.holds(GIB - 1, GIB));
        assert!(!room.holds(0, ALIGNMENT));
        assert!(!room.holds(60 * GIB, 40 * GIB + 1));
        assert!(!room.holds(u64::MAX, 2));
    }

    #[test]
    fn a_span_stays_on_one_side_of_the_extended_partition() {
        let room = room(Some(70 * GIB..90 * GIB));
        assert!(room.holds(60 * GIB, 10 * GIB));
        assert!(room.holds(71 * GIB, 19 * GIB));
        assert!(room.holds(90 * GIB, 10 * GIB));
        assert!(!room.holds(60 * GIB, 15 * GIB));
        assert!(!room.holds(85 * GIB, 10 * GIB));
    }
}
