use std::path::Path;

pub fn name_of(path: &Path) -> String {
    path.file_name()
        .map_or_else(|| path.to_string_lossy(), |name| name.to_string_lossy())
        .into_owned()
}

pub fn first_name(paths: &[impl AsRef<Path>]) -> String {
    paths
        .first()
        .map(|path| name_of(path.as_ref()))
        .unwrap_or_default()
}
