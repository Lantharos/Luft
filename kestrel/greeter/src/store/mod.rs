mod config;
mod displays;
mod wallpaper;

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

pub use config::Config;
pub use displays::prepare as prepare_displays;
pub use wallpaper::{Focus, prepare as prepare_wallpaper};

use crate::files::{self, write_atomically};

const WALLPAPER: &str = "wallpaper.jpg";
const WALLPAPER_DETAILS: &str = "wallpaper.json";
const DISPLAYS: &str = "display/monitors.xml";

pub struct Store {
    root: PathBuf,
}

impl Store {
    pub fn new(root: PathBuf) -> Self {
        Self { root }
    }

    pub fn config(&self) -> Config {
        let path = self.config_path();
        match fs::read(&path) {
            Ok(contents) => serde_json::from_slice(&contents).unwrap_or_else(|error| {
                eprintln!("Ignoring {}: {error}", path.display());
                Config::default()
            }),
            Err(error) if error.kind() == io::ErrorKind::NotFound => Config::default(),
            Err(error) => {
                eprintln!("Couldn't read {}: {error}", path.display());
                Config::default()
            }
        }
    }

    pub fn save_config(&self, config: &Config) -> io::Result<()> {
        let contents = serde_json::to_vec_pretty(config).expect("the config serializes");
        write_atomically(&self.config_path(), &contents)
    }

    pub fn shared_wallpaper(&self) -> Option<PathBuf> {
        let path = self.shared_wallpaper_path();
        path.exists().then_some(path)
    }

    pub fn save_shared_wallpaper(&self, jpeg: &[u8], focus: Focus) -> io::Result<()> {
        save_wallpaper(&self.root.join("shared"), jpeg, focus)
    }

    pub fn clear_shared_wallpaper(&self) -> io::Result<()> {
        files::remove(&self.shared_wallpaper_path())?;
        files::remove(&self.root.join("shared").join(WALLPAPER_DETAILS))
    }

    pub fn save_user_wallpaper(&self, uid: u32, jpeg: &[u8], focus: Focus) -> io::Result<()> {
        save_wallpaper(&self.root.join("users").join(uid.to_string()), jpeg, focus)
    }

    pub fn save_displays(&self, arrangement: &[u8]) -> io::Result<()> {
        write_atomically(&self.root.join(DISPLAYS), arrangement)
    }

    fn config_path(&self) -> PathBuf {
        self.root.join("config.json")
    }

    fn shared_wallpaper_path(&self) -> PathBuf {
        self.root.join("shared").join(WALLPAPER)
    }
}

fn save_wallpaper(folder: &Path, jpeg: &[u8], focus: Focus) -> io::Result<()> {
    write_atomically(&folder.join(WALLPAPER_DETAILS), &focus.details())?;
    write_atomically(&folder.join(WALLPAPER), jpeg)
}
