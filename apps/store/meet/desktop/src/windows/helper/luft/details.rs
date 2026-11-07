use luft_meet::resize::Change;

use super::found::{self, Luft};
use super::request;
use crate::plan::gap;
use crate::plan::layout::{Disk, Windows};

use crate::plan::layout::Span;
use crate::plan::resize::{Geometry, Room};
use crate::plan::sizes::ALIGNMENT;
use crate::protocol::answers::{Blocked, Installed, Range};
use crate::windows::helper::drive::state;
use crate::windows::helper::drive::storage::{Layout, MSFT_Partition, Storage};
use crate::windows::helper::drive::windows_drive;

pub struct Survey {
    pub storage: Storage,
    pub layout: Layout,
    pub windows: Windows,
    pub luft: Luft,
    pub partitions: Vec<MSFT_Partition>,
}

pub enum Measure {
    Quickly,
    WhatWindowsCanSpare,
}

pub fn survey(measure: Measure) -> Result<Option<Survey>, String> {
    let storage = Storage::open()?;
    let Some(luft) = found::find(&storage)? else {
        return Ok(None);
    };
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let windows = match measure {
        Measure::Quickly => storage.windows_usage(&layout, &drive.volume)?,
        Measure::WhatWindowsCanSpare => storage.windows_plan(&layout, &drive.volume)?,
    };
    let partitions = storage.all_partitions()?;
    Ok(Some(Survey {
        storage,
        layout,
        windows,
        luft,
        partitions,
    }))
}

impl Survey {
    pub fn beside_windows(&self) -> bool {
        self.luft.disk.Number == self.layout.disk.Number
    }

    pub fn gap(&self) -> Option<u64> {
        let end = self.windows.partition.end();
        let block = self.luft.block();
        let between = self
            .layout
            .partitions
            .iter()
            .any(|partition| partition.Offset >= end && partition.Offset < block.offset);
        (self.beside_windows() && block.offset >= end && !between).then(|| block.offset - end)
    }

    pub fn next_to_windows(&self) -> bool {
        self.gap().is_some()
    }

    pub fn windows_free(&self) -> u64 {
        self.layout.free_after_windows()
    }

    pub fn pending(&self) -> Option<Change> {
        request::read()
            .filter(|request| request.partition == self.luft.partition)
            .map(|request| request.change)
    }

    fn gaps(&self) -> Vec<Span> {
        gap::gaps(&Disk {
            size: self.luft.disk.Size,
            partitions: self
                .partitions
                .iter()
                .filter(|partition| partition.DiskNumber == self.luft.disk.Number)
                .map(MSFT_Partition::span)
                .collect(),
        })
    }

    pub fn free_before(&self) -> u64 {
        let start = self.luft.block().offset;
        self.gaps()
            .into_iter()
            .find(|gap| gap.end() <= start && start - gap.end() < ALIGNMENT)
            .map_or(0, |gap| gap.size)
    }

    pub fn free_after(&self) -> u64 {
        let end = self.luft.root.end();
        self.gaps()
            .into_iter()
            .find(|gap| gap.offset >= end && gap.offset - end < ALIGNMENT)
            .map_or(0, |gap| gap.size)
    }

    fn room(&self) -> Option<Room> {
        Some(Room {
            before: self.free_before(),
            after: self.free_after(),
            startup: self.luft.startup.map_or(0, |startup| startup.size),
            root: self.luft.root.size,
            allocated: self.luft.allocated?,
        })
    }

    pub fn geometry(&self) -> Option<Geometry> {
        self.next_to_windows().then_some(Geometry {
            windows: self.windows,
            room: self.room()?,
        })
    }

    pub fn range(&self) -> Option<Range> {
        match self.geometry() {
            Some(geometry) => geometry.range(),
            None => self.room()?.range(),
        }
    }

    fn blocked(&self, pending: Option<Change>) -> Option<Blocked> {
        let encryption = self.luft.encryption;
        if pending.is_some() {
            Some(Blocked::Busy)
        } else if encryption.is_some_and(|encryption| !encryption.tpm) {
            Some(Blocked::Passphrase)
        } else if self.luft.allocated.is_none() {
            Some(Blocked::Unreadable)
        } else if self.beside_windows() && !self.next_to_windows() && self.range().is_none() {
            Some(Blocked::Apart)
        } else {
            None
        }
    }

    pub fn describe(&self) -> Installed {
        let pending = self.pending();
        let blocked = self.blocked(pending);
        Installed {
            drive: self
                .luft
                .disk
                .FriendlyName
                .clone()
                .unwrap_or_default()
                .trim()
                .to_owned(),
            beside_windows: self.next_to_windows(),
            size: self.luft.root.size,
            allocated: self.luft.allocated,
            free_before: self.free_before(),
            free_after: self.free_after(),
            windows_size: self.windows.partition.size,
            windows_used: self.windows.used,
            blocked,
            windows_free: if pending == Some(Change::Grow) {
                0
            } else {
                self.windows_free()
            },
            pending,
            leftovers: !state::find(&self.partitions).made.is_empty(),
        }
    }
}
