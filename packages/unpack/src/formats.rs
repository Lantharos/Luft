use std::io::{self, Read, Seek};
use std::path::Path;
use std::time::{Duration, SystemTime};

use crate::unpacker::{Stamp, Unpacker, relative};
use crate::{Error, Rules};

const MAX_LINK_LENGTH: u64 = 4096;

pub fn unpack_tar(
    archive: impl Read,
    into: &Path,
    rules: Rules,
    mut unpacked: impl FnMut(&Path),
) -> Result<(), Error> {
    let mut unpacker = Unpacker::new(into, rules);
    let mut tar = tar::Archive::new(archive);
    for entry in tar.entries().map_err(Error::Damaged)? {
        let mut entry = entry.map_err(Error::Damaged)?;
        unpacker.count()?;
        let Some(path) = relative(&entry.path().map_err(Error::Damaged)?) else {
            continue;
        };
        let header = entry.header();
        let kind = header.entry_type();
        let mode = header.mode().ok();
        if kind.is_dir() {
            unpacker.directory(&path, mode)?;
            continue;
        }
        if kind.is_file() || kind.is_contiguous() || kind.is_gnu_sparse() {
            let modified = header
                .mtime()
                .ok()
                .map(|seconds| SystemTime::UNIX_EPOCH + Duration::from_secs(seconds));
            unpacker.file(&path, &mut entry, Stamp { mode, modified })?;
        } else if kind.is_symlink() || kind.is_hard_link() {
            let Some(target) = entry.link_name().map_err(Error::Damaged)? else {
                continue;
            };
            if kind.is_symlink() {
                unpacker.link(&path, &target)?;
            } else {
                unpacker.copy(&path, &target)?;
            }
        } else {
            continue;
        }
        unpacked(&path);
    }
    unpacker.finish()
}

pub fn unpack_zip(
    archive: impl Read + Seek,
    into: &Path,
    rules: Rules,
    mut unpacked: impl FnMut(&Path),
) -> Result<(), Error> {
    let damaged = |error: zip::result::ZipError| Error::Damaged(io::Error::from(error));
    let mut unpacker = Unpacker::new(into, rules);
    let mut zip = zip::ZipArchive::new(archive).map_err(damaged)?;
    for index in 0..zip.len() {
        let mut entry = zip.by_index(index).map_err(damaged)?;
        unpacker.count()?;
        let Some(path) = entry.enclosed_name().as_deref().and_then(relative) else {
            continue;
        };
        let mode = entry.unix_mode();
        if entry.is_dir() {
            unpacker.directory(&path, mode)?;
            continue;
        }
        if entry.is_symlink() {
            let mut target = String::new();
            (&mut entry)
                .take(MAX_LINK_LENGTH)
                .read_to_string(&mut target)
                .map_err(Error::Damaged)?;
            unpacker.link(&path, Path::new(&target))?;
        } else {
            let stamp = Stamp {
                mode,
                modified: None,
            };
            unpacker.file(&path, &mut entry, stamp)?;
        }
        unpacked(&path);
    }
    unpacker.finish()
}
