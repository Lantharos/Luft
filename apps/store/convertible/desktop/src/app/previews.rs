use std::collections::HashMap;
use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::UNIX_EPOCH;

use parking_lot::Mutex;
use serde::Serialize;
use specta::Type;

use crate::engine::inspect::{Details, Proxy};
use crate::l10n::L10N;
use crate::queue::worker::{Priority, Worker, signal_group};
use crate::worker::{Reply, Request};
use luft_i18n::t;

const CACHE_BUDGET: u64 = 512 << 20;

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Preview {
    pub path: String,
    pub width: u32,
    pub height: u32,
}

#[derive(Clone, Default)]
pub struct Previews {
    slots: Arc<Mutex<HashMap<&'static str, i32>>>,
}

pub fn cache_folder() -> Result<PathBuf, String> {
    let folder = dirs::cache_dir()
        .ok_or_else(|| t!(L10N, "failure-no-cache"))?
        .join("com.lantharos.convertible");
    fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    Ok(folder)
}

fn cache_key(path: &Path, edge: u32, time: f64) -> Result<String, String> {
    let metadata = fs::metadata(path).map_err(|error| error.to_string())?;
    let modified = metadata
        .modified()
        .ok()
        .and_then(|time| time.duration_since(UNIX_EPOCH).ok());
    let mut hasher = DefaultHasher::new();
    (path, metadata.len(), modified, edge, time.to_bits()).hash(&mut hasher);
    Ok(format!("{:016x}", hasher.finish()))
}

fn dimensions_file(image: &Path) -> PathBuf {
    image.with_extension("size")
}

fn cached(image: &Path) -> Option<Preview> {
    let size = fs::read_to_string(dimensions_file(image)).ok()?;
    let (width, height) = size.split_once('x')?;
    Some(Preview {
        path: image.to_string_lossy().into_owned(),
        width: width.parse().ok()?,
        height: height.parse().ok()?,
    })
}

pub fn prune_cache() {
    let Ok(folder) = cache_folder() else { return };
    let Ok(entries) = fs::read_dir(folder) else {
        return;
    };
    let mut files: Vec<_> = entries
        .flatten()
        .filter_map(|entry| {
            let metadata = entry.metadata().ok()?;
            metadata
                .is_file()
                .then(|| (metadata.modified().ok(), metadata.len(), entry.path()))
        })
        .collect();
    files.sort_by_key(|file| std::cmp::Reverse(file.0));
    let mut kept = 0;
    for (_, size, path) in files {
        kept += size;
        if kept > CACHE_BUDGET {
            let _ = fs::remove_file(path);
        }
    }
}

impl Previews {
    fn ask(&self, slot: &'static str, request: &Request) -> Result<Reply, String> {
        let mut worker =
            Worker::start(request, Priority::Interactive).map_err(|error| error.to_string())?;
        let group = worker.group();
        if let Some(previous) = self.slots.lock().insert(slot, group) {
            signal_group(previous, libc::SIGKILL);
        }
        let reply = worker.next_reply();
        worker.wait();
        let mut slots = self.slots.lock();
        if slots.get(slot) == Some(&group) {
            slots.remove(slot);
        }
        reply.ok_or_else(|| t!(L10N, "preview-superseded"))
    }

    pub fn proxy(&self, path: &str, edge: u32, time: f64) -> Result<Preview, String> {
        let source = Path::new(path);
        let image = cache_folder()?
            .join(cache_key(source, edge, time)?)
            .with_extension("webp");
        if let Some(preview) = cached(&image) {
            return Ok(preview);
        }
        let partial = image.with_extension(format!("{}.part", std::process::id()));
        let request = Request::Proxy {
            path: source.to_path_buf(),
            edge,
            time,
            out: partial.clone(),
        };
        match self.ask("proxy", &request) {
            Ok(Reply::Proxy(Proxy { width, height })) => {
                fs::rename(&partial, &image).map_err(|error| error.to_string())?;
                fs::write(dimensions_file(&image), format!("{width}x{height}"))
                    .map_err(|error| error.to_string())?;
                Ok(Preview {
                    path: image.to_string_lossy().into_owned(),
                    width,
                    height,
                })
            }
            Ok(Reply::Failed(message)) => Err(message),
            Ok(_) => Err(t!(L10N, "preview-superseded")),
            Err(message) => {
                let _ = fs::remove_file(partial);
                Err(message)
            }
        }
    }

    pub fn details(&self, path: &str) -> Result<Details, String> {
        match self.ask("details", &Request::Details { path: path.into() })? {
            Reply::Details(details) => Ok(details),
            Reply::Failed(message) => Err(message),
            _ => Err(t!(L10N, "preview-superseded")),
        }
    }

    pub fn peaks(&self, path: &str, duration: f64, buckets: usize) -> Result<Vec<f32>, String> {
        match self.ask(
            "peaks",
            &Request::Peaks {
                path: path.into(),
                duration,
                buckets,
            },
        )? {
            Reply::Peaks(peaks) => Ok(peaks),
            Reply::Failed(message) => Err(message),
            _ => Err(t!(L10N, "preview-superseded")),
        }
    }
}
