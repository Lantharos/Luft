use std::fs;
use std::path::{Path, PathBuf};

pub const SYSTEM_XKB: &str = "/usr/share/X11/xkb";

fn config() -> PathBuf {
    dirs::config_dir().unwrap_or_else(|| PathBuf::from(".config"))
}

pub fn user_xkb() -> PathBuf {
    config().join("xkb")
}

pub fn user_symbols() -> PathBuf {
    user_xkb().join("symbols")
}

pub fn user_rules() -> PathBuf {
    user_xkb().join("rules/evdev.xml")
}

pub fn methods() -> PathBuf {
    config().join("keys/input-methods")
}

pub fn learned() -> PathBuf {
    dirs::state_dir()
        .unwrap_or_else(|| PathBuf::from(".local/state"))
        .join("keys/learned")
}

pub fn autostart() -> PathBuf {
    config().join("autostart/com.lantharos.keys.input-methods.desktop")
}

pub fn host_lock() -> PathBuf {
    dirs::runtime_dir()
        .unwrap_or_else(std::env::temp_dir)
        .join("com.lantharos.keys.input-methods.lock")
}

pub fn scratch() -> PathBuf {
    dirs::runtime_dir()
        .unwrap_or_else(std::env::temp_dir)
        .join(format!("keys-{}", std::process::id()))
}

pub fn write(path: &Path, contents: &str) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    let partial = path.with_extension("partial");
    fs::write(&partial, contents).map_err(|error| error.to_string())?;
    fs::rename(&partial, path).map_err(|error| error.to_string())
}

pub fn slug(name: &str) -> String {
    let mut slug = String::new();
    for character in name.chars().flat_map(char::to_lowercase) {
        if character.is_ascii_alphanumeric() {
            slug.push(character);
        } else if !slug.is_empty() && !slug.ends_with('-') {
            slug.push('-');
        }
    }
    let slug = slug.trim_end_matches('-');
    if slug.is_empty() {
        "custom".into()
    } else {
        slug.into()
    }
}

pub fn unique(base: &str, taken: impl Fn(&str) -> bool) -> String {
    let mut candidate = base.to_owned();
    let mut number = 1;
    while taken(&candidate) {
        number += 1;
        candidate = format!("{base}-{number}");
    }
    candidate
}
