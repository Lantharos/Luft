use std::io;
use std::path::Path;

use super::Step;
use crate::files::operations::OperationsQueue;
use crate::files::privileged::{create_dir_all, is_permission_error, os, run_pkexec};
use crate::files::{rename_no_replace, transfer, trash};

pub(super) fn revert(
    steps: Vec<Step>,
    queue: &OperationsQueue,
    id: &str,
) -> (Vec<Step>, Option<String>) {
    let mut reverted = Vec::with_capacity(steps.len());
    for (index, step) in steps.into_iter().rev().enumerate() {
        queue.update_progress(id, None, 0, index);
        match revert_step(step, queue, id) {
            Ok(step) => reverted.push(step),
            Err(error) => return (reverted, Some(error)),
        }
    }
    (reverted, None)
}

fn revert_step(step: Step, queue: &OperationsQueue, id: &str) -> Result<Step, String> {
    match step {
        Step::Moved { from, to } => {
            relocate(&to, &from, queue, id)?;
            Ok(Step::Moved { from: to, to: from })
        }
        Step::Trashed(item) => trash::restore_item(&item).map(Step::Created),
        Step::Created(path) => trash::put(&path).map(Step::Trashed),
    }
}

fn relocate(from: &Path, to: &Path, queue: &OperationsQueue, id: &str) -> Result<(), String> {
    if let Some(parent) = to.parent() {
        create_dir_all(parent)?;
    }
    match rename_no_replace(from, to) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {
            Err(format!("{} already exists", to.display()))
        }
        Err(error) if error.raw_os_error() == Some(libc::EXDEV) => {
            transfer::relocate(from, to, queue, id)
        }
        Err(error) if is_permission_error(&error) => run_pkexec(
            "mv",
            &[
                os("--no-clobber"),
                os("--"),
                from.as_os_str().into(),
                to.as_os_str().into(),
            ],
        ),
        Err(error) => Err(error.to_string()),
    }
}
