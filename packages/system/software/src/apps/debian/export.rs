use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::Stdio;

use super::container;

const APPLICATIONS: &str = "/usr/share/applications/";
const HICOLOR: &str = "/usr/share/icons/hicolor/";
const PIXMAPS: &str = "/usr/share/pixmaps/";
pub const OWNER: &str = "X-Luft-Debian";
const PREFIX: &str = "ubuntu-";

fn applications() -> PathBuf {
    dirs::data_dir().unwrap_or_default().join("applications")
}

fn icons() -> PathBuf {
    dirs::data_dir().unwrap_or_default().join("icons")
}

fn owner(entry: &Path) -> Option<String> {
    std::fs::read_to_string(entry)
        .ok()?
        .lines()
        .find_map(|line| line.strip_prefix(&format!("{OWNER}=")).map(str::to_owned))
}

/// The menu entry, rewritten to start the app inside the container and to say which package it came from.
pub fn rewrite(text: &str, package: &str, icons: &[(String, PathBuf)]) -> String {
    let mut lines = Vec::new();
    for line in text.lines() {
        if line.starts_with("TryExec=") {
            continue;
        }
        if let Some(command) = line.strip_prefix("Exec=") {
            lines.push(format!(
                "Exec=toolbox run --container {} {command}",
                container::NAME
            ));
        } else if let Some(icon) = line
            .strip_prefix("Icon=")
            .filter(|icon| icon.starts_with('/'))
        {
            let copied = icons
                .iter()
                .find(|(original, _)| original == icon)
                .map(|(_, copy)| copy.to_string_lossy().into_owned());
            lines.push(format!("Icon={}", copied.as_deref().unwrap_or(icon)));
        } else {
            lines.push(line.to_owned());
        }
        if line.trim() == "[Desktop Entry]" {
            lines.push(format!("{OWNER}={package}"));
        }
    }
    lines.join("\n") + "\n"
}

/// Where an icon from the package goes in the home folder, beside the system's icons.
fn icon_destination(path: &str) -> Option<PathBuf> {
    if let Some(themed) = path
        .strip_prefix(HICOLOR)
        .filter(|rest| rest.contains("/apps/"))
    {
        return Some(icons().join("hicolor").join(themed));
    }
    // Icons without a size are looked up straight in the icons folder
    path.strip_prefix(PIXMAPS)
        .filter(|name| !name.contains('/'))
        .map(|name| icons().join(name))
}

pub struct Exported {
    pub desktop: Vec<String>,
    pub files: Vec<String>,
    pub icon: Option<String>,
}

