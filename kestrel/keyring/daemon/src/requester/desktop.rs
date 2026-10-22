use std::path::PathBuf;

pub fn name(id: &str) -> Option<String> {
    let file = format!("applications/{id}.desktop");
    data_directories()
        .into_iter()
        .find_map(|folder| entry_name(&std::fs::read_to_string(folder.join(&file)).ok()?))
}

fn data_directories() -> Vec<PathBuf> {
    let home = std::env::var_os("XDG_DATA_HOME")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|home| PathBuf::from(home).join(".local/share")));
    let system =
        std::env::var("XDG_DATA_DIRS").unwrap_or_else(|_| "/usr/local/share:/usr/share".into());
    home.into_iter()
        .chain(std::iter::once(PathBuf::from(
            "/var/lib/flatpak/exports/share",
        )))
        .chain(
            system
                .split(':')
                .filter(|path| !path.is_empty())
                .map(PathBuf::from),
        )
        .collect()
}

fn entry_name(contents: &str) -> Option<String> {
    let mut in_entry = false;
    for line in contents.lines() {
        if line.starts_with('[') {
            in_entry = line == "[Desktop Entry]";
        } else if in_entry
            && let Some((key, value)) = line.split_once('=')
            && key.trim() == "Name"
        {
            return Some(value.trim().to_owned());
        }
    }
    None
}
