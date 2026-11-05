use std::fs::{self, File};
use std::io;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use crate::home::{Home, on_path};
use crate::themes::{Problem, State};

const FLATPAK_PREFS: &str = ".var/app/com.spotify.Client/config/spotify/prefs";
const UNPATCHED_APP: &str = "Apps/xpui.spa";
const THEME_SCRIPT: &str = "Apps/xpui/extensions/theme.js";
const WRITE_CHECK: &str = "Apps/.tailor-can-write";
const PROGRAM_NAMES: [&str; 2] = ["spicetify", "spicetify-cli"];
const USUAL_FOLDERS: [&str; 3] = [".spicetify", ".local/bin", ".nix-profile/bin"];
const SHARED_FOLDERS: [&str; 2] = ["/home/linuxbrew/.linuxbrew/bin", "/usr/local/bin"];

pub struct Spicetify {
    program: PathBuf,
    home: PathBuf,
    config: PathBuf,
}

struct Ran {
    succeeded: bool,
    said: String,
}

impl Ran {
    fn has(&self, words: &str) -> bool {
        self.said.contains(words)
    }

    /// The last thing Spicetify called an error, without the colours it prints for a terminal.
    fn last_error(&self) -> String {
        let plain = |line: &str| {
            let mut text = String::new();
            let mut escape = false;
            for letter in line.chars() {
                match letter {
                    '\u{1b}' => escape = true,
                    'm' if escape => escape = false,
                    _ if escape => {}
                    _ => text.push(letter),
                }
            }
            text.trim().to_owned()
        };
        let lines: Vec<_> = self.said.lines().map(plain).collect();
        lines
            .iter()
            .rev()
            .find(|line| line.to_lowercase().contains("error") || line.contains("FATAL"))
            .or_else(|| lines.iter().rev().find(|line| !line.is_empty()))
            .cloned()
            .unwrap_or_default()
    }

    /// What people can do about it, when Spicetify says something that's known.
    fn state(&self) -> Option<State> {
        if self.has("permission denied") || self.has("read-only file system") {
            Some("read-only")
        } else if self.has("\"prefs\" file location") || self.has("prefs_path") {
            Some("no-prefs")
        } else if self.has("Spotify location") || self.has("\"spotify_path\"") {
            Some("no-spotify")
        } else if self.has("cannot be backed up at this state") {
            Some("not-stock")
        } else if self.has("version mismatch with Spicetify") {
            Some("too-new")
        } else {
            None
        }
    }
}

fn program(home: &Home) -> Option<PathBuf> {
    let usual = USUAL_FOLDERS.iter().map(|folder| home.home.join(folder));
    let shared = SHARED_FOLDERS.iter().map(PathBuf::from);
    usual
        .chain(shared)
        .flat_map(|folder| PROGRAM_NAMES.map(|name| folder.join(name)))
        .find(|program| program.is_file())
        .or_else(|| PROGRAM_NAMES.into_iter().find_map(on_path))
}

/// Where Spicetify keeps its config. Asking it covers where it was told to, and moves a very old one to its place.
fn config_folder(program: &Path) -> Option<PathBuf> {
    let output = Command::new(program)
        .arg("-c")
        .stdin(Stdio::null())
        .output()
        .ok()?;
    let said = String::from_utf8_lossy(&output.stdout);
    let file = said.lines().rev().find(|line| line.ends_with(".ini"))?;
    Some(Path::new(file.trim()).parent()?.to_owned())
}

impl Spicetify {
    pub fn find(home: &Home) -> Option<Self> {
        let program = program(home)?;
        let config = config_folder(&program).unwrap_or_else(|| home.config.join("spicetify"));
        Some(Self {
            program,
            home: home.home.clone(),
            config,
        })
    }

    pub fn themes(&self) -> PathBuf {
        self.config.join("Themes")
    }

    /// The value of a key in Spicetify's config, with `$HOME` written out.
    pub fn setting(&self, key: &str) -> Option<String> {
        let config = fs::read_to_string(self.config.join("config-xpui.ini")).ok()?;
        let value = config
            .lines()
            .find_map(|line| line.split_once('=').filter(|(name, _)| name.trim() == key))?
            .1;
        let home = self.home.to_string_lossy();
        Some(
            value
                .trim()
                .replace("${HOME}", &home)
                .replace("$HOME", &home),
        )
    }

