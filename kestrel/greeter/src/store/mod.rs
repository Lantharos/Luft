mod config;
mod wallpaper;

use std::fs;
use std::io;
use std::path::PathBuf;

pub use config::Config;
pub use wallpaper::prepare as prepare_wallpaper;

use crate::files::{self, write_atomically};

const WALLPAPER: &str = "wallpaper.jpg";

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

    pub fn save_shared_wallpaper(&self, jpeg: &[u8]) -> io::Result<()> {
        write_atomically(&self.shared_wallpaper_path(), jpeg)
    }

    pub fn clear_shared_wallpaper(&self) -> io::Result<()> {
        files::remove(&self.shared_wallpaper_path())
    }

    pub fn save_user_wallpaper(&self, uid: u32, jpeg: &[u8]) -> io::Result<()> {
        let path = self
            .root
            .join("users")
            .join(uid.to_string())
            .join(WALLPAPER);
        write_atomically(&path, jpeg)
    }

    fn config_path(&self) -> PathBuf {
        self.root.join("config.json")
    }

    fn shared_wallpaper_path(&self) -> PathBuf {
        self.root.join("shared").join(WALLPAPER)
    }
}
