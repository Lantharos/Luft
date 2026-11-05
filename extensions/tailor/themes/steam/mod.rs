use std::ffi::OsStr;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use super::{State, Theme};
use crate::files::{copy_changed, replace, write_changed};
use crate::home::{Home, on_path};
use crate::look::Look;

const FLATPAK: &str = "com.valvesoftware.Steam";
const MARK: &[u8] = b"/* Tailor */";
const LIBRARY: &str = "library.css";
const ORIGINAL: &str = "library.original.css";
const FOLDER: &str = "tailor";
const SAVING: &str = ".library.tailor-saving";

/// What Steam reads instead of its own stylesheet. Steam's startup check compares file sizes, so this is padded to
/// the size of the file it stands in for.
fn stand_in(size: usize) -> io::Result<Vec<u8>> {
    let mut styles = MARK.to_vec();
    styles.extend_from_slice(
        format!(
            "\n@import url(\"{ORIGINAL}\");\n@import url(\"../{FOLDER}/look.css\");\n@import url(\"../{FOLDER}/steam.css\");\n"
        )
        .as_bytes(),
    );
    if styles.len() > size {
        return Err(io::Error::other("stylesheet too small to stand in for"));
    }
    styles.resize(size, b' ');
    Ok(styles)
}

/// One Steam's folder, the Flatpak's or the native one.
struct Install(PathBuf);

impl Install {
    fn interface(&self) -> PathBuf {
        self.0.join("steamui")
    }

    fn styles(&self) -> PathBuf {
        self.interface().join("css")
    }

    fn is_ready(&self) -> bool {
        self.styles().join(LIBRARY).is_file()
    }

    /// Keeps Steam's own file, under another name and untouched, and puts the stand-in in its place. Neither name
    /// is ever missing, whenever this stops.
    fn stand_in(&self) -> io::Result<()> {
        let library = self.styles().join(LIBRARY);
        let details = fs::metadata(&library)?;
        if fs::read(&library)?.starts_with(MARK) {
            return Ok(());
        }
        let saving = self.styles().join(SAVING);
        match fs::remove_file(&saving) {
            Err(error) if error.kind() != io::ErrorKind::NotFound => return Err(error),
            _ => {}
        }
        fs::hard_link(&library, &saving)?;
        fs::rename(&saving, self.styles().join(ORIGINAL))?;
        replace(
            &library,
            &stand_in(usize::try_from(details.len()).map_err(io::Error::other)?)?,
        )?;
        fs::set_permissions(&library, details.permissions())
    }

    fn apply(&self, assets: &Path, look: &Look) -> io::Result<()> {
        let folder = self.interface().join(FOLDER);
        copy_changed(assets, &folder)?;
        write_changed(&folder.join("look.css"), look.stylesheet().as_bytes())?;
        self.stand_in()
    }

    fn restore(&self) -> io::Result<()> {
        let library = self.styles().join(LIBRARY);
        let original = self.styles().join(ORIGINAL);
        if fs::read(&library).is_ok_and(|styles| styles.starts_with(MARK)) {
            fs::rename(original, library)?;
        } else if original.exists() {
            fs::remove_file(original)?;
        }
        let folder = self.interface().join(FOLDER);
        if folder.exists() {
            fs::remove_dir_all(folder)?;
        }
        Ok(())
    }
}

pub struct Steam {
    home: Home,
    assets: PathBuf,
    on: bool,
}

impl Steam {
    pub fn new(home: Home, assets: PathBuf) -> Self {
        Self {
            home,
            assets,
            on: false,
        }
    }

    fn installs(&self) -> Vec<Install> {
        [
            self.home.sandbox(FLATPAK).join(".local/share/Steam"),
            self.home.data.join("Steam"),
        ]
        .into_iter()
        .filter(|folder| folder.join("steamui").is_dir())
        .map(Install)
        .collect()
    }
}

impl Theme for Steam {
    fn id(&self) -> &'static str {
        "steam"
    }

    fn detect(&self) -> bool {
        self.home.has_flatpak(FLATPAK) || on_path("steam").is_some() || !self.installs().is_empty()
    }

    fn apply(&mut self, look: &Look) -> io::Result<State> {
        self.on = true;
        let installs = self.installs();
        let ready: Vec<_> = installs
            .iter()
            .filter(|install| install.is_ready())
            .collect();
        for install in &ready {
            install.apply(&self.assets, look)?;
        }
        Ok(if ready.is_empty() {
            "first-run"
        } else {
            "ready"
        })
    }

    fn refresh(&mut self, look: &Look) -> io::Result<State> {
        self.apply(look)
    }

    fn restore(&mut self) -> io::Result<()> {
        self.on = false;
        self.installs().iter().try_for_each(Install::restore)
    }

    fn watched(&self) -> Vec<PathBuf> {
        if !self.on {
            return Vec::new();
        }
        self.installs()
            .iter()
            .flat_map(|install| [install.interface(), install.styles()])
            .collect()
    }

    fn stirred_by(&self, name: &OsStr) -> bool {
        name == LIBRARY || name == "css" || name == FOLDER
    }
}

#[cfg(test)]
mod tests;