    pub fn spotify(&self) -> PathBuf {
        PathBuf::from(self.setting("spotify_path").unwrap_or_default())
    }

    pub fn is_patched(&self) -> bool {
        !self.spotify().join(UNPATCHED_APP).exists()
    }

    pub fn has_theme(&self) -> bool {
        self.spotify().join(THEME_SCRIPT).is_file()
    }

    /// Whether Spicetify can change Spotify's files, which it can't in a system-wide Flatpak or package as it comes.
    pub fn can_write_to_spotify(&self) -> bool {
        let check = self.spotify().join(WRITE_CHECK);
        let writable = File::create(&check).is_ok();
        if writable {
            let _ = fs::remove_file(check);
        }
        writable
    }

    /// What to run so it can, for Settings to show.
    pub fn write_access_command(&self) -> String {
        format!("sudo chmod -R a+wr {}", self.spotify().display())
    }

    fn run<'a>(&self, arguments: impl IntoIterator<Item = &'a str>) -> io::Result<Ran> {
        let output = Command::new(&self.program)
            .args(arguments)
            .stdin(Stdio::null())
            .output()?;
        let said = [output.stdout, output.stderr]
            .iter()
            .map(|text| String::from_utf8_lossy(text).into_owned())
            .collect::<Vec<_>>()
            .join("\n");
        Ok(Ran {
            succeeded: output.status.success(),
            said,
        })
    }

    pub fn configure(&self, settings: &[(&str, &str)]) -> io::Result<()> {
        let arguments = settings.iter().flat_map(|(key, value)| [*key, *value]);
        let ran = self.run(["config"].into_iter().chain(arguments))?;
        if ran.succeeded {
            Ok(())
        } else {
            Err(Problem::failed(ran.last_error()).into())
        }
    }

    /// Spicetify looks for Spotify's prefs outside Flatpak's folders and gives up, so it's told where they are, and
    /// again when the ones it knows of are gone, such as after moving from a package to the Flatpak.
    pub fn find_prefs(&self) -> io::Result<()> {
        let known = self.setting("prefs_path").unwrap_or_default();
        let flatpak = self.home.join(FLATPAK_PREFS);
        if Path::new(&known).is_file() || !flatpak.is_file() {
            return Ok(());
        }
        self.configure(&[("prefs_path", &flatpak.to_string_lossy())])
    }

    /// Spicetify doesn't look inside every Flatpak folder for Spotify, so it's told where a Flatpak one is.
    pub fn find_spotify(&self, flatpaks: &[PathBuf]) -> io::Result<()> {
        if self.spotify().join("Apps").is_dir() {
            return Ok(());
        }
        match flatpaks.iter().find(|folder| folder.join("Apps").is_dir()) {
            Some(folder) => self.configure(&[("spotify_path", &folder.to_string_lossy())]),
            None => Ok(()),
        }
    }

    /// Writes the current config into Spotify, which shows after it restarts. A backup left by an older Spotify
    /// stops Spicetify, so the last attempt puts that back first, whichever state Spotify is in.
    pub fn apply(&self) -> io::Result<()> {
        let attempts: &[&[&str]] = if self.is_patched() {
            &[&["-n", "apply"], &["-n", "restore", "backup", "apply"]]
        } else {
            &[
                &["-n", "backup", "apply"],
                &["-n", "restore", "backup", "apply"],
            ]
        };
        let mut last = None;
        for attempt in attempts {
            let ran = self.run(attempt.iter().copied())?;
            let done = ran.succeeded;
            last = Some(ran);
            if done {
                break;
            }
        }
        let ran = last.expect("there's always an attempt");
        match ran.state() {
            None if ran.succeeded => Ok(()),
            Some(state) => Err(Problem::new(state, ran.last_error()).into()),
            None => Err(Problem::failed(ran.last_error()).into()),
        }
    }
}
