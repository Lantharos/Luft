pub mod backups;
pub mod disk;
pub mod scan;
pub mod trash;

use std::path::{Component, Path, PathBuf};

const FOLDER: &str = "Heft";

pub fn root() -> Result<PathBuf, String> {
    let documents = dirs::document_dir()
        .or_else(|| dirs::home_dir().map(|home| home.join("Documents")))
        .ok_or("There is no Documents folder")?;
    Ok(documents.join(FOLDER))
}

pub fn state_folder() -> Result<PathBuf, String> {
    Ok(dirs::state_dir()
        .or_else(dirs::data_local_dir)
        .ok_or("There is no state folder")?
        .join("com.lantharos.Heft"))
}

pub fn resolve(relative: &str) -> Result<PathBuf, String> {
    let relative = Path::new(relative);
    let inside = relative
        .components()
        .all(|component| matches!(component, Component::Normal(_)));
    if !inside || relative.as_os_str().is_empty() {
        return Err(format!("{} is not inside the library", relative.display()));
    }
    Ok(root()?.join(relative))
}

pub fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}
