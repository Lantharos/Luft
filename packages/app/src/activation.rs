use std::env;
use std::path::{Component, Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::portal;

const ROOT: &str = "/";

/// The command line an app was started with, either this process's own or the
/// one a second launch forwarded as the page's `singleInstance.activate` event.
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Activation {
    arguments: Vec<String>,
    working_directory: Option<PathBuf>,
}

impl Activation {
    pub fn current_process() -> Self {
        Self {
            arguments: env::args().collect(),
            working_directory: env::current_dir().ok(),
        }
    }

    /// The arguments after the program's own name.
    pub fn arguments(&self) -> &[String] {
        self.arguments.get(1..).unwrap_or_default()
    }

    pub fn working_directory(&self) -> &Path {
        self.working_directory.as_deref().unwrap_or(Path::new(ROOT))
    }

    /// The arguments that name local files, as absolute paths: `file://`
    /// URIs and paths relative to the working directory. Options and other
    /// URIs are skipped.
    pub fn paths(&self) -> impl Iterator<Item = PathBuf> {
        self.arguments()
            .iter()
            .filter_map(|argument| self.path(argument))
    }

    pub fn path(&self, argument: &str) -> Option<PathBuf> {
        if argument.is_empty() || argument.starts_with('-') {
            return None;
        }
        if argument.contains("://") {
            return portal::uri_path(argument);
        }
        Some(normalize(&self.working_directory().join(argument)))
    }
}

fn normalize(path: &Path) -> PathBuf {
    let mut normal = PathBuf::new();
    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                normal.pop();
            }
            component => normal.push(component),
        }
    }
    normal
}
