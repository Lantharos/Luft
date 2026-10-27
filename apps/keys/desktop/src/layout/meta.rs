use std::fs;
use std::path::PathBuf;

use luft_app::files;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::dead::DeadKey;
use crate::paths;

#[derive(Serialize, Deserialize, Clone, Copy, Default, PartialEq, Eq, Debug, Type)]
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

#[derive(Serialize, Deserialize, Clone, Copy, Default, PartialEq, Eq, Debug, Type)]
#[serde(rename_all = "lowercase")]
pub enum ComposeKey {
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

#[derive(Serialize, Deserialize, Clone, Copy, Default, PartialEq, Eq, Debug, Type)]
#[serde(rename_all = "lowercase")]
pub enum CapsLock {
    #[default]
    Capslock,
    Shiftlock,
    Escape,
    Swapescape,
    Backspace,
    Ctrl,
    None,
}

#[derive(Serialize, Deserialize, Clone, Copy, Default, PartialEq, Eq, Debug, Type)]
pub struct Options {
    #[serde(default)]
    pub altgr: AltGr,
    #[serde(default)]
    pub compose: ComposeKey,
    #[serde(default)]
    pub caps: CapsLock,
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
            ComposeKey::None => None,
            ComposeKey::Ralt => Some("compose(ralt)"),
            ComposeKey::Rctrl => Some("compose(rctrl)"),
            ComposeKey::Menu => Some("compose(menu)"),
            ComposeKey::Rwin => Some("compose(rwin)"),
            ComposeKey::Caps => Some("compose(caps)"),
            ComposeKey::Sclk => Some("compose(sclk)"),
            ComposeKey::Prsc => Some("compose(prsc)"),
        });
        let caps_taken =
            self.compose == ComposeKey::Caps || (third_level && self.altgr == AltGr::Caps);
        if !caps_taken {
            includes.extend(match self.caps {
                CapsLock::Capslock => None,
                CapsLock::Shiftlock => Some("capslock(shiftlock)"),
                CapsLock::Escape => Some("capslock(escape)"),
                CapsLock::Swapescape => Some("capslock(swapescape)"),
                CapsLock::Backspace => Some("capslock(backspace)"),
                CapsLock::Ctrl => Some("ctrl(nocaps)"),
                CapsLock::None => Some("capslock(none)"),
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
    files::replace(&file(id), text.as_bytes()).map_err(|error| error.to_string())
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
