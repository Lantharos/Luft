use std::ffi::CString;
use std::fs::{self, OpenOptions};
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::{FileExt, MetadataExt, OpenOptionsExt};
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use rustix::fs::{FallocateFlags, IFlags, fallocate, ioctl_setflags};

use crate::plan::File;
use crate::system::Active;

const SWAP_FLAG_PREFER: i32 = 0x8000;
const SWAP_FLAG_DISCARD: i32 = 0x10000;
const HIGHEST_PRIORITY: u32 = 0x7fff;
const HEADER_VERSION: u32 = 1;
const MAGIC: &[u8] = b"SWAPSPACE2";

pub struct Swaps {
    directory: PathBuf,
    btrfs: bool,
    page: usize,
    files: Vec<(u32, u64)>,
}

impl Swaps {
    pub fn open(directory: &Path, btrfs: bool) -> Result<Self> {
        let mut swaps = Self {
            directory: directory.to_owned(),
            btrfs,
            page: rustix::param::page_size(),
            files: Vec::new(),
        };
        let active = crate::system::active_files()?;
        for entry in fs::read_dir(directory)? {
            let entry = entry?;
            let Some(index) = entry
                .file_name()
                .to_str()
                .and_then(|name| name.parse::<u32>().ok())
            else {
                continue;
            };
            let inode = entry.metadata()?.ino();
            let in_use = active.iter().any(|swap| swap.inode == inode);
            if in_use || (index == 0 && swaps.activate(index).is_ok()) {
                swaps.files.push((index, inode));
            } else {
                fs::remove_file(entry.path())
                    .with_context(|| format!("couldn't remove {}", entry.path().display()))?;
            }
        }
        swaps.files.sort_unstable();
        Ok(swaps)
    }

    fn path(&self, index: u32) -> PathBuf {
        self.directory.join(index.to_string())
    }

    pub fn files(&self, active: &[Active]) -> Vec<File> {
        let device = fs::metadata(&self.directory)
            .map(|folder| folder.dev())
            .ok();
        self.files
            .iter()
            .filter_map(|&(index, inode)| {
                let swap = active
                    .iter()
                    .find(|swap| swap.inode == inode && Some(swap.device) == device)?;
                Some(File {
                    index,
                    size: swap.size,
                    used: swap.used,
                })
            })
            .collect()
    }

    pub fn add(&mut self, index: u32, size: u64) -> Result<()> {
        let path = self.path(index);
        let made = self.make(&path, size).and_then(|()| self.activate(index));
        if let Err(error) = made {
            let _ = fs::remove_file(&path);
            return Err(error);
        }
        self.files.push((index, fs::metadata(&path)?.ino()));
        Ok(())
    }

    fn make(&self, path: &Path, size: u64) -> Result<()> {
        let file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .mode(0o600)
            .open(path)?;
        if self.btrfs {
            ioctl_setflags(&file, IFlags::NOCOW).context("couldn't turn off copy-on-write")?;
        }
        fallocate(&file, FallocateFlags::empty(), 0, size)
            .context("couldn't set the space aside")?;
        file.write_all_at(&header(size, self.page)?, 0)?;
        file.sync_all()?;
        Ok(())
    }

    fn activate(&self, index: u32) -> Result<()> {
        let path = CString::new(self.path(index).as_os_str().as_bytes())?;
        let priority = HIGHEST_PRIORITY.saturating_sub(index) as i32;
        // SAFETY: path is a valid NUL-terminated string that outlives the call.
        if unsafe {
            libc::swapon(
                path.as_ptr(),
                SWAP_FLAG_PREFER | SWAP_FLAG_DISCARD | priority,
            )
        } != 0
        {
            return Err(io::Error::last_os_error()).context("the kernel didn't take it as swap");
        }
        Ok(())
    }

    pub fn remove(&mut self, index: u32) -> Result<()> {
        let path = self.path(index);
        let name = CString::new(path.as_os_str().as_bytes())?;
        // SAFETY: name is a valid NUL-terminated string that outlives the call.
        if unsafe { libc::swapoff(name.as_ptr()) } != 0 {
            return Err(io::Error::last_os_error())
                .context("the kernel couldn't stop swapping to it");
        }
        self.files.retain(|&(file, _)| file != index);
        fs::remove_file(&path)?;
        Ok(())
    }
}

fn header(size: u64, page: usize) -> io::Result<Vec<u8>> {
    let mut header = vec![0; page];
    let last_page = (size / page as u64 - 1) as u32;
    header[1024..1028].copy_from_slice(&HEADER_VERSION.to_ne_bytes());
    header[1028..1032].copy_from_slice(&last_page.to_ne_bytes());
    header[1036..1052].copy_from_slice(&uuid()?);
    header[page - MAGIC.len()..].copy_from_slice(MAGIC);
    Ok(header)
}

fn uuid() -> io::Result<[u8; 16]> {
    let mut uuid = [0; 16];
    rustix::rand::getrandom(&mut uuid, rustix::rand::GetRandomFlags::empty())?;
    uuid[6] = uuid[6] & 0x0f | 0x40;
    uuid[8] = uuid[8] & 0x3f | 0x80;
    Ok(uuid)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn writes_a_swap_header_the_kernel_reads() {
        let header = header(4 << 30, 4096).unwrap();
        assert_eq!(header.len(), 4096);
        assert_eq!(&header[4086..], b"SWAPSPACE2");
        assert_eq!(
            u32::from_ne_bytes(header[1024..1028].try_into().unwrap()),
            1
        );
        assert_eq!(
            u32::from_ne_bytes(header[1028..1032].try_into().unwrap()),
            (1 << 20) - 1
        );
        assert_eq!(
            u32::from_ne_bytes(header[1032..1036].try_into().unwrap()),
            0
        );
        assert_eq!(header[1042] >> 4, 4);
    }
}
