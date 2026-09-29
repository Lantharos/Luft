use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Write as _;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};

use parking_lot::Mutex;
use serde::Deserialize;

use super::encoding::encode;
use super::{Stat, failed};

#[derive(Clone, Default)]
pub struct Writes {
    buffers: Arc<Mutex<HashMap<u64, String>>>,
    next: Arc<AtomicU64>,
}

#[derive(Deserialize)]
pub struct Chunk {
    id: Option<u64>,
    text: String,
}

#[derive(Deserialize)]
pub struct Commit {
    id: u64,
    path: String,
    encoding: String,
    bom: bool,
}

#[derive(Deserialize)]
pub struct Discard {
    id: u64,
}

impl Writes {
    pub fn append(&self, Chunk { id, text }: Chunk) -> Result<u64, String> {
        let mut buffers = self.buffers.lock();
        let id = id.unwrap_or_else(|| self.next.fetch_add(1, Ordering::Relaxed));
        buffers.entry(id).or_default().push_str(&text);
        Ok(id)
    }

    pub fn discard(&self, Discard { id }: Discard) -> Result<(), String> {
        self.buffers.lock().remove(&id);
        Ok(())
    }

    pub fn commit(&self, commit: Commit) -> Result<Stat, String> {
        let text = self
            .buffers
            .lock()
            .remove(&commit.id)
            .ok_or("Nothing to save")?;
        let bytes = encode(&text, &commit.encoding, commit.bom)?;
        drop(text);
        replace(&resolve(Path::new(&commit.path)), &bytes, commit.id)
    }
}

fn resolve(path: &Path) -> PathBuf {
    fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf())
}

fn replace(target: &Path, bytes: &[u8], id: u64) -> Result<Stat, String> {
    let folder = target.parent().ok_or("Not a file path")?;
    let name = target
        .file_name()
        .ok_or("Not a file path")?
        .to_string_lossy();
    let staging = folder.join(format!(".{name}.wren-{}-{id}", std::process::id()));
    let permissions = fs::metadata(target)
        .ok()
        .map(|metadata| metadata.permissions());
    let written = File::create(&staging).and_then(|mut file| {
        file.write_all(bytes)?;
        if let Some(permissions) = permissions {
            file.set_permissions(permissions)?;
        }
        file.sync_all()
    });
    if let Err(error) = written.and_then(|()| fs::rename(&staging, target)) {
        let _ = fs::remove_file(&staging);
        return Err(failed(error));
    }
    fs::metadata(target)
        .map(|metadata| Stat::of(&metadata))
        .map_err(failed)
}
