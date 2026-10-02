use std::path::{Path, PathBuf};

use gio::prelude::*;
use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Launch {
    Mailto { url: String },
    Message { path: String },
}

pub fn resolve(arguments: &[String], cwd: &Path) -> Vec<Launch> {
    arguments
        .iter()
        .filter(|argument| !argument.is_empty() && !argument.starts_with("--"))
        .filter_map(|argument| {
            if argument.to_ascii_lowercase().starts_with("mailto:") {
                return Some(Launch::Mailto {
                    url: argument.clone(),
                });
            }
            let path = gio::File::for_commandline_arg_and_cwd(argument, cwd).path()?;
            path.is_file().then(|| Launch::Message {
                path: path.to_string_lossy().into_owned(),
            })
        })
        .collect()
}

pub fn current_process() -> Vec<Launch> {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("/"));
    resolve(&arguments, &cwd)
}
