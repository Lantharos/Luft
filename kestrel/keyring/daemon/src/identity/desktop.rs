use std::path::PathBuf;

pub struct Entry {
    pub id: String,
    pub name: String,
    exec: String,
}

impl Entry {
    pub fn runs(&self, binary: &str) -> bool {
        let command = self
            .exec
            .split_whitespace()
            .find(|word| !word.contains('=') && *word != "env")
            .unwrap_or_default();
        command.rsplit('/').next() == Some(binary)
    }
}

pub fn find(id: &str) -> Option<Entry> {
    let file = format!("applications/{id}.desktop");
    data_directories()
        .into_iter()
        .find_map(|directory| parse(id, &std::fs::read_to_string(directory.join(&file)).ok()?))
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

fn parse(id: &str, contents: &str) -> Option<Entry> {
    let mut in_entry = false;
    let (mut name, mut exec) = (None, String::new());
    for line in contents.lines() {
        if line.starts_with('[') {
            in_entry = line == "[Desktop Entry]";
        } else if in_entry && let Some((key, value)) = line.split_once('=') {
            match key.trim() {
                "Name" => name = Some(value.trim().to_owned()),
                "Exec" => exec = value.trim().to_owned(),
                _ => {}
            }
        }
    }
    Some(Entry {
        id: id.to_owned(),
        name: name?,
        exec,
    })
}
