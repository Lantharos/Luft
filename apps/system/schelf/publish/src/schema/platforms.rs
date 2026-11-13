use std::sync::LazyLock;

use regex::Regex;

pub const APP_PLATFORMS: [&str; 5] = [
    "linux-x86_64",
    "linux-aarch64",
    "windows-x86_64",
    "windows-aarch64",
    "macos-aarch64",
];
pub const FILE_PLATFORMS: [&str; 9] = [
    "linux-x86_64",
    "linux-aarch64",
    "windows-x86_64",
    "windows-aarch64",
    "macos-aarch64",
    "macos-x86_64",
    "macos-universal",
    "android",
    "any",
];
pub const EXTENSION_PLATFORMS: [&str; 3] = ["luft", "luft-x86_64", "luft-aarch64"];
pub const PLATFORMS: [&str; 12] = [
    "linux-x86_64",
    "linux-aarch64",
    "windows-x86_64",
    "windows-aarch64",
    "macos-aarch64",
    "macos-x86_64",
    "macos-universal",
    "android",
    "any",
    "luft",
    "luft-x86_64",
    "luft-aarch64",
];

pub const KINDS: [&str; 2] = ["app", "extension"];
pub const FORMATS: [&str; 4] = ["sabine", "appimage", "luft-extension", "files"];
pub const DISTRIBUTIONS: [&str; 2] = ["open", "proprietary"];
pub const FILE_UPDATERS: [&str; 2] = ["electron", "tauri"];

pub fn platforms_for(format: &str) -> &'static [&'static str] {
    match format {
        "luft-extension" => &EXTENSION_PLATFORMS,
        "files" => &FILE_PLATFORMS,
        _ => &APP_PLATFORMS,
    }
}

pub fn format_fits(kind: &str, format: &str) -> bool {
    if kind == "extension" {
        format == "luft-extension"
    } else {
        format != "luft-extension"
    }
}

pub static APP_ID: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[A-Za-z][A-Za-z0-9_-]*(\.[A-Za-z0-9_-]+){2,}$").unwrap());
pub const APP_ID_MESSAGE: &str = "An app id is reverse DNS, like io.github.alice.Notes";

pub fn valid_app_id(id: &str) -> bool {
    id.encode_utf16().count() <= 255 && APP_ID.is_match(id)
}

pub fn same_app_id(left: &str, right: &str) -> bool {
    left.to_lowercase() == right.to_lowercase()
}

pub fn namespace_covers(prefix: &str, id: &str) -> bool {
    id.to_lowercase()
        .starts_with(&format!("{}.", prefix.to_lowercase()))
}

pub fn updater_name(updater: &str) -> &'static str {
    match updater {
        "sabine" => "Sabine",
        "electron" => "electron-updater",
        _ => "Tauri's updater",
    }
}

pub fn slug_from_id(id: &str) -> String {
    let last = id[id.rfind('.').map_or(0, |dot| dot + 1)..].to_lowercase();
    let mut slug = String::new();
    for character in last.chars() {
        if character.is_ascii_lowercase() || character.is_ascii_digit() {
            slug.push(character);
        } else if !slug.ends_with('-') {
            slug.push('-');
        }
    }
    let slug = slug.trim_matches('-');
    if slug.is_empty() {
        "app".to_owned()
    } else {
        slug.to_owned()
    }
}

pub fn project_id(publisher: &str, slug: &str) -> String {
    format!("{publisher}.{slug}")
}
