use std::path::PathBuf;
use std::process::Command;

use luft_meet::regional::Keyboard;

const SYSTEM: [&str; 3] = [
    "/etc/vconsole.conf",
    "/etc/default/keyboard",
    "/etc/X11/xorg.conf.d/00-keyboard.conf",
];

fn pairs(layouts: &str, variants: &str) -> Vec<Keyboard> {
    let mut variants = variants.split(',');
    layouts
        .split(',')
        .map(|layout| Keyboard {
            layout: layout.trim().to_owned(),
            variant: variants.next().unwrap_or_default().trim().to_owned(),
        })
        .filter(|keyboard| !keyboard.layout.is_empty())
        .collect()
}

pub(super) fn from_gnome(sources: &str) -> Vec<Keyboard> {
    sources
        .split("('xkb', '")
        .skip(1)
        .filter_map(|source| {
            let id = source.split('\'').next()?;
            let (layout, variant) = id.split_once('+').unwrap_or((id, ""));
            Some(Keyboard {
                layout: layout.to_owned(),
                variant: variant.to_owned(),
            })
        })
        .collect()
}

fn setting<'a>(text: &'a str, name: &str) -> Option<&'a str> {
    text.lines().find_map(|line| {
        let line = line.trim();
        let value = line
            .strip_prefix(name)
            .and_then(|rest| rest.trim_start().strip_prefix('='))
            .or_else(|| {
                line.strip_prefix("Option")?
                    .trim_start()
                    .strip_prefix(&format!("\"{name}\""))
            })?;
        Some(value.trim().trim_matches('"'))
    })
}

pub(super) fn from_settings(text: &str, layouts: &str, variants: &str) -> Vec<Keyboard> {
    setting(text, layouts).map_or_else(Vec::new, |found| {
        pairs(found, setting(text, variants).unwrap_or_default())
    })
}

fn gnome() -> Vec<Keyboard> {
    Command::new("gsettings")
        .args(["get", "org.gnome.desktop.input-sources", "sources"])
        .output()
        .ok()
        .filter(|output| output.status.success())
        .map(|output| from_gnome(&String::from_utf8_lossy(&output.stdout)))
        .unwrap_or_default()
}

fn plasma() -> Vec<Keyboard> {
    let config = std::env::var_os("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|home| PathBuf::from(home).join(".config")));
    config
        .and_then(|config| std::fs::read_to_string(config.join("kxkbrc")).ok())
        .map(|text| from_settings(&text, "LayoutList", "VariantList"))
        .unwrap_or_default()
}

fn system() -> Vec<Keyboard> {
    SYSTEM
        .iter()
        .filter_map(|path| std::fs::read_to_string(path).ok())
        .map(|text| {
            let found = from_settings(&text, "XKBLAYOUT", "XKBVARIANT");
            if found.is_empty() {
                from_settings(&text, "XkbLayout", "XkbVariant")
            } else {
                found
            }
        })
        .find(|found| !found.is_empty())
        .unwrap_or_default()
}

pub(super) fn active() -> Vec<Keyboard> {
    [gnome, plasma, system]
        .into_iter()
        .map(|source| source())
        .find(|found| !found.is_empty())
        .unwrap_or_default()
}
