mod desktop;
mod executables;

use std::collections::HashSet;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

use desktop::DesktopEntry;

const DEFAULT_DATA_DIRS: &str = "/usr/local/share:/usr/share";
const SESSIONS_DIRECTORY: &str = "wayland-sessions";
const PREFERRED: &str = "kestrel";

#[derive(Debug, PartialEq)]
pub struct Session {
    pub id: String,
    pub name: String,
    exec: String,
    desktop_names: String,
}

impl Session {
    fn parse(id: &str, text: &str) -> Option<Self> {
        let entry = DesktopEntry::parse(text);
        if entry.is_true("Hidden") || entry.is_true("NoDisplay") {
            return None;
        }
        if entry
            .get("TryExec")
            .is_some_and(|program| !executables::exists(program))
        {
            return None;
        }
        let exec = executables::without_field_codes(entry.get("Exec")?);
        let desktop_names = entry
            .get("DesktopNames")
            .unwrap_or_default()
            .split(';')
            .filter(|name| !name.is_empty())
            .collect::<Vec<_>>()
            .join(":");
        Some(Self {
            id: id.to_owned(),
            name: entry.get("Name").unwrap_or(id).to_owned(),
            desktop_names: if desktop_names.is_empty() {
                id.to_owned()
            } else {
                desktop_names
            },
            exec,
        })
    }

    pub fn command(&self) -> String {
        format!(
            "env XDG_SESSION_TYPE=wayland XDG_SESSION_DESKTOP={} XDG_CURRENT_DESKTOP={} {}",
            self.id, self.desktop_names, self.exec
        )
    }
}

pub fn discover() -> Vec<Session> {
    let mut seen = HashSet::new();
    let mut sessions = Vec::new();
    for data_dir in data_dirs() {
        for (id, path) in desktop_files(&data_dir.join(SESSIONS_DIRECTORY)) {
            if seen.insert(id.clone()) {
                let text = fs::read_to_string(&path).unwrap_or_default();
                sessions.extend(Session::parse(&id, &text));
            }
        }
    }
    sessions
}

pub fn preferred<'a>(sessions: &'a [Session], default: &str) -> Option<&'a Session> {
    [default, PREFERRED]
        .iter()
        .find_map(|id| sessions.iter().find(|session| session.id == *id))
        .or_else(|| sessions.first())
}

fn data_dirs() -> Vec<PathBuf> {
    let value = env::var_os("XDG_DATA_DIRS")
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| DEFAULT_DATA_DIRS.into());
    env::split_paths(&value)
        .filter(|path| !path.as_os_str().is_empty())
        .collect()
}

fn desktop_files(directory: &Path) -> Vec<(String, PathBuf)> {
    let Ok(entries) = fs::read_dir(directory) else {
        return Vec::new();
    };
    let mut files: Vec<_> = entries
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            let id = path
                .file_name()?
                .to_str()?
                .strip_suffix(".desktop")?
                .to_owned();
            Some((id, path))
        })
        .collect();
    files.sort();
    files
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_desktop_entry_group() {
        let text = "\
# A session
[Desktop Entry]
Name[de]=Kestrel Sitzung
Name = Kestrel
Exec=/usr/bin/kestrel-session --wayland %U 100%%
DesktopNames=Kestrel;GNOME;
Type=Application

[Desktop Action Safe]
Name=Safe mode
Exec=/usr/bin/kestrel-session --safe
";
        let session = Session::parse("kestrel", text).unwrap();
        assert_eq!(session.name, "Kestrel");
        assert_eq!(
            session.command(),
            "env XDG_SESSION_TYPE=wayland XDG_SESSION_DESKTOP=kestrel \
             XDG_CURRENT_DESKTOP=Kestrel:GNOME /usr/bin/kestrel-session --wayland 100%"
        );
    }

    #[test]
    fn skips_entries_that_should_not_be_offered() {
        let hidden = "[Desktop Entry]\nName=Old\nExec=old\nHidden=true\n";
        let missing = "[Desktop Entry]\nName=Gone\nExec=gone\nTryExec=/nonexistent/gone\n";
        assert_eq!(Session::parse("old", hidden), None);
        assert_eq!(Session::parse("gone", missing), None);
    }
}
