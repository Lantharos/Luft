//! Startup apps are copies of their launchers in the autostart folder, since desktops start
//! whatever an autostart entry says rather than following a launcher. Whenever Luft writes or
//! removes a launcher, the copy follows it.

mod entry;

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

const DEFAULT_DATA_DIRS: &str = "/usr/local/share:/usr/share";

struct Folders {
    autostart: PathBuf,
    applications: Vec<PathBuf>,
}

impl Folders {
    fn of_session() -> Self {
        let system = std::env::var("XDG_DATA_DIRS").unwrap_or_else(|_| DEFAULT_DATA_DIRS.into());
        let applications = dirs::data_dir()
            .into_iter()
            .chain(
                system
                    .split(':')
                    .filter(|folder| !folder.is_empty())
                    .map(PathBuf::from),
            )
            .map(|folder| folder.join("applications"))
            .collect();
        Self {
            autostart: dirs::config_dir().unwrap_or_default().join("autostart"),
            applications,
        }
    }

    fn launcher(&self, name: &str) -> Option<PathBuf> {
        self.applications
            .iter()
            .map(|folder| folder.join(name))
            .find(|path| path.is_file())
    }

    fn add(&self, name: &str, launcher: &Path) -> io::Result<()> {
        let launcher = fs::read_to_string(launcher)?;
        fs::create_dir_all(&self.autostart)?;
        fs::write(
            self.autostart.join(name),
            entry::from_launcher(&launcher, &entry::starting()),
        )
    }

    fn refresh(&self, name: &str) -> io::Result<()> {
        let path = self.autostart.join(name);
        let current = match fs::read_to_string(&path) {
            Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(()),
            read => read?,
        };
        let Some(launcher) = self
            .launcher(name)
            .filter(|_| !entry::written_by_app(&current))
        else {
            return Ok(());
        };
        let refreshed =
            entry::from_launcher(&fs::read_to_string(launcher)?, &entry::choices(&current));
        if refreshed == current {
            return Ok(());
        }
        fs::write(path, refreshed)
    }

    fn refresh_all(&self) -> io::Result<()> {
        let entries = match fs::read_dir(&self.autostart) {
            Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(()),
            entries => entries?,
        };
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().into_owned();
            if name.ends_with(".desktop") {
                self.refresh(&name)?;
            }
        }
        Ok(())
    }

    fn forget(&self, name: &str) -> io::Result<()> {
        match fs::remove_file(self.autostart.join(name)) {
            Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
            removed => removed,
        }
    }
}

/// Starts the app with launcher `launcher`, named `name` like its desktop entry, when you sign in.
pub fn add(name: &str, launcher: &Path) -> io::Result<()> {
    Folders::of_session().add(name, launcher)
}

/// Brings the startup entry named `name` in line with the app's launcher of the same name.
pub fn refresh(name: &str) -> io::Result<()> {
    Folders::of_session().refresh(name)
}

/// Brings every startup entry in line with its app's launcher.
pub fn refresh_all() -> io::Result<()> {
    Folders::of_session().refresh_all()
}

/// Stops starting the app, for when it's removed.
pub fn forget(name: &str) -> io::Result<()> {
    Folders::of_session().forget(name)
}

#[cfg(test)]
mod tests;
