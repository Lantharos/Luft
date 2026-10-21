use luft_meet::resize::Change;
use serde::Serialize;

use super::found::{self, Luft};
use super::request;
use crate::helper::drive::state;
use crate::helper::drive::storage::{Layout, MSFT_Partition, Storage};
use crate::helper::drive::windows_drive;
use crate::plan::layout::Windows;
use crate::plan::resize::{Geometry, Range};

#[derive(Serialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Blocked {
    Busy,
    Encrypted,
    Elsewhere,
    Apart,
    Unreadable,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Installed {
    pub drive: String,
    pub beside_windows: bool,
    pub size: u64,
    pub allocated: Option<u64>,
    pub encrypted: bool,
    pub windows_size: u64,
    pub windows_used: u64,
    pub blocked: Option<Blocked>,
    pub pending: Option<Change>,
    pub windows_free: u64,
    pub leftovers: bool,
}

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

    pub fn windows_free(&self) -> u64 {
        self.layout.free_after_windows()
    }

    pub fn pending(&self) -> Option<Change> {
        request::read()
            .filter(|request| request.partition == self.luft.partition)
            .map(|request| request.change)
    }

    pub fn geometry(&self) -> Option<Geometry> {
        Some(Geometry {
            windows: self.windows,
            gap: self.gap()?,
            startup: self.luft.startup.map_or(0, |startup| startup.size),
            root: self.luft.root.size,
            allocated: self.luft.allocated?,
        })
    }

    pub fn range(&self) -> Option<Range> {
        self.geometry()?.range()
    }

    fn blocked(&self, pending: Option<Change>) -> Option<Blocked> {
        if pending.is_some() {
            Some(Blocked::Busy)
        } else if self.luft.encrypted {
            Some(Blocked::Encrypted)
        } else if !self.beside_windows() {
            Some(Blocked::Elsewhere)
        } else if self.gap().is_none() {
            Some(Blocked::Apart)
        } else if self.luft.allocated.is_none() {
            Some(Blocked::Unreadable)
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
            beside_windows: self.beside_windows(),
            size: self.luft.root.size,
            allocated: self.luft.allocated,
            encrypted: self.luft.encrypted,
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
