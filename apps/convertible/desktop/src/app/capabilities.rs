use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::PathBuf;
use std::sync::OnceLock;

use crate::engine::capabilities::Capabilities;
use crate::l10n::L10N;
use crate::queue::worker::{Priority, Worker};
use crate::worker::{Reply, Request};

use super::previews::cache_folder;
use luft_i18n::t;

static FOUND: OnceLock<Capabilities> = OnceLock::new();

fn stamp(path: Option<PathBuf>, hasher: &mut DefaultHasher) {
    let modified = path
        .and_then(|path| fs::metadata(path).ok())
        .and_then(|metadata| metadata.modified().ok());
    modified.hash(hasher);
}

fn cache_file() -> Result<PathBuf, String> {
    let mut hasher = DefaultHasher::new();
    stamp(std::env::current_exe().ok(), &mut hasher);
    stamp(
        dirs::cache_dir().map(|cache| cache.join("gstreamer-1.0/registry.x86_64.bin")),
        &mut hasher,
    );
    Ok(cache_folder()?.join(format!("capabilities-{:016x}.json", hasher.finish())))
}

fn detect() -> Result<Capabilities, String> {
    let mut worker = Worker::start(&Request::Capabilities, Priority::Interactive)
        .map_err(|error| error.to_string())?;
    let reply = worker.next_reply();
    worker.wait();
    match reply {
        Some(Reply::Capabilities(found)) => Ok(found),
        Some(Reply::Failed(message)) => Err(message),
        _ => Err(t!(L10N, "failure-no-answer")),
    }
}

fn load() -> Result<Capabilities, String> {
    let file = cache_file()?;
    if let Some(found) = fs::read(&file)
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
    {
        return Ok(found);
    }
    let found = detect()?;
    let _ = fs::write(
        file,
        serde_json::to_vec(&found).map_err(|error| error.to_string())?,
    );
    Ok(found)
}

pub fn current() -> Result<Capabilities, String> {
    if let Some(found) = FOUND.get() {
        return Ok(found.clone());
    }
    let found = load()?;
    Ok(FOUND.get_or_init(|| found).clone())
}
