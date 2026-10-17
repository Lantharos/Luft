use std::fs::{self, File};
use std::io::{self, BufWriter};
use std::path::{Path, PathBuf};

use ureq::Agent;

use super::download::{Download, Hashing, format_checksum, parse_checksum};

const CHECKSUM: &str = ".sha256";
const PARTIAL: &str = ".part";
const WRITE_BUFFER: usize = 1 << 20;

#[cfg(target_os = "linux")]
fn folder() -> io::Result<PathBuf> {
    let cache = std::env::var_os("XDG_CACHE_HOME")
        .map(PathBuf::from)
        .filter(|path| path.is_absolute())
        .or_else(|| std::env::var_os("HOME").map(|home| Path::new(&home).join(".cache")))
        .ok_or_else(|| io::Error::other("There's no home folder to keep Luft in"))?;
    Ok(cache.join("luft-meet"))
}

#[cfg(windows)]
fn folder() -> io::Result<PathBuf> {
    let local = std::env::var_os("LOCALAPPDATA")
        .ok_or_else(|| io::Error::other("There's no local app data folder to keep Luft in"))?;
    Ok(Path::new(&local).join(r"Lantharos\Meet Luft\Downloads"))
}

fn beside(path: &Path, suffix: &str) -> PathBuf {
    let mut name = path.as_os_str().to_owned();
    name.push(suffix);
    PathBuf::from(name)
}

fn name_of(url: &str) -> &str {
    url.rsplit('/').next().unwrap_or(url)
}

pub fn kept_at(folder: &Path, url: &str, checksum: &[u8; 32]) -> Option<PathBuf> {
    let path = folder.join(name_of(url));
    let recorded = fs::read_to_string(beside(&path, CHECKSUM)).ok()?;
    (parse_checksum(&recorded).as_ref() == Some(checksum) && path.is_file()).then_some(path)
}

pub fn kept(url: &str, checksum: &[u8; 32]) -> Option<PathBuf> {
    kept_at(&folder().ok()?, url, checksum)
}

pub fn forget(path: &Path) -> io::Result<()> {
    for file in [path.to_owned(), beside(path, CHECKSUM)] {
        match fs::remove_file(file) {
            Err(error) if error.kind() != io::ErrorKind::NotFound => return Err(error),
            _ => {}
        }
    }
    Ok(())
}

pub fn keep(
    agent: &Agent,
    url: &str,
    checksum: &[u8; 32],
    progress: impl FnMut(u64, u64),
) -> io::Result<PathBuf> {
    let folder = folder()?;
    if let Some(path) = kept_at(&folder, url, checksum) {
        return Ok(path);
    }
    fs::create_dir_all(&folder)?;
    let path = folder.join(name_of(url));
    forget(&path)?;
    let partial = beside(&path, PARTIAL);
    let result = fetch(agent, url, checksum, &partial, progress);
    if result.is_err() {
        let _ = fs::remove_file(&partial);
    }
    result?;
    fs::rename(&partial, &path)?;
    fs::write(
        beside(&path, CHECKSUM),
        format!("{}  {}\n", format_checksum(checksum), name_of(url)),
    )?;
    Ok(path)
}

fn fetch(
    agent: &Agent,
    url: &str,
    checksum: &[u8; 32],
    partial: &Path,
    mut progress: impl FnMut(u64, u64),
) -> io::Result<()> {
    let download = Download::open(agent, url)?;
    let total = download.total;
    let mut hashing = Hashing::new(download, |read| progress(read, total));
    let mut file = BufWriter::with_capacity(WRITE_BUFFER, File::create(partial)?);
    io::copy(&mut hashing, &mut file)?;
    file.into_inner()
        .map_err(io::IntoInnerError::into_error)?
        .sync_all()?;
    if &hashing.digest() != checksum {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "The download was damaged on the way. Try again.",
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_kept_iso_counts_only_with_the_same_checksum() {
        let folder = std::env::temp_dir().join(format!("meet-cache-{}", std::process::id()));
        fs::create_dir_all(&folder).unwrap();
        let url = "https://get.luft.computer/luft-nightly.iso";
        fs::write(folder.join("luft-nightly.iso"), b"iso").unwrap();
        fs::write(
            folder.join("luft-nightly.iso.sha256"),
            format!("{}  luft-nightly.iso\n", "ab".repeat(32)),
        )
        .unwrap();
        let kept = kept_at(&folder, url, &[0xab; 32]);
        let other = kept_at(&folder, url, &[0xcd; 32]);
        fs::remove_dir_all(&folder).unwrap();
        assert_eq!(kept, Some(folder.join("luft-nightly.iso")));
        assert_eq!(other, None);
    }
}
