//! The `filesystems` of a Flatpak app's own overrides, the file `flatpak
//! override --user` writes, changed without touching anything else in it.

use std::path::PathBuf;

const CONTEXT: &str = "[Context]";
const FILESYSTEMS: &str = "filesystems=";

fn folder() -> Option<PathBuf> {
    std::env::var_os("FLATPAK_USER_DIR")
        .map(PathBuf::from)
        .or_else(|| dirs::data_dir().map(|data| data.join("flatpak")))
        .map(|flatpak| flatpak.join("overrides"))
}

fn split(value: &str) -> Vec<String> {
    let mut entries = Vec::new();
    let mut entry = String::new();
    let mut characters = value.chars();
    while let Some(character) = characters.next() {
        match character {
            '\\' => match characters.next() {
                Some('s') => entry.push(' '),
                Some(escaped) => entry.push(escaped),
                None => {}
            },
            ';' => entries.push(std::mem::take(&mut entry)),
            other => entry.push(other),
        }
    }
    if !entry.is_empty() {
        entries.push(entry);
    }
    entries
}

fn join(entries: &[String]) -> String {
    entries
        .iter()
        .map(|entry| {
            let escaped = entry.replace('\\', "\\\\").replace(';', "\\;");
            match escaped.strip_prefix(' ') {
                Some(rest) => format!("\\s{rest};"),
                None => format!("{escaped};"),
            }
        })
        .collect()
}

fn is_group(line: &str) -> bool {
    line.trim_start().starts_with('[')
}

/// The overrides `text` holds with its filesystems changed by `change`.
fn rewrite(text: &str, change: impl FnOnce(&mut Vec<String>)) -> String {
    let mut lines: Vec<String> = text.lines().map(str::to_owned).collect();
    let context = lines.iter().position(|line| line.trim() == CONTEXT);
    let found = context.and_then(|start| {
        lines[start + 1..]
            .iter()
            .take_while(|line| !is_group(line))
            .position(|line| line.starts_with(FILESYSTEMS))
            .map(|offset| start + 1 + offset)
    });
    let mut entries = found
        .map(|at| split(&lines[at][FILESYSTEMS.len()..]))
        .unwrap_or_default();
    change(&mut entries);
    let line = (!entries.is_empty()).then(|| format!("{FILESYSTEMS}{}", join(&entries)));
    match (found, context, line) {
        (Some(at), _, Some(line)) => lines[at] = line,
        (Some(at), _, None) => {
            lines.remove(at);
        }
        (None, Some(start), Some(line)) => lines.insert(start + 1, line),
        (None, None, Some(line)) => {
            if lines.last().is_some_and(|last| !last.is_empty()) {
                lines.push(String::new());
            }
            lines.push(CONTEXT.to_owned());
            lines.push(line);
        }
        (None, _, None) => {}
    }
    let mut written = lines.join("\n");
    written.push('\n');
    written
}

/// Takes `before` out of the filesystems the app's overrides open and puts
/// `after` in, keeping every other entry, such as those Flatseal wrote.
pub fn replace(id: &str, before: &[String], after: &[String]) -> Result<(), String> {
    let folder = folder().ok_or("There's no home folder.")?;
    let file = folder.join(id);
    let text = match std::fs::read_to_string(&file) {
        Ok(text) => text,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => String::new(),
        Err(error) => return Err(error.to_string()),
    };
    let written = rewrite(&text, |entries| {
        entries.retain(|entry| !before.contains(entry));
        for entry in after {
            if !entries.contains(entry) {
                entries.push(entry.clone());
            }
        }
    });
    if written == text {
        return Ok(());
    }
    std::fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    std::fs::write(file, written).map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::{join, rewrite, split};

    fn owned(entries: &[&str]) -> Vec<String> {
        entries.iter().map(|entry| (*entry).to_owned()).collect()
    }

    #[test]
    fn other_settings_and_entries_stay() {
        let text = "[Context]\nshared=network;\nfilesystems=xdg-music:ro;!home;\n\n[Session Bus Policy]\norg.example.Name=talk\n";
        let written = rewrite(text, |entries| {
            entries.retain(|entry| entry != "!home");
            entries.push("/run/media/ada/Games".to_owned());
        });
        assert_eq!(
            written,
            "[Context]\nshared=network;\nfilesystems=xdg-music:ro;/run/media/ada/Games;\n\n[Session Bus Policy]\norg.example.Name=talk\n"
        );
    }

    #[test]
    fn a_file_without_filesystems_gets_them_and_loses_them_again() {
        let text = "[Session Bus Policy]\norg.example.Name=talk\n";
        let written = rewrite(text, |entries| {
            entries.push("/var/mnt/backup:ro".to_owned())
        });
        assert_eq!(
            written,
            "[Session Bus Policy]\norg.example.Name=talk\n\n[Context]\nfilesystems=/var/mnt/backup:ro;\n"
        );
        assert_eq!(
            rewrite(&written, Vec::clear),
            "[Session Bus Policy]\norg.example.Name=talk\n\n[Context]\n"
        );
    }

    #[test]
    fn paths_with_separators_survive() {
        let entries = owned(&["/run/media/ada/A;B", " /lead", "/back\\slash"]);
        assert_eq!(split(&join(&entries)), entries);
    }
}
