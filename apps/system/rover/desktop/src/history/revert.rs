use std::io;
use std::path::{Path, PathBuf};

use super::Step;
use crate::files::operations::OperationsQueue;
use crate::files::privileged::{self, Pair, arrived, create_dir_all, is_permission_error};
use crate::files::trash::{self, Trashed};
use crate::files::{rename_no_replace, transfer};

/// Steps this account may not take back itself, kept until the rest is done
/// so an administrator is asked once for each kind.
#[derive(Default)]
struct Denied {
    created: Vec<PathBuf>,
    moved: Vec<Pair>,
    trashed: Vec<Trashed>,
}

impl Denied {
    fn revert(self, reverted: &mut Vec<Step>) -> Result<(), String> {
        let trashed = trash::put_denied(&self.created)?;
        reverted.extend(trashed.into_iter().map(Step::Trashed));
        let moved = privileged::move_to(&self.moved);
        reverted.extend(
            self.moved
                .into_iter()
                .filter(|(from, to)| arrived(from, to))
                .map(|(from, to)| Step::Moved { from, to }),
        );
        moved?;
        let (restored, result) = trash::restore_denied(self.trashed);
        reverted.extend(restored.into_iter().map(Step::Created));
        result
    }
}

pub(super) fn revert(
    steps: Vec<Step>,
    queue: &OperationsQueue,
    id: &str,
) -> (Vec<Step>, Option<String>) {
    let mut reverted = Vec::with_capacity(steps.len());
    let mut denied = Denied::default();
    for (index, step) in steps.into_iter().rev().enumerate() {
        queue.update_progress(id, None, 0, index);
        match revert_step(step, queue, id, &mut denied) {
            Ok(step) => reverted.extend(step),
            Err(error) => return (reverted, Some(error)),
        }
    }
    let error = denied.revert(&mut reverted).err();
    (reverted, error)
}

fn revert_step(
    step: Step,
    queue: &OperationsQueue,
    id: &str,
    denied: &mut Denied,
) -> Result<Option<Step>, String> {
    match step {
        Step::Moved { from, to } => {
            if relocate(&to, &from, queue, id)? {
                return Ok(Some(Step::Moved { from: to, to: from }));
            }
            denied.moved.push((to, from));
            Ok(None)
        }
        Step::Trashed(item) => Ok(trash::restore_or_defer(&item, &mut denied.trashed)?
            .then_some(Step::Created(item.original))),
        Step::Created(path) => {
            Ok(trash::put_or_defer(&path, &mut denied.created)?.map(Step::Trashed))
        }
    }
}

fn relocate(from: &Path, to: &Path, queue: &OperationsQueue, id: &str) -> Result<bool, String> {
    if let Some(parent) = to.parent() {
        create_dir_all(parent)?;
    }
    match rename_no_replace(from, to) {
        Ok(()) => Ok(true),
        Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {
            Err(format!("{} already exists", to.display()))
        }
        Err(error) if error.raw_os_error() == Some(libc::EXDEV) => {
            transfer::relocate(from, to, queue, id).map(|()| true)
        }
        Err(error) if is_permission_error(&error) => Ok(false),
        Err(error) => Err(error.to_string()),
    }
}
