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
use super::{Problem, State, Theme};
use crate::files::{copy_changed, write_changed};
use crate::home::{Home, on_path};
use crate::look::Look;
use crate::serve::{Event, say_state};

const THEME: &str = "Luft";
const PREVIOUS: &str = "previous-theme";
const FLATPAK: &str = "com.spotify.Client";
const FLATPAK_SPOTIFY: &str = "com.spotify.Client/current/active/files/extra/share/spotify";
const SYSTEM_FLATPAKS: &str = "/var/lib/flatpak/app";
const NATIVE: [&str; 5] = [
    "/opt/spotify",
    "/usr/share/spotify",
    "/usr/share/spotify-client",
    "/usr/libexec/spotify",
    "/usr/lib/spotify",
];
const LAUNCHER: &str = "spotify-launcher/install/usr/share/spotify";
const WANTED_SETTINGS: [(&str, &str); 4] = [
    ("inject_css", "1"),
    ("replace_colors", "1"),
    ("inject_theme_js", "1"),
    ("overwrite_assets", "1"),
];

pub struct Spotify {
    home: Home,
    assets: PathBuf,
    system_flatpaks: PathBuf,
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
            system_flatpaks: PathBuf::from(SYSTEM_FLATPAKS),
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

    /// Opens the stream that keeps Spotify following the desktop. Without it the theme still works, in the last look
    /// it heard, so a port someone else holds doesn't stop it from going in.
    fn listen(&mut self) {
        if self.listening {
            return;
        }
        let events = self.events.clone();
        let opened = Arc::clone(&self.stream).listen(self.port, move || {
            let _ = events.send(Event::Said("spotify", "connected"));
        });
        match opened {
            Ok(()) => self.listening = true,
            Err(error) => eprintln!("Couldn't open the local stream: {error}"),
        }
    }
}

/// What's selected now, each value on a line, the theme and color scheme first.
fn selected_now(spicetify: &Spicetify) -> String {
    let setting = |key: &str| spicetify.setting(key).unwrap_or_default();
    let mut lines = vec![setting("current_theme"), setting("color_scheme")];
    lines.extend(WANTED_SETTINGS.iter().map(|(key, _)| setting(key)));
    lines.join("\n") + "\n"
}

/// Puts the theme in place and applies it if Spotify doesn't have it yet. Says whether Spotify needs a restart to show it.
fn install(spicetify: &Spicetify, theme: &Path) -> io::Result<bool> {
    let installed = spicetify.themes().join(THEME);
    let changed = copy_changed(theme, &installed)?;
    let selected = spicetify.setting("current_theme").as_deref() == Some(THEME);
    if !selected {
        write_changed(
            &installed.join(PREVIOUS),
            selected_now(spicetify).as_bytes(),
        )?;
        spicetify.configure(&[("current_theme", THEME), ("color_scheme", "")])?;
    }
    let differing: Vec<_> = WANTED_SETTINGS
        .into_iter()
        .filter(|(key, value)| spicetify.setting(key).as_deref() != Some(*value))
        .collect();
    if !differing.is_empty() {
        spicetify.configure(&differing)?;
    }
    spicetify.find_prefs()?;
    let needed = changed
        || !selected
        || !differing.is_empty()
        || !spicetify.is_patched()
        || !spicetify.has_theme();
    if needed {
        spicetify.apply()?;
    }
    if !spicetify.has_theme() {
        let detail = "spicetify finished, but the theme isn't in spotify".to_owned();
        return Err(Problem::failed(detail).into());
    }
    Ok(needed)
}

fn restore(spicetify: &Spicetify) -> io::Result<()> {
    let installed = spicetify.themes().join(THEME);
    let Ok(previous) = fs::read_to_string(installed.join(PREVIOUS)) else {
        return Ok(());
    };
    let keys = ["current_theme", "color_scheme"]
        .into_iter()
        .chain(WANTED_SETTINGS.iter().map(|(key, _)| *key));
    let settings: Vec<_> = keys.zip(previous.lines()).collect();
    spicetify.configure(&settings)?;
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
            || self.home.data.join(LAUNCHER).is_dir()
    }

    fn apply(&mut self, look: &Look) -> io::Result<State> {
        self.on = true;
        let Some(spicetify) = self.spicetify() else {
            return Ok("no-spicetify");
        };
        spicetify.find_spotify(&[
            self.home.data.join("flatpak/app").join(FLATPAK_SPOTIFY),
            self.system_flatpaks.join(FLATPAK_SPOTIFY),
        ])?;
        if !spicetify.spotify().join("Apps").is_dir() {
            return Ok("no-spotify");
        }
        if !spicetify.can_write_to_spotify() {
            let command = spicetify.write_access_command();
            return Err(Problem::new("read-only", command).into());
        }
        self.listen();
        self.stream.publish(look);
        say_state("spotify", "working");
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
