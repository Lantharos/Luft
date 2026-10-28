use std::fs;
use std::path::PathBuf;

use luft_keyring_wire::Secret;

pub struct Handoffs {
    folder: PathBuf,
}

impl Handoffs {
    pub fn new(folder: PathBuf) -> Self {
        Self { folder }
    }

    fn path(&self, user: u32) -> PathBuf {
        self.folder.join(format!("{user}.handoff"))
    }

    pub fn waiting(&self, user: u32) -> bool {
        self.path(user).is_file()
    }

    pub fn key(&self, user: u32) -> Option<Secret> {
        fs::read(self.path(user)).ok().map(Secret::new)
    }
}
