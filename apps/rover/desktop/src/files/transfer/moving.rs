use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use super::copy::{copy_to, parent};
use super::resolve::available_destination;
use super::tracker::Tracker;
use crate::files::operations::Resolution;
use crate::files::privileged::{is_permission_error, os, run_pkexec};
use crate::files::rename_no_replace;
use crate::history::Step;

pub(super) fn move_to(
    source: &Path,
    mut target: PathBuf,
    tracker: &mut Tracker,
) -> Result<(), String> {
    tracker.guard()?;
    loop {
        match rename_no_replace(source, &target) {
            Ok(()) => return moved(source, target, tracker),
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {
                match tracker.resolve(source, &target)? {
                    Resolution::Skip => return tracker.mark_done(source),
                    Resolution::KeepBoth => {
                        target = available_destination(source, parent(&target))?;
                    }
                    Resolution::Replace => tracker.trash_existing(&target)?,
                    Resolution::Merge => return merge(source, &target, tracker),
                }
            }
            Err(error) if error.raw_os_error() == Some(libc::EXDEV) => {
                return copy_to(source, target, true, tracker);
            }
            Err(error) if is_permission_error(&error) => {
                run_pkexec(
                    "mv",
                    &[
                        os("--no-clobber"),
                        os("--"),
                        source.as_os_str().into(),
                        target.as_os_str().into(),
                    ],
                )?;
                return moved(source, target, tracker);
            }
            Err(error) => return Err(error.to_string()),
        }
    }
}

fn moved(source: &Path, target: PathBuf, tracker: &mut Tracker) -> Result<(), String> {
    tracker.mark_done(&target)?;
    tracker.steps.push(Step::Moved {
        from: source.to_path_buf(),
        to: target,
    });
    Ok(())
}

fn merge(source: &Path, target: &Path, tracker: &mut Tracker) -> Result<(), String> {
    for child in fs::read_dir(source).map_err(|error| error.to_string())? {
        let child = child.map_err(|error| error.to_string())?.path();
        let name = child.file_name().ok_or("Invalid file name")?;
        move_to(&child, target.join(name), tracker)?;
    }
    let _ = fs::remove_dir(source);
    Ok(())
}
