use luft_meet::resize::{ROOT_NAME, ROOT_TYPE, SPACE, STARTUP_TYPE, Space, VENDOR};

use super::luks::{self, Encryption};

use crate::boot::gpt::Entry;
use crate::boot::load_option::{guid_bytes, guid_text};
use crate::plan::layout::Span;
use crate::windows::helper::drive::raw::RawDisk;
use crate::windows::helper::drive::storage::{MSFT_Disk, MSFT_Partition, Storage};
use crate::windows::helper::system::firmware;

const SUPERBLOCK: u64 = 0x10000;
const BTRFS: &[u8] = b"_BHRfS_M";
const MAGIC: usize = 0x40;
const DEVICES: usize = 0x88;
const DEVICE_ALLOCATED: usize = 0xc9 + 16;

pub struct Luft {
    pub disk: MSFT_Disk,
    pub root: Span,
    pub partition: String,
    pub startup: Option<Span>,
    pub encryption: Option<Encryption>,
    pub allocated: Option<u64>,
}

impl Luft {
    pub fn block(&self) -> Span {
        match self.startup {
            Some(startup) => Span {
                offset: startup.offset,
                size: self.root.end() - startup.offset,
            },
            None => self.root,
        }
    }

    pub fn partitions<'a>(
        &self,
        partitions: &'a [MSFT_Partition],
    ) -> impl Iterator<Item = &'a MSFT_Partition> {
        let spans = [Some(self.root), self.startup];
        let disk = self.disk.Number;
        partitions.iter().filter(move |partition| {
            partition.DiskNumber == disk
                && spans
                    .iter()
                    .flatten()
                    .any(|span| span.offset == partition.Offset)
        })
    }
}

fn span(entry: &Entry, sector: u64) -> Span {
    Span {
        offset: entry.first_lba * sector,
        size: (entry.last_lba + 1 - entry.first_lba) * sector,
    }
}

fn number(bytes: &[u8], at: usize) -> Option<u64> {
    Some(u64::from_le_bytes(bytes.get(at..at + 8)?.try_into().ok()?))
}

fn allocated(raw: &mut RawDisk, root: Span) -> Option<u64> {
    let superblock = raw.read(root.offset + SUPERBLOCK, 4096).ok()?;
    if superblock.get(MAGIC..MAGIC + BTRFS.len())? != BTRFS || number(&superblock, DEVICES)? != 1 {
        return None;
    }
    number(&superblock, DEVICE_ALLOCATED)
}

fn reported(partition: &str) -> Option<u64> {
    let bytes = firmware::read_variable(&format!("{{{VENDOR}}}"), SPACE).ok()??;
    Space::parse(&bytes)
        .filter(|space| space.partition == partition)
        .map(|space| space.allocated)
}

fn on_disk(disk: MSFT_Disk) -> Option<Luft> {
    let mut raw = RawDisk::open(disk.Number, disk.LogicalSectorSize).ok()?;
    let entries = raw.entries().ok()?;
    let (root_type, startup_type) = (guid_bytes(ROOT_TYPE)?, guid_bytes(STARTUP_TYPE)?);
    let entry = entries
        .iter()
        .find(|entry| entry.kind == root_type && entry.name == ROOT_NAME)?;
    let root = span(entry, raw.sector);
    let startup = entries
        .iter()
        .filter(|other| other.kind == startup_type)
        .map(|other| span(other, raw.sector))
        .find(|startup| startup.end() == root.offset);
    let encryption = luks::read(&mut raw, root.offset)?;
    let partition = guid_text(&entry.guid);
    Some(Luft {
        allocated: match encryption {
            Some(_) => reported(&partition),
            None => allocated(&mut raw, root),
        },
        encryption,
        partition,
        root,
        startup,
        disk,
    })
}

pub fn find(storage: &Storage) -> Result<Option<Luft>, String> {
    let mut disks: Vec<u32> = storage
        .all_partitions()?
        .iter()
        .filter(|partition| partition.is_type(&format!("{{{ROOT_TYPE}}}")))
        .map(|partition| partition.DiskNumber)
        .collect();
    disks.sort_unstable();
    disks.dedup();
    for number in disks {
        if let Some(found) = on_disk(storage.disk(number)?) {
            return Ok(Some(found));
        }
    }
    Ok(None)
}
