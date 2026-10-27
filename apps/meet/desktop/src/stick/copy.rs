use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};

use luft_i18n::t;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use super::flash::Aligned;
use super::{Image, read_back_matches};
use crate::L10N;
use crate::protocol::Stage;

const SETTLE_EVERY: u64 = 64 << 20;
const SPARE: u64 = 16 << 20;
const STAGED: &str = ".part";

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Older {
    pub name: String,
    pub size: u64,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Fit {
    Beside,
    Replacing,
    No,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Room {
    pub free: u64,
    pub older: Vec<Older>,
    pub fit: Fit,
}

impl Room {
    pub fn new(root: &Path, free: u64, needed: u64) -> io::Result<Self> {
        let older = older(root)?;
        let replacing = older.iter().map(|older| older.size).sum();
        let fit = match order(free, needed, replacing) {
            Ok(Order::CopyFirst) => Fit::Beside,
            Ok(Order::RemoveFirst) => Fit::Replacing,
            Err(_) => Fit::No,
        };
        Ok(Self { free, older, fit })
    }
}

#[derive(Debug, PartialEq, Eq)]
pub enum Order {
    CopyFirst,
    RemoveFirst,
}

fn is_luft(name: &str) -> bool {
    let name = name.to_ascii_lowercase();
    name.starts_with("luft") && name.ends_with(".iso")
}

fn older(root: &Path) -> io::Result<Vec<Older>> {
    let mut found = Vec::new();
    for entry in fs::read_dir(root)? {
        let entry = entry?;
        let name = entry.file_name().to_string_lossy().into_owned();
        let metadata = entry.metadata()?;
        if metadata.is_file() && is_luft(&name) {
            found.push(Older {
                name,
                size: metadata.len(),
            });
        }
    }
    found.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(found)
}

fn order(free: u64, needed: u64, replacing: u64) -> Result<Order, u64> {
    let needed = needed + SPARE;
    if free >= needed {
        Ok(Order::CopyFirst)
    } else if free + replacing >= needed {
        Ok(Order::RemoveFirst)
    } else {
        Err(needed - free - replacing)
    }
}

fn staged(target: &Path) -> PathBuf {
    let mut name = target.as_os_str().to_owned();
    name.push(STAGED);
    PathBuf::from(name)
}

fn copy(
    image: &mut impl Read,
    length: u64,
    staged: &Path,
    mut progress: impl FnMut(u64),
) -> io::Result<[u8; 32]> {
    let mut file = File::create(staged)?;
    let mut buffer = Aligned::new();
    let mut hasher = Sha256::new();
    let mut done = 0u64;
    let mut settled = 0u64;
    while done < length {
        let chunk = buffer.bytes();
        let wanted = (length - done).min(chunk.len() as u64) as usize;
        image.read_exact(&mut chunk[..wanted])?;
        hasher.update(&chunk[..wanted]);
        file.write_all(&chunk[..wanted])?;
        done += wanted as u64;
        if done - settled >= SETTLE_EVERY {
            file.sync_data()?;
            settled = done;
        }
        progress(done);
    }
    file.sync_all()?;
    Ok(hasher.finalize().into())
}

fn digest(file: &mut File, mut progress: impl FnMut(u64)) -> io::Result<[u8; 32]> {
    let mut buffer = Aligned::new();
    let mut hasher = Sha256::new();
    let mut done = 0u64;
    loop {
        match file.read(buffer.bytes())? {
            0 => break,
            read => {
                hasher.update(&buffer.bytes()[..read]);
                done += read as u64;
                progress(done);
            }
        }
    }
    Ok(hasher.finalize().into())
}

fn remove(root: &Path, names: &[String]) -> Result<(), String> {
    for name in names {
        fs::remove_file(root.join(name))
            .map_err(|error| t!(L10N, "stick-older-not-removed", error = error.to_string()))?;
    }
    Ok(())
}

pub struct Ventoy<'a> {
    pub root: &'a Path,
    pub free: u64,
    pub uncached: fn(&Path) -> io::Result<File>,
}

pub fn add(
    ventoy: &Ventoy,
    image: &Image,
    replace: bool,
    progress: impl Fn(Stage, u64, u64),
) -> Result<(), String> {
    let mut iso = File::open(&image.path)
        .map_err(|error| t!(L10N, "stick-iso-unreadable", error = error.to_string()))?;
    let length = iso.metadata().map_err(|error| error.to_string())?.len();
    let name = image
        .path
        .file_name()
        .ok_or_else(|| t!(L10N, "stick-iso-no-name"))?
        .to_string_lossy()
        .into_owned();
    let older = older(ventoy.root).map_err(|error| error.to_string())?;
    let replaced: Vec<&Older> = older
        .iter()
        .filter(|older| replace || older.name == name)
        .collect();
    if !replace && !replaced.is_empty() {
        return Err(t!(L10N, "stick-iso-already-there", name = name));
    }
    let replacing = replaced.iter().map(|older| older.size).sum();
    let replaced: Vec<String> = replaced
        .into_iter()
        .map(|older| older.name.clone())
        .collect();
    let order = order(ventoy.free, length, replacing)
        .map_err(|short| t!(L10N, "stick-no-room", size = short.div_ceil(1_000_000)))?;
    if order == Order::RemoveFirst {
        remove(ventoy.root, &replaced)?;
    }
    let target = ventoy.root.join(&name);
    let staged = staged(&target);
    progress(Stage::Copying, 0, length);
    let written = copy(&mut iso, length, &staged, |done| {
        progress(Stage::Copying, done, length)
    })
    .map_err(|error| t!(L10N, "stick-copy-stopped", error = error.to_string()))?;
    image.matches(&written)?;
    progress(Stage::Verifying, 0, length);
    let mut copied = (ventoy.uncached)(&staged).map_err(|error| error.to_string())?;
    let read = digest(&mut copied, |done| progress(Stage::Verifying, done, length))
        .map_err(|error| t!(L10N, "stick-read-back-failed", error = error.to_string()))?;
    drop(copied);
    read_back_matches(&written, &read)?;
    if order == Order::CopyFirst {
        remove(ventoy.root, &replaced)?;
    }
    fs::rename(&staged, &target).map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    const GB: u64 = 1_000_000_000;

    #[test]
    fn only_luft_isos_count_as_older() {
        let root = std::env::temp_dir().join(format!("meet-older-{}", std::process::id()));
        fs::create_dir_all(root.join("ventoy")).unwrap();
        for name in [
            "luft-nightly.iso",
            "Luft-1.1.ISO",
            "fedora.iso",
            "luft-notes.txt",
        ] {
            fs::write(root.join(name), b"iso").unwrap();
        }
        let names: Vec<String> = older(&root)
            .unwrap()
            .into_iter()
            .map(|older| older.name)
            .collect();
        fs::remove_dir_all(&root).unwrap();
        assert_eq!(names, ["Luft-1.1.ISO", "luft-nightly.iso"]);
    }

    #[test]
    fn the_older_luft_goes_first_only_when_both_don_t_fit() {
        assert_eq!(order(20 * GB, 3 * GB, 3 * GB), Ok(Order::CopyFirst));
        assert_eq!(order(2 * GB, 3 * GB, 3 * GB), Ok(Order::RemoveFirst));
        assert_eq!(order(GB, 3 * GB, 0), Err(2 * GB + SPARE));
    }

    #[test]
    fn a_copy_reads_back_with_the_same_digest() {
        let path = std::env::temp_dir().join(format!("meet-copy-{}.iso", std::process::id()));
        let iso: Vec<u8> = (0..(5 << 20) + 17)
            .map(|index| (index % 253) as u8)
            .collect();
        let written = copy(&mut &iso[..], iso.len() as u64, &path, |_| {}).unwrap();
        let read = digest(&mut File::open(&path).unwrap(), |_| {}).unwrap();
        fs::remove_file(&path).unwrap();
        assert_eq!(read, written);
        assert_eq!(written, <[u8; 32]>::from(Sha256::digest(&iso)));
    }
}
