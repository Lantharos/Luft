pub mod dialogs;
pub mod jobs;
pub mod store;

use std::fs;
use std::path::{Path, PathBuf};

use luft_i18n::t;

use crate::l10n::L10N;

pub fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub fn cache_folder() -> Result<PathBuf, String> {
    let folder = dirs::runtime_dir()
        .or_else(dirs::cache_dir)
        .ok_or_else(|| t!(L10N, "easel-error-no-cache"))?
        .join("easel");
    fs::create_dir_all(&folder).map_err(failed)?;
    Ok(folder)
}

pub fn cache_file(name: &str) -> Result<PathBuf, String> {
    Ok(cache_folder()?.join(format!(
        "{}-{name}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(failed)?
            .as_nanos()
    )))
}

pub fn release(paths: &[String]) -> Result<(), String> {
    let folder = cache_folder()?;
    for path in paths {
        let path = Path::new(path);
        if path.parent() == Some(folder.as_path()) {
            let _ = fs::remove_file(path);
        }
    }
    Ok(())
}

pub fn write_atomically(
    path: &Path,
    write: impl FnOnce(&mut fs::File) -> Result<(), String>,
) -> Result<(), String> {
    let name = path
        .file_name()
        .ok_or_else(|| t!(L10N, "easel-error-no-name"))?
        .to_string_lossy();
    let partial = path.with_file_name(format!(".{name}.partial"));
    let mut file = fs::File::create(&partial).map_err(failed)?;
    let written = write(&mut file).and_then(|()| file.sync_all().map_err(failed));
    if let Err(error) = written {
        let _ = fs::remove_file(&partial);
        return Err(error);
    }
    fs::rename(&partial, path).map_err(failed)
}

pub async fn blocking<T: Send + 'static>(
    work: impl FnOnce() -> Result<T, String> + Send + 'static,
) -> Result<T, String> {
    sabine::async_runtime()
        .spawn_blocking(work)
        .await
        .map_err(failed)?
}
