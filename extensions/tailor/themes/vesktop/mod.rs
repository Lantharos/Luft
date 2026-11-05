mod settings;

use std::ffi::OsStr;
use std::fs;
use std::io;
use std::os::unix::net::UnixStream;
use std::path::{Path, PathBuf};

use super::{State, Theme};
use crate::files::write_changed;
use crate::home::{Home, on_path};
use crate::look::Look;

const FLATPAK: &str = "dev.vencord.Vesktop";
const FILE: &str = "luft.theme.css";
const HEADER: &str = "/**\n * @name Luft\n * @description The desktop's colors, fonts and light and dark styles\n * @author Tailor\n */\n";
/// Discord's window can't load fonts from Vesktop's themes folder, so they come inside the theme, as `fonts.css`.
const STYLES: &str = include_str!("vesktop.css");
const LOCK: &str = "SingletonLock";
const SOCKET: &str = "SingletonSocket";

/// One Vesktop's folder, the Flatpak's or the native one.
struct Install(PathBuf);

impl Install {
    fn settings(&self) -> PathBuf {
        self.0.join("settings/settings.json")
    }

    fn theme(&self) -> PathBuf {
        self.0.join("themes").join(FILE)
    }

    /// Whether Vesktop is open. It holds its settings in memory and writes them whole, so the file is only ours to
    /// change while it's closed. A crash leaves the lock behind, but then nothing answers on the socket. Anything
    /// else that goes wrong asking counts as open.
    fn running(&self) -> bool {
        if self.0.join(LOCK).symlink_metadata().is_err() {
            return false;
        }
        let socket = self.0.join(SOCKET);
        let socket = fs::read_link(&socket).unwrap_or(socket);
        !matches!(
            UnixStream::connect(socket).map_err(|error| error.kind()),
            Err(io::ErrorKind::ConnectionRefused | io::ErrorKind::NotFound)
        )
    }

    fn apply(&self, fonts: &str, look: &Look) -> io::Result<State> {
        let theme = format!("{HEADER}{}{fonts}{STYLES}", look.stylesheet());
        write_changed(&self.theme(), theme.as_bytes())?;
        match settings::lists(&self.settings(), FILE)? {
            None => Ok("first-run"),
            Some(true) => Ok("ready"),
            Some(false) if self.running() => Ok("quit-once"),
            Some(false) if settings::enable(&self.settings(), FILE)? => Ok("ready"),
            Some(false) => Ok("first-run"),
        }
    }

    fn listed(&self) -> bool {
        matches!(settings::lists(&self.settings(), FILE), Ok(Some(true)))
    }

    fn restore(&self) -> io::Result<()> {
        match fs::remove_file(self.theme()) {
            Err(error) if error.kind() != io::ErrorKind::NotFound => return Err(error),
            _ => {}
        }
        if self.listed() && !self.running() {
            settings::disable(&self.settings(), FILE)?;
        }
        Ok(())
    }
}

pub struct Vesktop {
    home: Home,
    fonts: PathBuf,
    on: bool,
}

impl Vesktop {
    pub fn new(home: Home, fonts: PathBuf) -> Self {
        Self {
            home,
            fonts,
            on: false,
        }
    }

    fn installs(&self) -> Vec<Install> {
        [
            self.home.sandbox(FLATPAK).join("config/vesktop"),
            self.home.config.join("vesktop"),
        ]
        .into_iter()
        .filter(|folder| folder.is_dir())
        .map(Install)
        .collect()
    }

    fn folders(&self, wanted: impl Fn(&Install) -> bool) -> Vec<PathBuf> {
        self.installs()
            .into_iter()
            .filter(wanted)
            .map(|install| install.0)
            .collect()
    }
}

fn worst(first: State, second: State) -> State {
    if first == "ready" { second } else { first }
}

impl Theme for Vesktop {
    fn id(&self) -> &'static str {
        "vesktop"
    }

    fn detect(&self) -> bool {
        self.home.has_flatpak(FLATPAK)
            || on_path("vesktop").is_some()
            || !self.installs().is_empty()
    }

    fn apply(&mut self, look: &Look) -> io::Result<State> {
        self.on = true;
        let fonts = fs::read_to_string(&self.fonts)?;
        let mut state = "first-run";
        for (index, install) in self.installs().iter().enumerate() {
            let applied = install.apply(&fonts, look)?;
            state = if index == 0 {
                applied
            } else {
                worst(state, applied)
            };
        }
        Ok(state)
    }

    fn refresh(&mut self, look: &Look) -> io::Result<State> {
        self.apply(look)
    }

    fn restore(&mut self) -> io::Result<()> {
        self.on = false;
        self.installs().iter().try_for_each(Install::restore)
    }

    fn watched(&self) -> Vec<PathBuf> {
        let on = self.on;
        self.folders(|install| on || install.listed())
    }

    fn stirred_by(&self, name: &OsStr) -> bool {
        Path::new(name) == Path::new(LOCK)
    }
}

#[cfg(test)]
mod tests;
