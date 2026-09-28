use std::fs::{self, File, OpenOptions};
use std::io::{self, Read, Write};
use std::os::unix::fs::symlink;
use std::path::{Path, PathBuf};

use super::resolve::available_destination;
use super::tracker::{Mode, Tracker};
use crate::files::operations::Resolution;
use crate::files::privileged::{is_permission_error, os, remove_path, run_pkexec};

const COPY_BUFFER_SIZE: usize = 1024 * 1024;

enum Kind {
    Directory,
    Link,
    File,
}

enum Placed {
    Directory,
    Link,
    File(File, File),
}

pub(super) fn copy_to(
    source: &Path,
    mut target: PathBuf,
    record: bool,
    tracker: &mut Tracker,
) -> Result<(), String> {
    tracker.guard()?;
    let metadata = fs::symlink_metadata(source).map_err(|error| error.to_string())?;
    let kind = if metadata.is_dir() {
        Kind::Directory
    } else if metadata.is_symlink() {
        Kind::Link
    } else {
        Kind::File
    };
    let placed = loop {
        match place(source, &target, &kind) {
            Ok(placed) => break placed,
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
            Err(error) if is_permission_error(&error) => {
                return copy_elevated(source, &target, record, tracker);
            }
            Err(error) => return Err(error.to_string()),
        }
    };
    if let Err(error) = fill(source, &target, placed, tracker) {
        let _ = remove_path(&target);
        return Err(error);
    }
    if record {
        tracker.placed(source, &target)?;
    }
    Ok(())
}

fn place(source: &Path, target: &Path, kind: &Kind) -> io::Result<Placed> {
    match kind {
        Kind::Directory => fs::create_dir(target).map(|()| Placed::Directory),
        Kind::Link => symlink(fs::read_link(source)?, target).map(|()| Placed::Link),
        Kind::File => {
            let input = File::open(source)?;
            let output = OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(target)?;
            Ok(Placed::File(input, output))
        }
    }
}

fn fill(source: &Path, target: &Path, placed: Placed, tracker: &mut Tracker) -> Result<(), String> {
    match placed {
        Placed::Directory => {
            tracker.add_item(target)?;
            for child in fs::read_dir(source).map_err(|error| error.to_string())? {
                let child = child.map_err(|error| error.to_string())?.path();
                let name = child.file_name().ok_or("Invalid file name")?;
                copy_to(&child, target.join(name), false, tracker)?;
            }
            let permissions = fs::metadata(source)
                .map_err(|error| error.to_string())?
                .permissions();
            fs::set_permissions(target, permissions).map_err(|error| error.to_string())
        }
        Placed::Link => tracker.add_item(target),
        Placed::File(input, output) => stream(source, input, output, tracker),
    }
}

fn merge(source: &Path, target: &Path, tracker: &mut Tracker) -> Result<(), String> {
    tracker.add_item(target)?;
    for child in fs::read_dir(source).map_err(|error| error.to_string())? {
        let child = child.map_err(|error| error.to_string())?.path();
        let name = child.file_name().ok_or("Invalid file name")?;
        copy_to(&child, target.join(name), true, tracker)?;
    }
    if tracker.mode == Mode::Move {
        let _ = fs::remove_dir(source);
    }
    Ok(())
}

fn stream(
    source: &Path,
    mut input: File,
    mut output: File,
    tracker: &mut Tracker,
) -> Result<(), String> {
    tracker.set_file(source);
    let mut buffer = vec![0_u8; COPY_BUFFER_SIZE];
    loop {
        tracker.guard()?;
        let read = input.read(&mut buffer).map_err(|error| error.to_string())?;
        if read == 0 {
            break;
        }
        output
            .write_all(&buffer[..read])
            .map_err(|error| error.to_string())?;
        tracker.add_bytes(read as u64, source);
    }
    let metadata = input.metadata().map_err(|error| error.to_string())?;
    output
        .set_permissions(metadata.permissions())
        .map_err(|error| error.to_string())?;
    if let Ok(modified) = metadata.modified() {
        let _ = output.set_modified(modified);
    }
    tracker.add_item(source)
}

fn copy_elevated(
    source: &Path,
    target: &Path,
    record: bool,
    tracker: &mut Tracker,
) -> Result<(), String> {
    let target = if target.symlink_metadata().is_ok() {
        available_destination(source, parent(target))?
    } else {
        target.to_path_buf()
    };
    run_pkexec(
        "cp",
        &[
            os("-a"),
            os("--no-clobber"),
            os("--"),
            source.as_os_str().into(),
            target.as_os_str().into(),
        ],
    )?;
    tracker.mark_done(source)?;
    if record {
        tracker.placed(source, &target)?;
    }
    Ok(())
}

pub(super) fn parent(path: &Path) -> &Path {
    path.parent().unwrap_or(Path::new("/"))
}
