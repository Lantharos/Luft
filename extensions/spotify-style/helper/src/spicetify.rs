use std::env;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

const FLATPAK_PREFS: &str = ".var/app/com.spotify.Client/config/spotify/prefs";

pub struct Spicetify {
    program: PathBuf,
    home: PathBuf,
    config: PathBuf,
}

fn on_path(name: &str) -> Option<PathBuf> {
    env::split_paths(&env::var_os("PATH")?)
        .map(|folder| folder.join(name))
        .find(|program| program.is_file())
}

impl Spicetify {
    pub fn find() -> Option<Self> {
        let home = PathBuf::from(env::var_os("HOME")?);
        let installed = home.join(".spicetify/spicetify");
        let program = if installed.is_file() {
            installed
        } else {
            on_path("spicetify")?
        };
        let config = env::var_os("XDG_CONFIG_HOME")
            .map_or_else(|| home.join(".config"), PathBuf::from)
            .join("spicetify");
        Some(Self {
            program,
            home,
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
        Some(value.trim().replace("$HOME", &self.home.to_string_lossy()))
    }

    pub fn spotify(&self) -> PathBuf {
        PathBuf::from(self.setting("spotify_path").unwrap_or_default())
    }

    pub fn is_patched(&self) -> bool {
        !self.spotify().join("Apps/xpui.spa").exists()
    }

    fn prefs(&self) -> Option<PathBuf> {
        let flatpak = self.home.join(FLATPAK_PREFS);
        flatpak.is_file().then_some(flatpak)
    }

    fn run<'a>(&self, arguments: impl IntoIterator<Item = &'a str>) -> io::Result<bool> {
        let status = Command::new(&self.program)
            .args(arguments)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .status()?;
        Ok(status.success())
    }

    pub fn configure(&self, settings: &[(&str, &str)]) -> io::Result<()> {
        let arguments = settings.iter().flat_map(|(key, value)| [*key, *value]);
        if self.run(["config"].into_iter().chain(arguments))? {
            Ok(())
        } else {
            Err(io::Error::other("spicetify config failed"))
        }
    }

    /// Spicetify looks for Spotify's prefs outside Flatpak's folders and gives up, so it's told where they are.
    pub fn find_prefs(&self) -> io::Result<()> {
        if !self.setting("prefs_path").unwrap_or_default().is_empty() {
            return Ok(());
        }
        match self.prefs() {
            Some(prefs) => self.configure(&[(
                "prefs_path",
                prefs
                    .to_str()
                    .ok_or_else(|| io::Error::other("prefs path isn't text"))?,
            )]),
            None => Ok(()),
        }
    }

    /// Writes the current config into Spotify. It shows after Spotify restarts.
    pub fn apply(&self) -> io::Result<()> {
        let applied = if self.is_patched() {
            self.run(["-n", "apply"])?
        } else {
            self.run(["-n", "backup", "apply"])?
                || self.run(["-n", "restore", "backup", "apply"])?
        };
        if applied {
            Ok(())
        } else {
            Err(io::Error::other("spicetify apply failed"))
        }
    }
}

pub fn write_changed(path: &Path, contents: &[u8]) -> io::Result<bool> {
    if fs::read(path).is_ok_and(|current| current == contents) {
        return Ok(false);
    }
    if let Some(folder) = path.parent() {
        fs::create_dir_all(folder)?;
    }
    fs::write(path, contents)?;
    Ok(true)
}
