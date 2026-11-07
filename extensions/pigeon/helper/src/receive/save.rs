use std::fs::FileTimes;
use std::io;
use std::path::{Component, Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::SystemTime;

use http_body_util::BodyExt;
use hyper::body::Incoming;
use nix::errno::Errno;
use nix::fcntl::{AT_FDCWD, RenameFlags, renameat2};
use sha2::{Digest, Sha256};
use tokio::fs::{self, File};
use tokio::io::{AsyncWriteExt, BufWriter};
use tokio::sync::watch;

use crate::app::random_id;
use crate::protocol::FileDto;

const BUFFER: usize = 1 << 20;

#[derive(Debug, PartialEq, Eq)]
pub enum Failure {
    Stopped,
    Checksum,
    Broken,
}

impl From<io::Error> for Failure {
    fn from(_: io::Error) -> Self {
        Self::Broken
    }
}

/// Streams one file to disk next to where it goes, and moves it there under a name nothing has yet once it's whole.
pub async fn save(folder: &Path, file: &FileDto, body: Incoming, done: &AtomicU64, stop: watch::Receiver<bool>) -> Result<PathBuf, Failure> {
    let wanted = folder.join(relative(&file.file_name));
    let parent = wanted.parent().unwrap_or(folder);
    fs::create_dir_all(parent).await?;
    let partial = parent.join(format!(".{}.{}.part", wanted.file_name().unwrap_or_default().to_string_lossy(), random_id()));
    let written = write(&partial, file, body, done, stop).await;
    let saved = match written {
        Ok(()) => keep(&partial, &wanted),
        Err(failure) => Err(failure),
    };
    if saved.is_err() {
        let _ = fs::remove_file(&partial).await;
    }
    saved
}

async fn write(partial: &Path, file: &FileDto, mut body: Incoming, done: &AtomicU64, mut stop: watch::Receiver<bool>) -> Result<(), Failure> {
    let mut output = BufWriter::with_capacity(BUFFER, File::create(partial).await?);
    let mut hash = file.sha256.as_ref().map(|_| Sha256::new());
    let mut written = 0u64;
    loop {
        let frame = tokio::select! {
            frame = body.frame() => frame,
            _ = stop.wait_for(|stopped| *stopped) => return Err(Failure::Stopped),
        };
        let Some(frame) = frame else { break };
        let Ok(data) = frame.map_err(|_| Failure::Broken)?.into_data() else { continue };
        written += data.len() as u64;
        if written > file.size {
            return Err(Failure::Broken);
        }
        if let Some(hash) = &mut hash {
            hash.update(&data);
        }
        output.write_all(&data).await?;
        done.fetch_add(data.len() as u64, Ordering::Relaxed);
    }
    if written != file.size {
        return Err(Failure::Broken);
    }
    if let (Some(hash), Some(expected)) = (hash, &file.sha256) {
        let actual: String = hash.finalize().iter().map(|byte| format!("{byte:02x}")).collect();
        if !actual.eq_ignore_ascii_case(expected) {
            return Err(Failure::Checksum);
        }
    }
    output.flush().await?;
    let output = output.into_inner().into_std().await;
    if let Some(modified) = modified(file) {
        let _ = output.set_times(FileTimes::new().set_modified(modified));
    }
    tokio::task::spawn_blocking(move || output.sync_all()).await.map_err(|_| Failure::Broken)??;
    Ok(())
}

/// Moves the finished file to `wanted`, or to "name (2).ext" and on when that's taken, never over another file.
fn keep(partial: &Path, wanted: &Path) -> Result<PathBuf, Failure> {
    for attempt in 1u32.. {
        let target = numbered(wanted, attempt);
        match renameat2(AT_FDCWD, partial, AT_FDCWD, &target, RenameFlags::RENAME_NOREPLACE) {
            Ok(()) => return Ok(target),
            Err(Errno::EEXIST) => continue,
            Err(_) => return Err(Failure::Broken),
        }
    }
    unreachable!("a free name turns up")
}

fn numbered(wanted: &Path, attempt: u32) -> PathBuf {
    if attempt == 1 {
        return wanted.to_path_buf();
    }
    let name = wanted.file_name().unwrap_or_default().to_string_lossy();
    let numbered = match name.rsplit_once('.') {
        Some((stem, extension)) if !stem.is_empty() => format!("{stem} ({attempt}).{extension}"),
        _ => format!("{name} ({attempt})"),
    };
    wanted.with_file_name(numbered)
}

/// Where a file goes inside the folder: the folders a sender names stay, but nothing can climb out of it.
pub fn relative(name: &str) -> PathBuf {
    let cleaned: PathBuf = Path::new(&name.replace('\\', "/").replace('\0', ""))
        .components()
        .filter_map(|component| match component {
            Component::Normal(part) => Some(part.to_owned()),
            _ => None,
        })
        .collect();
    if cleaned.as_os_str().is_empty() { PathBuf::from("file") } else { cleaned }
}

fn modified(file: &FileDto) -> Option<SystemTime> {
    let stamp: jiff::Timestamp = file.metadata.as_ref()?.modified.as_deref()?.parse().ok()?;
    Some(SystemTime::from(stamp))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keeps_received_files_inside_the_folder() {
        assert_eq!(relative("../../.ssh/authorized_keys"), PathBuf::from(".ssh/authorized_keys"));
        assert_eq!(relative("/etc/passwd"), PathBuf::from("etc/passwd"));
        assert_eq!(relative("Photos\\2026\\cat.jpg"), PathBuf::from("Photos/2026/cat.jpg"));
        assert_eq!(relative(".."), PathBuf::from("file"));
    }

    #[test]
    fn never_replaces_a_file_already_there() {
        let folder = tempfile::tempdir().unwrap();
        let wanted = folder.path().join("cat.jpg");
        std::fs::write(&wanted, b"first").unwrap();
        let partial = folder.path().join(".part");
        std::fs::write(&partial, b"second").unwrap();
        let kept = keep(&partial, &wanted).unwrap();
        assert_eq!(kept, folder.path().join("cat (2).jpg"));
        assert_eq!(std::fs::read(&wanted).unwrap(), b"first");
        assert_eq!(numbered(&folder.path().join(".bashrc"), 2), folder.path().join(".bashrc (2)"));
    }
}
