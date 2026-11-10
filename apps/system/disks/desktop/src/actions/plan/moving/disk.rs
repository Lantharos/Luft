use std::fs::File;
use std::os::fd::OwnedFd;
use std::os::unix::fs::FileExt;
use std::time::{Duration, Instant};

use luft_app::Events;

use super::MoveProgress;
use super::journal::{Edges, Journal};
use crate::events::MOVE_PROGRESS;
use crate::udisks::{self, BLOCK, no_options};

const CHUNK: u64 = 8 * 1024 * 1024;
const STASH: u64 = 128 * 1024 * 1024;
const RECORD_EVERY: u64 = 1024 * 1024 * 1024;
const REPORT_EVERY: Duration = Duration::from_millis(250);

pub struct Disk(File);

impl Disk {
    #[cfg(test)]
    pub fn over(file: File) -> Self {
        Self(file)
    }

    pub async fn open(block: &str) -> Result<Self, String> {
        let descriptor: zbus::OwnedFd =
            udisks::call(block, BLOCK, "OpenDevice", &("rw", no_options())).await?;
        Ok(Self(File::from(OwnedFd::from(descriptor))))
    }

    pub fn read(&self, offset: u64, length: u64) -> Result<Vec<u8>, String> {
        let mut buffer = vec![0; length as usize];
        self.read_into(offset, &mut buffer)?;
        Ok(buffer)
    }

    fn read_into(&self, offset: u64, buffer: &mut [u8]) -> Result<(), String> {
        self.0
            .read_exact_at(buffer, offset)
            .map_err(|error| error.to_string())
    }

    pub fn write(&self, offset: u64, bytes: &[u8]) -> Result<(), String> {
        self.0
            .write_all_at(bytes, offset)
            .map_err(|error| error.to_string())
    }

    pub fn sync(&self) -> Result<(), String> {
        self.0.sync_all().map_err(|error| error.to_string())
    }

    pub fn restore(&self, edges: &Edges, tail_start: u64) -> Result<(), String> {
        self.write(0, &edges.head)?;
        self.write(tail_start, &edges.tail)?;
        self.sync()?;
        let restored = self.read(0, edges.head.len() as u64)? == edges.head
            && self.read(tail_start, edges.tail.len() as u64)? == edges.tail;
        if !restored {
            return Err("The start of the moved partition didn't read back the same".to_owned());
        }
        Ok(())
    }

    fn carry(&self, journal: &Journal, copied: u64, bytes: &[u8]) -> Result<(), String> {
        let plan = &journal.plan;
        let position = if plan.to > plan.entry.offset {
            plan.tail_start() - copied - bytes.len() as u64
        } else {
            plan.head() + copied
        };
        self.write(plan.to + position, bytes)
    }

    fn fetch(&self, journal: &Journal, copied: u64, bytes: &mut [u8]) -> Result<(), String> {
        let plan = &journal.plan;
        let position = if plan.to > plan.entry.offset {
            plan.tail_start() - copied - bytes.len() as u64
        } else {
            plan.head() + copied
        };
        self.read_into(plan.entry.offset + position, bytes)
    }

    fn land_stash(&self, journal: &mut Journal, buffer: &mut [u8]) -> Result<u64, String> {
        let bytes = &mut buffer[..journal.stashed as usize];
        journal
            .read_stash(bytes)
            .map_err(|error| error.to_string())?;
        self.carry(journal, journal.copied, bytes)?;
        self.sync()?;
        let copied = journal.copied + journal.stashed;
        journal.advance(copied).map_err(|error| error.to_string())?;
        Ok(copied)
    }

    pub fn copy_body(&self, events: &Events, journal: &mut Journal) -> Result<(), String> {
        let total = journal.plan.body();
        let stashing = journal.plan.overlaps();
        let stride = if stashing { STASH } else { CHUNK };
        let mut buffer = vec![0; stride.min(total) as usize];
        let mut copied = journal.copied;
        let mut recorded = copied;
        let mut reported = Instant::now();
        if journal.stashed > 0 {
            copied = self.land_stash(journal, &mut buffer)?;
        }
        while copied < total {
            let length = (buffer.len() as u64).min(total - copied) as usize;
            self.fetch(journal, copied, &mut buffer[..length])?;
            if stashing {
                journal
                    .stash(&buffer[..length])
                    .map_err(|error| error.to_string())?;
                copied = self.land_stash(journal, &mut buffer)?;
            } else {
                self.carry(journal, copied, &buffer[..length])?;
                copied += length as u64;
                if copied - recorded >= RECORD_EVERY || copied == total {
                    self.sync()?;
                    journal.advance(copied).map_err(|error| error.to_string())?;
                    recorded = copied;
                }
            }
            if reported.elapsed() >= REPORT_EVERY {
                reported = Instant::now();
                events.emit(MOVE_PROGRESS, MoveProgress { copied, total });
            }
        }
        events.emit(MOVE_PROGRESS, MoveProgress { copied, total });
        Ok(())
    }
}
