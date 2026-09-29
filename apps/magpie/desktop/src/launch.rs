use std::path::{Path, PathBuf};

use gio::prelude::*;

pub fn resolve(arguments: &[String], cwd: &Path) -> Vec<String> {
    let mut paths: Vec<String> = Vec::new();
    let files = arguments
        .iter()
        .filter(|argument| !argument.is_empty() && !argument.starts_with("--"))
        .filter_map(|argument| gio::File::for_commandline_arg_and_cwd(argument, cwd).path());
    for path in files {
        let path = path.to_string_lossy().into_owned();
        if !paths.contains(&path) {
            paths.push(path);
        }
    }
    paths
}

pub fn current_process() -> Vec<String> {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("/"));
    resolve(&arguments, &cwd)
}
