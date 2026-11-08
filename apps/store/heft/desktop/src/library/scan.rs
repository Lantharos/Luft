use std::fs;
use std::path::Path;

use serde::Serialize;
use serde_json::Value;
use specta::Type;

use super::{failed, root};

pub const SUBJECT_FILE: &str = "subject.json";
pub const NOTEBOOK_FILE: &str = "notebook.json";
pub const NOTEBOOK_SUFFIX: &str = ".heft";

#[derive(Serialize, Type)]
pub struct Entry {
    pub folder: String,
    pub meta: Value,
}

#[derive(Serialize, Type)]
pub struct Subject {
    #[serde(flatten)]
    pub entry: Entry,
    pub notebooks: Vec<Entry>,
}

#[derive(Serialize, Type)]
pub struct Library {
    pub root: String,
    pub subjects: Vec<Subject>,
}

fn meta(path: &Path) -> Option<Value> {
    serde_json::from_slice(&fs::read(path).ok()?).ok()
}

fn folders(path: &Path) -> Vec<(String, std::path::PathBuf)> {
    let Ok(entries) = fs::read_dir(path) else {
        return Vec::new();
    };
    let mut found: Vec<_> = entries
        .flatten()
        .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_dir()))
        .filter_map(|entry| Some((entry.file_name().into_string().ok()?, entry.path())))
        .filter(|(name, _)| !name.starts_with('.'))
        .collect();
    found.sort();
    found
}

fn notebooks(subject: &Path) -> Vec<Entry> {
    folders(subject)
        .into_iter()
        .filter(|(name, _)| name.ends_with(NOTEBOOK_SUFFIX))
        .filter_map(|(folder, path)| {
            Some(Entry {
                meta: meta(&path.join(NOTEBOOK_FILE))?,
                folder,
            })
        })
        .collect()
}

pub fn library() -> Result<Library, String> {
    let root = root()?;
    fs::create_dir_all(&root).map_err(failed)?;
    let subjects = folders(&root)
        .into_iter()
        .filter_map(|(folder, path)| {
            Some(Subject {
                entry: Entry {
                    meta: meta(&path.join(SUBJECT_FILE))?,
                    folder,
                },
                notebooks: notebooks(&path),
            })
        })
        .collect();
    Ok(Library {
        root: root.to_string_lossy().into_owned(),
        subjects,
    })
}
