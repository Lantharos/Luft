mod palette;
mod recolor;

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
            "\n@import url(\"{ORIGINAL}\");\n@import url(\"../{FOLDER}/look.css\");\n@import url(\"../{FOLDER}/steam.css\");\n@import url(\"../{FOLDER}/recolored.css\");\n"
        )
        .as_bytes(),
    );
    if styles.len() > size {
        return Err(io::Error::other("stylesheet too small to stand in for"));
    }
    styles.resize(size, b' ');
    Ok(styles)
}

/// A stylesheet that came with an update, which needs recoloring too.
fn is_steam_sheet(name: &OsStr) -> bool {
    Path::new(name)
        .extension()
        .is_some_and(|extension| extension == "css")
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
        let wanted = stand_in(usize::try_from(details.len()).map_err(io::Error::other)?)?;
        let current = fs::read(&library)?;
        if current == wanted {
            return Ok(());
        }
        if current.starts_with(MARK) {
            replace(&library, &wanted)?;
            return fs::set_permissions(&library, details.permissions());
        }
        let saving = self.styles().join(SAVING);
        match fs::remove_file(&saving) {
            Err(error) if error.kind() != io::ErrorKind::NotFound => return Err(error),
            _ => {}
        }
        fs::hard_link(&library, &saving)?;
        fs::rename(&saving, self.styles().join(ORIGINAL))?;
        replace(&library, &wanted)?;
        fs::set_permissions(&library, details.permissions())
    }

    fn refresh(&self, look: &Look) -> io::Result<()> {
        let path = self.interface().join(FOLDER).join("look.css");
        write_changed(&path, look.stylesheet().as_bytes()).map(|_| ())
    }

    /// Steam's own stylesheets, each once: the stand-in is skipped, as what it replaced is there under its new name.
    fn recolored(&self) -> io::Result<String> {
        let mut sheets: Vec<_> = fs::read_dir(self.styles())?
            .filter_map(|entry| entry.ok().map(|entry| entry.path()))
            .filter(|path| {
                path.extension().is_some_and(|extension| extension == "css")
                    && path.file_name().is_some_and(|name| name != LIBRARY)
            })
            .collect();
        sheets.sort();
        let mut recolored = String::new();
        for sheet in sheets {
            recolor::recolor(&String::from_utf8_lossy(&fs::read(sheet)?), &mut recolored);
        }
        Ok(recolored)
    }

    fn apply(&self, assets: &Path, look: &Look) -> io::Result<()> {
        let folder = self.interface().join(FOLDER);
        copy_changed(assets, &folder)?;
        self.refresh(look)?;
        self.stand_in()?;
        write_changed(&folder.join("recolored.css"), self.recolored()?.as_bytes()).map(|_| ())
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
        for install in self.installs() {
            if install.interface().join(FOLDER).is_dir() {
                install.refresh(look)?;
            }
        }
        Ok("ready")
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
        name == "css" || name == FOLDER || is_steam_sheet(name)
    }
}

#[cfg(test)]
mod tests;
