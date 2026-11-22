use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};

use luft_i18n::t;
use luft_software::http;
use luft_software::progress::Stage;
use luft_software::task::Task;
use sha2::{Digest, Sha256};

use crate::catalog::cache;
use crate::l10n::L10N;
use crate::store::invited;
use crate::store::listing::Artifact;
use crate::store::signed;

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

/// Asks for `url`, with your session when it's a file schelf.store keeps for
/// the people it invited.
fn ask(url: &str) -> Result<ureq::http::Response<ureq::Body>, String> {
    let mut request = http::agent().get(url);
    if let Some(session) = invited::session_for(url)? {
        request = request.header("authorization", format!("Bearer {session}"));
    }
    request.call().map_err(signed::refused)
}

/// A file as schelf.store signed for it: where it is, how big it is and its
/// SHA-256.
pub struct Published<'a> {
    pub url: &'a str,
    pub size: u64,
    pub sha256: &'a str,
}

const SHIPPED: &str = "/usr/share/luft/preinstall";

fn folder(name: &str) -> Result<PathBuf, String> {
    let folder = cache::folder().join("store").join(name);
    fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    Ok(folder)
}

/// Where a release of Luft's own apps waits, downloaded ahead, for the
/// version of Luft it goes with.
fn ahead_folder() -> PathBuf {
    cache::folder().join("store/ahead")
}

fn save(file: &Published, query: &str, into: &Path, task: Task) -> Result<(), String> {
    if !file.url.starts_with(crate::store::DOWNLOADS) {
        return Err(t!(L10N, "core-download-changed"));
    }
    http::save(
        ask(&format!("{}?{query}&via={}", file.url, crate::store::via()))?,
        into,
        Some(file.size),
        task,
    )?;
    task.progress(Stage::Installing, None);
    if !matches(into, file)? {
        let _ = fs::remove_file(into);
        return Err(t!(L10N, "core-download-changed"));
    }
    Ok(())
}

/// Downloads `file` for `id`, asked for with `query`, keeping it only when
/// it's exactly the file the store signed for.
pub fn published_file(
    id: &str,
    file: &Published,
    query: &str,
    task: Task,
) -> Result<PathBuf, String> {
    let path = folder("downloads")?.join(format!("{id}.download"));
    save(file, query, &path, task)?;
    Ok(path)
}

/// A copy of the artifact on this computer already: downloaded ahead for
/// this version of Luft, or shipped with it.
fn at_hand_copy(artifact: &Artifact) -> Option<PathBuf> {
    let published = artifact.published();
    [
        ahead_folder().join(&artifact.sha256),
        Path::new(SHIPPED).join(artifact.name()),
    ]
    .into_iter()
    .find(|path| matches(path, &published).unwrap_or(false))
}

pub fn at_hand(artifact: &Artifact) -> bool {
    at_hand_copy(artifact).is_some()
}

/// The artifact, from a copy on this computer when there is one, otherwise
/// downloaded, kept only when it's exactly the file the store signed for.
pub fn verified(
    id: &str,
    artifact: &Artifact,
    reason: &str,
    task: Task,
) -> Result<PathBuf, String> {
    let Some(copy) = at_hand_copy(artifact) else {
        return published_file(id, &artifact.published(), &format!("reason={reason}"), task);
    };
    let path = folder("downloads")?.join(format!("{id}.download"));
    if copy.starts_with(ahead_folder()) {
        fs::rename(&copy, &path)
    } else {
        fs::copy(&copy, &path).map(drop)
    }
    .map_err(|error| error.to_string())?;
    Ok(path)
}

/// Downloads the artifact ahead of the version of Luft it goes with.
pub fn ahead(artifact: &Artifact, task: Task) -> Result<(), String> {
    if at_hand(artifact) {
        return Ok(());
    }
    let folder = folder("ahead")?;
    let partial = folder.join(format!("{}.download", artifact.sha256));
    save(&artifact.published(), "reason=update", &partial, task)?;
    fs::rename(&partial, folder.join(&artifact.sha256)).map_err(|error| error.to_string())
}

/// Forgets what was downloaded ahead, once no version of Luft waits for it.
pub fn forget_ahead() {
    let _ = fs::remove_dir_all(ahead_folder());
}

/// The artifact's file shipped with the system next to `listing`'s copy,
/// when it's exactly the file the store signed for.
pub fn shipped(listing: &Path, artifact: &Artifact) -> Result<PathBuf, String> {
    let name = artifact.url.rsplit('/').next().unwrap_or_default();
    let path = listing.with_file_name(name);
    if !matches(&path, &artifact.published())? {
        return Err(t!(
            L10N,
            "core-download-not-published",
            path = path.display().to_string()
        ));
    }
    Ok(path)
}

fn matches(path: &Path, file: &Published) -> Result<bool, String> {
    let sized = fs::metadata(path).is_ok_and(|metadata| metadata.len() == file.size);
    Ok(sized && sha256(path)? == file.sha256.to_ascii_lowercase())
}
