use std::fs;

pub fn list_folders(path: String) -> Result<Vec<String>, String> {
    Ok(fs::read_dir(&path)
        .map_err(|error| error.to_string())?
        .flatten()
        .filter(|entry| {
            entry
                .file_type()
                .is_ok_and(|kind| kind.is_dir() || (kind.is_symlink() && entry.path().is_dir()))
        })
        .map(|entry| entry.file_name().to_string_lossy().into_owned())
        .collect())
}
