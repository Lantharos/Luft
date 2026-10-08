use std::path::Path;

pub fn items(count: usize) -> String {
    if count == 1 {
        "1 item".to_string()
    } else {
        format!("{count} items")
    }
}

pub fn quoted(path: &Path) -> String {
    format!(
        "\u{201c}{}\u{201d}",
        path.file_name()
            .map_or_else(|| path.to_string_lossy(), |name| name.to_string_lossy())
    )
}

pub fn subject(paths: &[impl AsRef<Path>]) -> String {
    match paths {
        [path] => quoted(path.as_ref()),
        _ => items(paths.len()),
    }
}
