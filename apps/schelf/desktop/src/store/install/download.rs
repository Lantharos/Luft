use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};

use luft_software::http;
use luft_software::task::Task;
use sha2::{Digest, Sha256};

use crate::catalog::cache;
use crate::store::listing::Artifact;

const CHANGED: &str = "The download didn't match what schelf.store published, so it wasn't installed.";

fn sha256(path: &Path) -> Result<String, String> {
    let mut file = File::open(path).map_err(|error| error.to_string())?;
    let mut hasher = Sha256::new();
    let mut buffer = vec![0u8; 256 * 1024];
    loop {
        let read = file.read(&mut buffer).map_err(|error| error.to_string())?;
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
    }
    Ok(hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect())
}

/// Downloads the artifact, keeping it only when it's exactly the file the
/// store signed for.
pub fn verified(
    id: &str,
    artifact: &Artifact,
    reason: &str,
    task: Task,
) -> Result<PathBuf, String> {
    if !artifact.url.starts_with(crate::store::DOWNLOADS) {
        return Err(CHANGED.into());
    }
    let folder = cache::folder().join("store/downloads");
    fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let path = folder.join(format!("{id}.download"));
    http::download(&format!("{}?reason={reason}", artifact.url), &path, task)?;
    if !published(&path, artifact)? {
        let _ = fs::remove_file(&path);
        return Err(CHANGED.into());
    }
    Ok(path)
}

/// The artifact's file shipped with the system next to `listing`'s copy,
/// when it's exactly the file the store signed for.
pub fn shipped(listing: &Path, artifact: &Artifact) -> Result<PathBuf, String> {
    let name = artifact.url.rsplit('/').next().unwrap_or_default();
    let path = listing.with_file_name(name);
    if !published(&path, artifact)? {
        return Err(format!(
            "{} isn't the file schelf.store published.",
            path.display()
        ));
    }
    Ok(path)
}

fn published(path: &Path, artifact: &Artifact) -> Result<bool, String> {
    let sized = fs::metadata(path).is_ok_and(|metadata| metadata.len() == artifact.size);
    Ok(sized && sha256(path)? == artifact.sha256.to_ascii_lowercase())
}
