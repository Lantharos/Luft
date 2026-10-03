use std::path::{Path, PathBuf};

use url::Url;

pub fn resolve(args: &[String], cwd: &Path) -> Vec<String> {
    let mut paths: Vec<String> = Vec::new();
    for path in args.iter().filter_map(|arg| path_arg(arg, cwd)) {
        if !paths.contains(&path) {
            paths.push(path);
        }
    }
    paths
}

pub fn current_process() -> Vec<String> {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("/"));
    resolve(&args, &cwd)
}

fn path_arg(arg: &str, cwd: &Path) -> Option<String> {
    if arg.is_empty() || arg.starts_with("--") {
        return None;
    }
    let path = match Url::parse(arg) {
        Ok(url) if url.scheme() == "file" => url.to_file_path().ok()?,
        Ok(url) if url.has_host() => return Some(arg.to_owned()),
        _ => cwd.join(arg),
    };
    let path = path.canonicalize().unwrap_or(path);
    Some(path.to_string_lossy().into_owned())
}
