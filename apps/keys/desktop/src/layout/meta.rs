use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use super::dead::DeadKey;
use crate::paths;

#[derive(Serialize, Deserialize, Clone, Copy, Default, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum AltGr {
    #[default]
    Ralt,
    Lalt,
    Alt,
    Rctrl,
    Menu,
    Rwin,
    Caps,
}

#[derive(Serialize, Deserialize, Clone, Copy, Default, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Compose {
    #[default]
    None,
    Ralt,
    Rctrl,
    Menu,
    Rwin,
    Caps,
    Sclk,
    Prsc,
}

#[derive(Serialize, Deserialize, Clone, Copy, Default, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Caps {
    #[default]
    Capslock,
    Shiftlock,
    Escape,
    Swapescape,
    Backspace,
    Ctrl,
    None,
}

#[derive(Serialize, Deserialize, Clone, Copy, Default, PartialEq, Eq, Debug)]
pub struct Options {
    #[serde(default)]
    pub altgr: AltGr,
    #[serde(default)]
    pub compose: Compose,
    #[serde(default)]
    pub caps: Caps,
}

#[derive(Serialize, Deserialize, Default)]
pub struct Meta {
    pub base: Option<String>,
    #[serde(default)]
    pub options: Options,
    #[serde(default)]
    pub dead: Vec<DeadKey>,
}

impl Options {
    pub fn includes(&self, third_level: bool) -> Vec<&'static str> {
        let mut includes = Vec::new();
        if third_level {
            includes.extend(match self.altgr {
                AltGr::Ralt => &["level3(ralt_switch)"][..],
                AltGr::Lalt => &["level3(ralt_alt)", "level3(lalt_switch)"],
                AltGr::Alt => &["level3(alt_switch)"],
                AltGr::Rctrl => &["level3(ralt_alt)", "level3(switch)"],
                AltGr::Menu => &["level3(ralt_alt)", "level3(menu_switch)"],
                AltGr::Rwin => &["level3(ralt_alt)", "level3(rwin_switch)"],
                AltGr::Caps => &["level3(ralt_alt)", "level3(caps_switch)"],
            });
        }
        includes.extend(match self.compose {
            Compose::None => None,
            Compose::Ralt => Some("compose(ralt)"),
            Compose::Rctrl => Some("compose(rctrl)"),
            Compose::Menu => Some("compose(menu)"),
            Compose::Rwin => Some("compose(rwin)"),
            Compose::Caps => Some("compose(caps)"),
            Compose::Sclk => Some("compose(sclk)"),
            Compose::Prsc => Some("compose(prsc)"),
        });
        let caps_taken =
            self.compose == Compose::Caps || (third_level && self.altgr == AltGr::Caps);
        if !caps_taken {
            includes.extend(match self.caps {
                Caps::Capslock => None,
                Caps::Shiftlock => Some("capslock(shiftlock)"),
                Caps::Escape => Some("capslock(escape)"),
                Caps::Swapescape => Some("capslock(swapescape)"),
                Caps::Backspace => Some("capslock(backspace)"),
                Caps::Ctrl => Some("ctrl(nocaps)"),
                Caps::None => Some("capslock(none)"),
            });
        }
        includes
    }
}

fn folder() -> PathBuf {
    paths::keys().join("layouts")
}

fn file(id: &str) -> PathBuf {
    folder().join(format!("{id}.toml"))
}

pub fn load(id: &str) -> Option<Meta> {
    toml::from_str(&fs::read_to_string(file(id)).ok()?).ok()
}

pub fn save(id: &str, meta: &Meta) -> Result<(), String> {
    let text = toml::to_string(meta).map_err(|error| error.to_string())?;
    paths::write(&file(id), &text)
}

pub fn remove(id: &str) {
    let _ = fs::remove_file(file(id));
}

pub fn taken_keysyms(except: &str) -> Vec<String> {
    let Ok(entries) = fs::read_dir(folder()) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            let id = path.file_stem()?.to_str()?;
            (id != except).then(|| load(id))?
        })
        .flat_map(|meta| meta.dead.into_iter().map(|dead| dead.keysym))
        .collect()
}
