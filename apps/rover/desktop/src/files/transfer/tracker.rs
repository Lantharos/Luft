use std::path::{Path, PathBuf};
use std::thread;
use std::time::Duration;

use super::resolve::Resolver;
use super::space::{file_name, path_items, path_size};
use crate::files::operations::{OperationStatus, OperationsQueue, Resolution};
use crate::files::privileged::remove_path;
use crate::files::trash;
use crate::history::Step;
use crate::locations::drives;

const PAUSE_POLL_INTERVAL: Duration = Duration::from_millis(120);

#[derive(Clone, Copy, PartialEq)]
pub(super) enum Mode {
    Copy,
    Move,
}

pub(super) struct Tracker<'a> {
    pub queue: &'a OperationsQueue,
    pub id: &'a str,
    pub mode: Mode,
    pub total_bytes: u64,
    pub steps: Vec<Step>,
    bytes_processed: u64,
    items_processed: usize,
    resolver: Resolver,
}

impl<'a> Tracker<'a> {
    pub fn new(queue: &'a OperationsQueue, id: &'a str, mode: Mode, resolver: Resolver) -> Self {
        Self {
            queue,
            id,
            mode,
            total_bytes: 0,
            steps: Vec::new(),
            bytes_processed: 0,
            items_processed: 0,
            resolver,
        }
    }

    pub fn prepare(&mut self, plan: &[(PathBuf, PathBuf)]) {
        if let Some((_, destination)) = plan.first() {
            let drive = drives::drive_for_path(destination);
            let label = drive
                .as_ref()
                .map(|drive| drive.name.clone())
                .or_else(|| file_name(destination));
            self.queue.set_destination(
                self.id,
                label,
                drive.is_some_and(|drive| drive.is_removable),
            );
        }
        self.total_bytes = plan.iter().map(|(source, _)| path_size(source)).sum();
        let total_items = plan.iter().map(|(source, _)| path_items(source)).sum();
        self.queue
            .set_totals(self.id, self.total_bytes, total_items);
    }

    pub fn resolve(&mut self, source: &Path, target: &Path) -> Result<Resolution, String> {
        self.resolver.resolve(self.queue, self.id, source, target)
    }

    pub fn guard(&self) -> Result<(), String> {
        loop {
            match self.queue.status(self.id) {
                Some(OperationStatus::Cancelled) => return Err("Operation cancelled".to_string()),
                Some(OperationStatus::Paused) => thread::sleep(PAUSE_POLL_INTERVAL),
                _ => return Ok(()),
            }
        }
    }

    pub fn set_file(&self, path: &Path) {
        self.queue.update_progress(
            self.id,
            Some(path.to_string_lossy().into_owned()),
            self.bytes_processed,
            self.items_processed,
        );
    }

    pub fn add_bytes(&mut self, bytes: u64, path: &Path) {
        self.bytes_processed = self.bytes_processed.saturating_add(bytes);
        self.set_file(path);
    }

    pub fn add_item(&mut self, path: &Path) -> Result<(), String> {
        self.guard()?;
        self.items_processed += 1;
        self.set_file(path);
        Ok(())
    }

    pub fn mark_done(&mut self, path: &Path) -> Result<(), String> {
        self.guard()?;
        self.bytes_processed = self.bytes_processed.saturating_add(path_size(path));
        self.items_processed += path_items(path);
        self.set_file(path);
        Ok(())
    }

    pub fn trash_existing(&mut self, target: &Path) -> Result<(), String> {
        let trashed = trash::put(target)?;
        self.steps.push(Step::Trashed(trashed));
        Ok(())
    }

    pub fn placed(&mut self, source: &Path, target: &Path) -> Result<(), String> {
        match self.mode {
            Mode::Copy => self.steps.push(Step::Created(target.to_path_buf())),
            Mode::Move => {
                remove_path(source)?;
                self.steps.push(Step::Moved {
                    from: source.to_path_buf(),
                    to: target.to_path_buf(),
                });
            }
        }
        Ok(())
    }

    pub fn created(&self) -> impl Iterator<Item = &Path> {
        self.steps.iter().filter_map(|step| match step {
            Step::Created(path) => Some(path.as_path()),
            Step::Moved { to, .. } => Some(to.as_path()),
            Step::Trashed(_) => None,
        })
    }

    pub fn roll_back(&mut self) {
        for step in self.steps.drain(..).rev() {
            let _ = match step {
                Step::Created(path) => remove_path(&path),
                Step::Trashed(item) => trash::restore_item(&item).map(drop),
                Step::Moved { .. } => Ok(()),
            };
        }
    }
}
