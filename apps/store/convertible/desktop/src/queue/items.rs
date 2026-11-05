use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::engine::formats;
use crate::engine::job::{Conflict, Edits, Job, Options};

#[derive(Clone, Debug, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct NewItem {
    pub inputs: Vec<String>,
    pub format: String,
    pub folder: Option<String>,
    pub subfolder: Option<String>,
    pub name: Option<String>,
    pub conflict: Conflict,
    pub keep_times: bool,
    pub options: Options,
    pub edits: Edits,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum ItemState {
    Waiting,
    Running,
    Paused,
    Finished,
    Failed,
    Canceled,
}

impl ItemState {
    pub fn is_over(self) -> bool {
        matches!(self, Self::Finished | Self::Failed | Self::Canceled)
    }
}

#[derive(Clone, Debug, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ItemUpdate {
    pub id: u32,
    pub name: String,
    pub target: String,
    pub state: ItemState,
    pub fraction: f32,
    pub remaining: Option<f64>,
    pub output: Option<String>,
    pub error: Option<String>,
}

fn base_name(item: &NewItem, first: &Path) -> String {
    if let Some(name) = &item.name {
        return name.clone();
    }
    let source = formats::detect(first);
    let stem = if first.is_dir() {
        first
            .file_name()
            .map_or_else(String::new, |name| name.to_string_lossy().into_owned())
    } else {
        formats::file_stem(first, source)
    };
    let extension = formats::extension_for(&item.format);
    if extension.is_empty() {
        stem
    } else {
        format!("{stem}.{extension}")
    }
}

pub fn destination(item: &NewItem) -> PathBuf {
    let first = PathBuf::from(&item.inputs[0]);
    let beside = first.parent().map_or_else(PathBuf::new, Path::to_path_buf);
    let mut folder = item.folder.as_ref().map_or(beside, PathBuf::from);
    if let Some(subfolder) = &item.subfolder {
        folder.push(subfolder);
    }
    folder.join(base_name(item, &first))
}

pub fn build_job(item: NewItem, id: u32) -> Job {
    let destination = destination(&item);
    let name = destination
        .file_name()
        .map_or_else(String::new, |name| name.to_string_lossy().into_owned());
    Job {
        inputs: item.inputs.into_iter().map(PathBuf::from).collect(),
        format: item.format,
        temp: destination
            .with_file_name(format!(".convertible-{}-{id}.{name}", std::process::id())),
        destination,
        conflict: item.conflict,
        keep_times: item.keep_times,
        options: item.options,
        edits: item.edits,
    }
}

pub fn conflicts(items: &[NewItem]) -> Vec<String> {
    items
        .iter()
        .filter(|item| item.conflict == Conflict::KeepBoth)
        .map(destination)
        .filter(|path| path.symlink_metadata().is_ok())
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}
