use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use crate::mode::Mode;
use crate::sign_in::SignInDevices;
use crate::trust::Trusted;

const STATE: &str = "var/lib/portguard";
const SIGN_IN_DEVICES: &str = "var/lib/luft-sign-in/devices";
const MODE: &str = "mode";
const TRUSTED: &str = "trusted";

/// Where the mode and the trusted devices are kept: `/var/lib/portguard`
/// of the system, or of the one mounted at `root` before it starts.
pub struct Store {
    folder: PathBuf,
    sign_in: PathBuf,
}

impl Store {
    pub fn system() -> Self {
        Self::under(Path::new("/"))
    }

    pub fn under(root: &Path) -> Self {
        Self {
            folder: root.join(STATE),
            sign_in: root.join(SIGN_IN_DEVICES),
        }
    }

    pub fn mode(&self) -> Mode {
        fs::read_to_string(self.folder.join(MODE))
            .ok()
            .and_then(|name| Mode::named(name.trim()))
            .unwrap_or_default()
    }

    pub fn save_mode(&self, mode: Mode) -> io::Result<()> {
        self.replace(MODE, mode.name())
    }

    pub fn trusted(&self) -> Trusted {
        fs::read_to_string(self.folder.join(TRUSTED))
            .map(|text| Trusted::parse(&text))
            .unwrap_or_default()
    }

    pub fn sign_in_devices(&self) -> SignInDevices {
        fs::read_to_string(&self.sign_in)
            .map(|text| SignInDevices::parse(&text))
            .unwrap_or_default()
    }

    pub fn save_trusted(&self, trusted: &Trusted) -> io::Result<()> {
        self.replace(TRUSTED, &trusted.render())
    }

    fn replace(&self, name: &str, contents: &str) -> io::Result<()> {
        let written = self.folder.join(format!(".{name}"));
        fs::write(&written, contents)?;
        fs::File::open(&written)?.sync_all()?;
        fs::rename(written, self.folder.join(name))
    }
}
