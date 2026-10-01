use std::path::{Path, PathBuf};

use super::program::{Program, file_name, is_interpreter, stem};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Entry {
    pub id: String,
    pub name: String,
    command: Option<Command>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct Command {
    path: String,
    target: Option<String>,
}

impl Entry {
    pub fn runs(&self, program: &Program) -> bool {
        let Some(command) = &self.command else {
            return false;
        };
        let launched = program.launched();
        if launched == command.path || command.target.as_deref() == Some(launched) {
            return true;
        }
        self.program_names().contains(&program.name())
    }

    pub fn names(&self) -> impl Iterator<Item = String> {
        std::iter::once(self.name.to_lowercase()).chain(id_names(&self.id))
    }

    fn program_names(&self) -> Vec<String> {
        let mut names = id_names(&self.id).to_vec();
        if let Some(command) = &self.command {
            names.extend(
                std::iter::once(&command.path)
                    .chain(&command.target)
                    .map(|path| stem(file_name(path)).to_lowercase()),
            );
        }
        names
    }
}

pub fn id_names(id: &str) -> [String; 2] {
    let id = id.to_lowercase();
    let last = id.rsplit('.').next().unwrap_or(&id).to_owned();
    [id, last]
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
        command: command(&exec),
    })
}

fn command(exec: &str) -> Option<Command> {
    let words = split(exec);
    let mut words = words
        .iter()
        .filter(|word| !word.starts_with('%'))
        .skip_while(|word| *word == "env" || (word.contains('=') && !word.starts_with('/')));
    let first = words.next()?;
    let program = if is_interpreter(first) {
        words.find(|word| !word.starts_with('-'))?
    } else {
        first
    };
    let path = resolve(program);
    let target = std::fs::canonicalize(&path)
        .ok()
        .map(|target| target.to_string_lossy().into_owned())
        .filter(|target| *target != path);
    Some(Command { path, target })
}

fn split(exec: &str) -> Vec<String> {
    let mut words = Vec::new();
    let mut word = String::new();
    let (mut quoted, mut escaped) = (false, false);
    for character in exec.chars() {
        match character {
            _ if escaped => {
                word.push(character);
                escaped = false;
            }
            '\\' if quoted => escaped = true,
            '"' => quoted = !quoted,
            ' ' | '\t' if !quoted => {
                if !word.is_empty() {
                    words.push(std::mem::take(&mut word));
                }
            }
            _ => word.push(character),
        }
    }
    if !word.is_empty() {
        words.push(word);
    }
    words
}

fn resolve(program: &str) -> String {
    if program.contains('/') {
        return program.to_owned();
    }
    let path = std::env::var("PATH").unwrap_or_else(|_| "/usr/local/bin:/usr/bin:/bin".into());
    path.split(':')
        .map(|directory| Path::new(directory).join(program))
        .find(|candidate| candidate.is_file())
        .map_or_else(
            || program.to_owned(),
            |found| found.to_string_lossy().into_owned(),
        )
}
