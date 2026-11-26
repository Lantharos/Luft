//! Luft programs started before system packages were last merged over `/usr`.
//! They run from the `/usr` they started on, which is no longer mounted
//! there, so the file they run isn't the file now at its path. They are told
//! by what the file holds: the same program, byte for byte, as the one the
//! image has at that path.
//!
//! A program found the same is remembered while its file stays open here,
//! which keeps the `/usr` it is on, and with it its device and inode, from
//! going to anything else.

use std::fs::File;
use std::io::Read;
use std::os::fd::{AsRawFd, OwnedFd};
use std::path::{Path, PathBuf};
use std::sync::{Mutex, PoisonError};

use super::image::{identity, status};

const CHUNK: usize = 1 << 20;

struct Confirmed {
    program: OwnedFd,
    installed: PathBuf,
    installed_file: (u64, u64),
}

static CONFIRMED: Mutex<Vec<Confirmed>> = Mutex::new(Vec::new());

fn reopen(fd: &OwnedFd) -> Option<File> {
    File::open(format!("/proc/self/fd/{}", fd.as_raw_fd())).ok()
}

fn same_contents(program: &OwnedFd, installed: &OwnedFd, length: u64) -> bool {
    let (Some(mut program), Some(mut installed)) = (reopen(program), reopen(installed)) else {
        return false;
    };
    let mut ours = vec![0u8; CHUNK];
    let mut theirs = vec![0u8; CHUNK];
    let mut left = length;
    while left > 0 {
        let chunk = left.min(CHUNK as u64) as usize;
        let (ours, theirs) = (&mut ours[..chunk], &mut theirs[..chunk]);
        if program.read_exact(ours).is_err() || installed.read_exact(theirs).is_err() {
            return false;
        }
        if ours != theirs {
            return false;
        }
        left -= chunk as u64;
    }
    true
}

fn was_confirmed(
    confirmed: &mut Vec<Confirmed>,
    file: &libc::stat,
    installed: &Path,
    installed_file: (u64, u64),
) -> bool {
    confirmed
        .retain(|entry| entry.installed != installed || entry.installed_file == installed_file);
    confirmed.iter().any(|entry| {
        entry.installed == installed
            && status(&entry.program).is_some_and(|kept| identity(&kept) == identity(file))
    })
}

/// Whether `program`, an image file a process runs, holds the same program
/// as `installed_fd`, the image's file now at `installed`.
pub fn same_program(
    program: &OwnedFd,
    file: &libc::stat,
    installed: &Path,
    installed_fd: &OwnedFd,
    installed_file: &libc::stat,
) -> bool {
    let now = identity(installed_file);
    let mut confirmed = CONFIRMED.lock().unwrap_or_else(PoisonError::into_inner);
    if was_confirmed(&mut confirmed, file, installed, now) {
        return true;
    }
    drop(confirmed);
    let length = u64::try_from(file.st_size).unwrap_or_default();
    if file.st_size != installed_file.st_size || !same_contents(program, installed_fd, length) {
        return false;
    }
    if let Ok(program) = program.try_clone() {
        CONFIRMED
            .lock()
            .unwrap_or_else(PoisonError::into_inner)
            .push(Confirmed {
                program,
                installed: installed.to_owned(),
                installed_file: now,
            });
    }
    true
}
