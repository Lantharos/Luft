use std::fs::{self, DirBuilder, File, OpenOptions};
use std::io;
use std::os::unix::fs::{DirBuilderExt, MetadataExt, OpenOptionsExt, symlink};
use std::path::{Path, PathBuf};

use super::resolve::available_destination;
use super::tracker::{Mode, Tracker};
use crate::details::look;
use crate::files::operations::Resolution;
use crate::files::privileged::{self, is_permission_error, remove_path};
use luft_files::data;

const PERMISSION_BITS: u32 = 0o777;
const OWNER_ACCESS: u32 = 0o700;

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
    let mode = metadata.mode() & PERMISSION_BITS;
    let placed = loop {
        match place(source, &target, &kind, mode) {
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

fn place(source: &Path, target: &Path, kind: &Kind, mode: u32) -> io::Result<Placed> {
    match kind {
        Kind::Directory => DirBuilder::new()
            .mode(mode | OWNER_ACCESS)
            .create(target)
            .map(|()| Placed::Directory),
        Kind::Link => symlink(fs::read_link(source)?, target).map(|()| Placed::Link),
        Kind::File => {
            let input = File::open(source)?;
            let output = OpenOptions::new()
                .write(true)
                .create_new(true)
                .mode(mode)
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
            fs::set_permissions(target, permissions).map_err(|error| error.to_string())?;
            if let (Ok(from), Ok(to)) = (File::open(source), File::open(target)) {
                let _ = data::attributes(&from, &to);
            }
            let _ = look::copy(source, target);
            Ok(())
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

fn stream(source: &Path, input: File, output: File, tracker: &mut Tracker) -> Result<(), String> {
    tracker.set_file(source);
    let metadata = input.metadata().map_err(|error| error.to_string())?;
    data::contents(&input, &output, metadata.len(), |bytes| {
        tracker.add_bytes(bytes, source);
        tracker.guard().map_err(io::Error::other)
    })
    .map_err(|error| error.to_string())?;
    let _ = data::attributes(&input, &output);
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
    privileged::copy(source, &target)?;
    tracker.mark_done(source)?;
    if record {
        tracker.placed(source, &target)?;
    }
    Ok(())
}

pub(super) fn parent(path: &Path) -> &Path {
    path.parent().unwrap_or(Path::new("/"))
}
