use std::fs::{self, OpenOptions};
use std::io::{self, ErrorKind, Write};
use std::os::unix::fs::OpenOptionsExt;
use std::path::PathBuf;

use crate::chip::SealedBlob;

pub struct Seals {
    folder: PathBuf,
}

impl Seals {
    pub fn new(folder: PathBuf) -> Self {
        Self { folder }
    }

    fn path(&self, user: u32) -> PathBuf {
        self.folder.join(format!("{user}.seal"))
    }

    pub fn load(&self, user: u32) -> Option<SealedBlob> {
        postcard::from_bytes(&fs::read(self.path(user)).ok()?).ok()
    }

    pub fn store(&self, user: u32, blob: &SealedBlob) -> io::Result<()> {
        let bytes = postcard::to_stdvec(blob).map_err(io::Error::other)?;
        let staging = self.folder.join(format!("{user}.seal.new"));
        let mut file = OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .mode(0o600)
            .open(&staging)?;
        file.write_all(&bytes)?;
        file.sync_all()?;
        fs::rename(staging, self.path(user))
    }

    pub fn forget(&self, user: u32) -> io::Result<()> {
        match fs::remove_file(self.path(user)) {
            Err(error) if error.kind() != ErrorKind::NotFound => Err(error),
            _ => Ok(()),
        }
    }
}