/// Copies the package's menu entries and icons out of the container.
pub fn export(package: &str, previous: &[String]) -> Result<Exported, String> {
    let listed = container::query(&["dpkg-query", "--listfiles", "--", package])?;
    let wanted: Vec<&str> = listed
        .lines()
        .filter(|path| {
            (path.starts_with(APPLICATIONS) && path.ends_with(".desktop"))
                || icon_destination(path).is_some()
        })
        .collect();
    let mut exported = Exported {
        desktop: Vec::new(),
        files: Vec::new(),
        icon: None,
    };
    if wanted.is_empty() {
        return Ok(exported);
    }
    let mut program = vec![
        "tar",
        "--create",
        "--dereference",
        "--file",
        "-",
        "--absolute-names",
        "--",
    ];
    program.extend(wanted.iter().copied());
    let mut child = container::run(&program)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|_| "Toolbox isn't installed.".to_owned())?;
    let stdout = child.stdout.take().ok_or("Toolbox didn't start.")?;
    let mut entries = Vec::new();
    let mut copied: Vec<(String, PathBuf)> = Vec::new();
    for entry in tar::Archive::new(stdout)
        .entries()
        .map_err(|error| error.to_string())?
    {
        let mut entry = entry.map_err(|error| error.to_string())?;
        let path = format!(
            "/{}",
            entry
                .path()
                .map_err(|error| error.to_string())?
                .to_string_lossy()
                .trim_start_matches('/')
        );
        let mut bytes = Vec::new();
        entry
            .read_to_end(&mut bytes)
            .map_err(|error| error.to_string())?;
        if path.starts_with(APPLICATIONS) {
            entries.push((path, String::from_utf8_lossy(&bytes).into_owned()));
        } else if let Some(destination) = icon_destination(&path) {
            let ours = previous.contains(&destination.to_string_lossy().into_owned());
            if destination.exists() && !ours {
                continue;
            }
            if let Some(folder) = destination.parent() {
                std::fs::create_dir_all(folder).map_err(|error| error.to_string())?;
            }
            std::fs::write(&destination, bytes).map_err(|error| error.to_string())?;
            exported
                .files
                .push(destination.to_string_lossy().into_owned());
            copied.push((path, destination));
        }
    }
    let _ = child.wait();
    let folder = applications();
    std::fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    for (path, text) in entries {
        let name = Path::new(&path)
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_default();
        // An entry of the same name that isn't from this package, such as a Flatpak's, keeps its place
        let taken = |name: &str| {
            let existing = folder.join(name);
            existing.exists() && owner(&existing).as_deref() != Some(package)
        };
        let name = if taken(&name) {
            format!("{PREFIX}{name}")
        } else {
            name
        };
        if taken(&name) {
            continue;
        }
        let destination = folder.join(&name);
        std::fs::write(&destination, rewrite(&text, package, &copied))
            .map_err(|error| error.to_string())?;
        exported
            .files
            .push(destination.to_string_lossy().into_owned());
        exported.desktop.push(name);
        if exported.icon.is_none() {
            let entry = crate::apps::desktop::DesktopEntry::parse(&text);
            exported.icon = entry.get("Icon").and_then(|icon| main_icon(icon, &copied));
        }
    }
    // Files the last version had that this one doesn't
    for stale in previous
        .iter()
        .filter(|file| !exported.files.contains(file))
    {
        let _ = std::fs::remove_file(stale);
    }
    Ok(exported)
}

fn main_icon(name: &str, copied: &[(String, PathBuf)]) -> Option<String> {
    let found = |path: &PathBuf| path.to_string_lossy().into_owned();
    if name.starts_with('/') {
        return copied
            .iter()
            .find(|(original, _)| original == name)
            .map(|(_, copy)| found(copy));
    }
    [
        "256x256", "512x512", "128x128", "scalable", "96x96", "64x64", "48x48",
    ]
    .iter()
    .find_map(|size| {
        copied
            .iter()
            .find(|(original, _)| original.starts_with(&format!("{HICOLOR}{size}/apps/{name}.")))
    })
    .or_else(|| {
        copied
            .iter()
            .find(|(original, _)| original.starts_with(&format!("{PIXMAPS}{name}.")))
    })
    .map(|(_, copy)| found(copy))
}

pub fn unexport(files: &[String]) {
    for file in files {
        let _ = std::fs::remove_file(file);
    }
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use super::rewrite;

    #[test]
    fn starts_apps_in_the_container() {
        let entry = "[Desktop Entry]\nName=Chrome\nExec=/usr/bin/google-chrome-stable %U\nTryExec=google-chrome-stable\nIcon=/usr/share/pixmaps/chrome.png\n\n[Desktop Action new-window]\nExec=/usr/bin/google-chrome-stable --new-window\n";
        let icons = [(
            "/usr/share/pixmaps/chrome.png".to_owned(),
            PathBuf::from("/home/me/.local/share/icons/chrome.png"),
        )];
        let rewritten = rewrite(entry, "google-chrome-stable", &icons);
        assert_eq!(
            rewritten,
            "[Desktop Entry]\nX-Luft-Debian=google-chrome-stable\nName=Chrome\nExec=toolbox run --container luft-ubuntu /usr/bin/google-chrome-stable %U\nIcon=/home/me/.local/share/icons/chrome.png\n\n[Desktop Action new-window]\nExec=toolbox run --container luft-ubuntu /usr/bin/google-chrome-stable --new-window\n"
        );
    }
}
