mod live;
mod spicetify;
mod updates;

use std::ffi::OsStr;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::mpsc::Sender;

use self::live::Stream;
use self::spicetify::Spicetify;
use super::{State, Theme};
use crate::files::{copy_changed, write_changed};
use crate::home::{Home, on_path};
use crate::look::Look;
use crate::serve::Event;

const THEME: &str = "Luft";
const PREVIOUS: &str = "previous-theme";
const FLATPAK: &str = "com.spotify.Client";
const FLATPAK_SPOTIFY: &str =
    "flatpak/app/com.spotify.Client/current/active/files/extra/share/spotify";
const NATIVE: [&str; 3] = ["/opt/spotify", "/usr/share/spotify", "/usr/lib/spotify"];

pub struct Spotify {
    home: Home,
    assets: PathBuf,
    port: u16,
    stream: Arc<Stream>,
    events: Sender<Event>,
    listening: bool,
    on: bool,
}

impl Spotify {
    pub fn new(home: Home, assets: PathBuf, events: Sender<Event>) -> Self {
        Self {
            home,
            assets,
            port: live::PORT,
            stream: Arc::default(),
            events,
            listening: false,
            on: false,
        }
    }

    fn spicetify(&self) -> Option<Spicetify> {
        Spicetify::find(&self.home)
    }

    fn listen(&mut self) -> io::Result<()> {
        if self.listening {
            return Ok(());
        }
        let events = self.events.clone();
        Arc::clone(&self.stream).listen(self.port, move || {
            let _ = events.send(Event::Said("spotify", "connected"));
        })?;
        self.listening = true;
        Ok(())
    }
}

/// Puts the theme in place and applies it if Spotify doesn't have it yet. Says whether Spotify needs a restart to show it.
fn install(spicetify: &Spicetify, theme: &Path) -> io::Result<bool> {
    let installed = spicetify.themes().join(THEME);
    let changed = copy_changed(theme, &installed)?;
    let current = spicetify.setting("current_theme").unwrap_or_default();
    let selected = current == THEME;
    if !selected {
        let previous = format!(
            "{current}\n{}\n",
            spicetify.setting("color_scheme").unwrap_or_default()
        );
        write_changed(&installed.join(PREVIOUS), previous.as_bytes())?;
        spicetify.configure(&[
            ("current_theme", THEME),
            ("color_scheme", ""),
            ("inject_css", "1"),
            ("replace_colors", "1"),
            ("inject_theme_js", "1"),
            ("overwrite_assets", "1"),
        ])?;
    }
    spicetify.find_prefs()?;
    let needed = changed || !selected || !spicetify.is_patched();
    if needed {
        spicetify.apply()?;
    }
    Ok(needed)
}

fn restore(spicetify: &Spicetify) -> io::Result<()> {
    let installed = spicetify.themes().join(THEME);
    let Ok(previous) = fs::read_to_string(installed.join(PREVIOUS)) else {
        return Ok(());
    };
    let mut lines = previous.lines();
    let (theme, scheme) = (
        lines.next().unwrap_or_default(),
        lines.next().unwrap_or_default(),
    );
    spicetify.configure(&[
        ("current_theme", theme),
        ("color_scheme", scheme),
        ("overwrite_assets", "0"),
    ])?;
    spicetify.apply()?;
    fs::remove_dir_all(installed)
}

impl Theme for Spotify {
    fn id(&self) -> &'static str {
        "spotify"
    }

    fn detect(&self) -> bool {
        self.home.has_flatpak(FLATPAK)
            || on_path("spotify").is_some()
            || NATIVE.iter().any(|folder| Path::new(folder).is_dir())
    }

    fn apply(&mut self, look: &Look) -> io::Result<State> {
        self.on = true;
        let Some(spicetify) = self.spicetify() else {
            return Ok("no-spicetify");
        };
        spicetify.find_spotify(&self.home.data.join(FLATPAK_SPOTIFY))?;
        if !spicetify.spotify().is_dir() {
            return Ok("no-spotify");
        }
        self.listen()?;
        self.stream.publish(look);
        Ok(if install(&spicetify, &self.assets)? {
            "restart"
        } else {
            "ready"
        })
    }

    fn refresh(&mut self, look: &Look) -> io::Result<State> {
        self.stream.publish(look);
        Ok(if self.stream.has_listeners() {
            "connected"
        } else {
            "ready"
        })
    }

    fn restore(&mut self) -> io::Result<()> {
        self.on = false;
        self.stream.close();
        self.spicetify()
            .map_or(Ok(()), |spicetify| restore(&spicetify))
    }

    fn watched(&self) -> Vec<PathBuf> {
        if !self.on {
            return Vec::new();
        }
        self.spicetify()
            .map(|spicetify| updates::folders(&spicetify.spotify()))
            .unwrap_or_default()
    }

    fn stirred_by(&self, name: &OsStr) -> bool {
        updates::replaces_spotify(name)
            && self
                .spicetify()
                .is_some_and(|spicetify| !spicetify.is_patched())
    }
}

#[cfg(test)]
mod tests;
