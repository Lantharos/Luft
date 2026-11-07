mod choices;
mod config;
mod displays;
mod style;
mod wallpaper;

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

pub use choices::{SignInMethod, Style};
pub use config::Config;
pub use displays::prepare as prepare_displays;
pub use style::StyleChoice;
pub use wallpaper::{Focus, encode as encode_wallpaper, read as read_wallpaper};

use crate::files::{self, Readers, write_atomically};

const WALLPAPER: &str = "wallpaper.jpg";
const WALLPAPER_DETAILS: &str = "wallpaper.json";
const DARK_WALLPAPER: &str = "wallpaper-dark.jpg";
const DARK_WALLPAPER_DETAILS: &str = "wallpaper-dark.json";
const DISPLAYS: &str = "display/monitors.xml";
const USER_DISPLAYS: &str = "monitors.xml";
const USER_NUM_LOCK: &str = "num-lock";
const USER_SIGN_IN_METHOD: &str = "sign-in-method";
const USER_STYLE: &str = "style.json";

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
        write_atomically(&self.config_path(), &contents, Readers::Everyone)
    }

    pub fn shared_wallpaper(&self) -> Option<PathBuf> {
        let path = self.shared_wallpaper_path();
        path.exists().then_some(path)
    }

    pub fn save_shared_wallpaper(&self, jpeg: &[u8], focus: Focus) -> io::Result<()> {
        save_wallpaper(
            &self.root.join("shared"),
            [WALLPAPER, WALLPAPER_DETAILS],
            jpeg,
            focus,
            Readers::Everyone,
        )
    }

    pub fn clear_shared_wallpaper(&self) -> io::Result<()> {
        files::remove(&self.shared_wallpaper_path())?;
        files::remove(&self.root.join("shared").join(WALLPAPER_DETAILS))
    }

    pub fn save_user_wallpapers(
        &self,
        uid: u32,
        light: (&[u8], Focus),
        dark: Option<(&[u8], Focus)>,
    ) -> io::Result<()> {
        let folder = self.user_folder(uid);
        let names = [DARK_WALLPAPER, DARK_WALLPAPER_DETAILS];
        match dark {
            Some((jpeg, focus)) => {
                save_wallpaper(&folder, names, jpeg, focus, Readers::LoginScreen)?
            }
            None => {
                for name in names {
                    files::remove(&folder.join(name))?;
                }
            }
        }
        let (jpeg, focus) = light;
        save_wallpaper(
            &folder,
            [WALLPAPER, WALLPAPER_DETAILS],
            jpeg,
            focus,
            Readers::LoginScreen,
        )
    }

    pub fn user_displays(&self, uid: u32) -> Option<Vec<u8>> {
        fs::read(self.user_folder(uid).join(USER_DISPLAYS)).ok()
    }

    pub fn save_user_displays(&self, uid: u32, arrangement: &[u8]) -> io::Result<()> {
        write_atomically(
            &self.user_folder(uid).join(USER_DISPLAYS),
            arrangement,
            Readers::LoginScreen,
        )
    }

    pub fn show_displays(&self, arrangement: &[u8]) -> io::Result<()> {
        write_atomically(&self.root.join(DISPLAYS), arrangement, Readers::LoginScreen)
    }

    pub fn user_num_lock(&self, uid: u32) -> Option<bool> {
        match fs::read(self.user_folder(uid).join(USER_NUM_LOCK))
            .ok()?
            .as_slice()
        {
            b"on" => Some(true),
            b"off" => Some(false),
            _ => None,
        }
    }

    pub fn save_user_num_lock(&self, uid: u32, on: bool) -> io::Result<()> {
        let state: &[u8] = if on { b"on" } else { b"off" };
        write_atomically(
            &self.user_folder(uid).join(USER_NUM_LOCK),
            state,
            Readers::LoginScreen,
        )
    }

    pub fn save_user_sign_in_method(&self, uid: u32, method: SignInMethod) -> io::Result<()> {
        write_atomically(
            &self.user_folder(uid).join(USER_SIGN_IN_METHOD),
            method.name().as_bytes(),
            Readers::LoginScreen,
        )
    }

    pub fn user_style(&self, uid: u32) -> Option<StyleChoice> {
        serde_json::from_slice(&fs::read(self.user_folder(uid).join(USER_STYLE)).ok()?).ok()
    }

    pub fn save_user_style(&self, uid: u32, style: &StyleChoice) -> io::Result<()> {
        let contents = serde_json::to_vec(style).expect("the style serializes");
        write_atomically(
            &self.user_folder(uid).join(USER_STYLE),
            &contents,
            Readers::LoginScreen,
        )
    }

    fn user_folder(&self, uid: u32) -> PathBuf {
        self.root.join("users").join(uid.to_string())
    }

    fn config_path(&self) -> PathBuf {
        self.root.join("config.json")
    }

    fn shared_wallpaper_path(&self) -> PathBuf {
        self.root.join("shared").join(WALLPAPER)
    }
}

fn save_wallpaper(
    folder: &Path,
    [picture, details]: [&str; 2],
    jpeg: &[u8],
    focus: Focus,
    readers: Readers,
) -> io::Result<()> {
    write_atomically(&folder.join(details), &focus.details(), readers)?;
    write_atomically(&folder.join(picture), jpeg, readers)
}
