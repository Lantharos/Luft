use std::fs;
use std::path::{Path, PathBuf};

use super::resolve::Resolver;
use super::space::{file_name, path_items, path_size};
use crate::files::operations::{OperationStatus, OperationsQueue, Resolution};
use crate::files::privileged::{self, Pair, arrived, remove_path, remove_paths};
use crate::files::trash;
use crate::history::Step;
use crate::locations::drives;

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
    denied: Vec<Pair>,
    emptied: Vec<PathBuf>,
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
            denied: Vec::new(),
            emptied: Vec::new(),
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
        match self.queue.status_once_unpaused(self.id) {
            Some(OperationStatus::Cancelled) => Err("Operation cancelled".to_string()),
            _ => Ok(()),
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

    /// Leaves an item this account may not place for [`Tracker::settle`],
    /// which asks an administrator about all of them at once.
    pub fn defer(&mut self, source: &Path, target: PathBuf) -> Result<(), String> {
        self.mark_done(source)?;
        self.denied.push((source.to_path_buf(), target));
        Ok(())
    }

    pub fn claims(&self, target: &Path) -> bool {
        self.denied.iter().any(|(_, claimed)| claimed == target)
    }

    /// Removes a folder whose contents were moved into another one, once
    /// nothing of it is still waiting to move.
    pub fn leave(&mut self, folder: &Path) {
        if self.denied.is_empty() {
            let _ = fs::remove_dir(folder);
        } else {
            self.emptied.push(folder.to_path_buf());
        }
    }

    pub fn settle(&mut self) -> Result<(), String> {
        let denied = std::mem::take(&mut self.denied);
        let settled = match self.mode {
            Mode::Copy => privileged::copy(&denied),
            Mode::Move => privileged::move_to(&denied),
        };
        for (source, target) in denied {
            match self.mode {
                Mode::Copy if target.symlink_metadata().is_ok() => {
                    self.steps.push(Step::Created(target));
                }
                Mode::Move if arrived(&source, &target) => self.steps.push(Step::Moved {
                    from: source,
                    to: target,
                }),
                _ => {}
            }
        }
        for folder in self.emptied.drain(..) {
            let _ = fs::remove_dir(folder);
        }
        settled
    }

    pub fn roll_back(&mut self) {
        let mut created = Vec::new();
        let mut trashed = Vec::new();
        for step in self.steps.drain(..).rev() {
            match step {
                Step::Created(path) => created.push(path),
                Step::Trashed(item) => trashed.push(item),
                Step::Moved { .. } => {}
            }
        }
        let _ = remove_paths(created);
        for item in trashed {
            let _ = trash::restore_item(&item);
        }
    }
}
