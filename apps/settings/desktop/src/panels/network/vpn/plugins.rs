use std::fs;
use std::path::Path;

const FOLDERS: [&str; 2] = ["/etc/NetworkManager/VPN", "/usr/lib/NetworkManager/VPN"];
const EXTENSIONS: [(&str, &str); 4] = [
    ("ovpn", "openvpn"),
    ("conf", "openvpn"),
    ("pcf", "vpnc"),
    ("conf", "libreswan"),
];

fn name(description: &str) -> Option<String> {
    let mut section = "";
    for line in description.lines().map(str::trim) {
        if let Some(header) = line
            .strip_prefix('[')
            .and_then(|line| line.strip_suffix(']'))
        {
            section = header;
        } else if section == "VPN Connection"
            && let Some((key, value)) = line.split_once('=')
            && key.trim() == "name"
        {
            return Some(value.trim().to_owned());
        }
    }
    None
}

fn installed() -> Vec<String> {
    let mut names: Vec<String> = FOLDERS
        .iter()
        .filter_map(|folder| fs::read_dir(folder).ok())
        .flatten()
        .flatten()
        .filter(|entry| {
            entry
                .path()
                .extension()
                .is_some_and(|extension| extension == "name")
        })
        .filter_map(|entry| name(&fs::read_to_string(entry.path()).ok()?))
        .collect();
    names.sort();
    names.dedup();
    names
}

pub fn likely_for(file: &Path) -> Vec<String> {
    let extension = file
        .extension()
        .map(|extension| extension.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    let mut plugins = installed();
    plugins.sort_by_key(|plugin| {
        !EXTENSIONS
            .iter()
            .any(|(known, owner)| *known == extension && owner == plugin)
    });
    plugins
}
