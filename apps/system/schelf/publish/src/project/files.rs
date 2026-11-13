use std::io::ErrorKind;
use std::path::Path;

use crate::error::Result;

const SKIPPED: [&str; 9] = [
    "node_modules",
    "target",
    "dist",
    "build",
    ".git",
    "vendor",
    ".svelte-kit",
    ".next",
    "out",
];
const MAX_DEPTH: usize = 4;

/// The files under `root`, four folders deep, whose names `matches` takes,
/// shallowest first, as paths from `root`.
pub fn find_files(root: &Path, matches: impl Fn(&str) -> bool) -> Vec<String> {
    fn walk(
        root: &Path,
        folder: &Path,
        depth: usize,
        matches: &dyn Fn(&str) -> bool,
        found: &mut Vec<String>,
    ) {
        let Ok(entries) = std::fs::read_dir(folder) else {
            return;
        };
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().into_owned();
            let path = entry.path();
            if entry.file_type().is_ok_and(|kind| kind.is_dir()) {
                if depth < MAX_DEPTH && !SKIPPED.contains(&name.as_str()) && !name.starts_with('.')
                {
                    walk(root, &path, depth + 1, matches, found);
                }
            } else if matches(&name) {
                let relative = path.strip_prefix(root).unwrap_or(&path);
                found.push(relative.to_string_lossy().replace('\\', "/"));
            }
        }
    }
    let mut found = Vec::new();
    walk(root, root, 0, &matches, &mut found);
    found.sort_by(|left, right| {
        left.split('/')
            .count()
            .cmp(&right.split('/').count())
            .then_with(|| crate::schema::versions::locale_compare(left, right))
    });
    found
}

/// The file's text, or none when there's no such file.
pub fn read_optional(path: &Path) -> Result<Option<String>> {
    match std::fs::read_to_string(path) {
        Ok(text) => Ok(Some(text)),
        Err(error) if error.kind() == ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error.into()),
    }
}

/// The file's text, or none when it can't be read for any reason.
pub fn read_quietly(path: &Path) -> Option<String> {
    std::fs::read_to_string(path).ok()
}
