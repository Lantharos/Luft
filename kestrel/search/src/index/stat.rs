use std::path::Path;

use rustix::fs::{AtFlags, CWD, FileType, StatxFlags, statx};

const OWNER_WRITES: u32 = 0o200;

#[derive(Clone, Copy)]
pub struct Stat {
    pub kind: FileType,
    pub modified: i64,
    pub size: u64,
    pub mount: u64,
    pub writable: bool,
}

impl Stat {
    pub fn is_dir(&self) -> bool {
        self.kind == FileType::Directory
    }
}

pub fn stat(path: &Path) -> Option<Stat> {
    let info = statx(
        CWD,
        path,
        AtFlags::SYMLINK_NOFOLLOW,
        StatxFlags::TYPE
            | StatxFlags::MODE
            | StatxFlags::MTIME
            | StatxFlags::SIZE
            | StatxFlags::MNT_ID,
    )
    .ok()?;
    Some(Stat {
        kind: FileType::from_raw_mode(info.stx_mode.into()),
        modified: info.stx_mtime.tv_sec * 1_000_000_000 + i64::from(info.stx_mtime.tv_nsec),
        size: info.stx_size,
        mount: info.stx_mnt_id,
        writable: u32::from(info.stx_mode) & OWNER_WRITES != 0,
    })
}
