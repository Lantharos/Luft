use std::collections::HashSet;
use std::fs::{self, Metadata};
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

use parking_lot::Mutex;

use super::mounts::Mounts;
use super::tree::{Contents, File, Node};

const KEPT_FILES: usize = 16;
const SMALLEST_KEPT: u64 = 256 * 1024;

pub struct Shared {
    cancelled: Arc<AtomicBool>,
    unreadable: Arc<AtomicU64>,
    mounts: Mounts,
    seen: Mutex<HashSet<(u64, u64)>>,
}

impl Shared {
    pub fn new(
        root: &Path,
        metadata: &Metadata,
        cancelled: Arc<AtomicBool>,
        unreadable: Arc<AtomicU64>,
    ) -> Self {
        Self {
            cancelled,
            unreadable,
            mounts: Mounts::read(root),
            seen: Mutex::new(HashSet::from([(metadata.dev(), metadata.ino())])),
        }
    }

    fn first_sight(&self, metadata: &Metadata) -> bool {
        self.seen.lock().insert((metadata.dev(), metadata.ino()))
    }

    fn crosses_into(&self, path: &Path, metadata: &Metadata, dev: u64) -> bool {
        metadata.dev() != dev && (!self.mounts.same_filesystem(path) || !self.first_sight(metadata))
    }
}

pub fn allocated(metadata: &Metadata) -> u64 {
    metadata.blocks() * 512
}

struct Listing {
    dirs: Vec<Arc<Node>>,
    subdirs: Vec<(Arc<Node>, PathBuf, u64)>,
    files: Vec<File>,
    other_count: u64,
    other_size: u64,
    own: u64,
    items: i64,
}

fn list(node: &Arc<Node>, path: &Path, dev: u64, shared: &Shared) -> Option<Listing> {
    let entries = fs::read_dir(path).ok()?;
    let mut listing = Listing {
        dirs: Vec::new(),
        subdirs: Vec::new(),
        files: Vec::new(),
        other_count: 0,
        other_size: 0,
        own: 0,
        items: 0,
    };
    for entry in entries.flatten() {
        let Ok(metadata) = entry.metadata() else {
            continue;
        };
        let name = entry.file_name();
        if metadata.is_dir() {
            let child_path = path.join(&name);
            if shared.crosses_into(&child_path, &metadata, dev) {
                continue;
            }
            let child = Node::child(node, &name, allocated(&metadata));
            listing.own += allocated(&metadata);
            listing.items += 1;
            listing.dirs.push(child.clone());
            listing.subdirs.push((child, child_path, metadata.dev()));
            continue;
        }
        let size = if metadata.nlink() > 1 && !shared.first_sight(&metadata) {
            0
        } else {
            allocated(&metadata)
        };
        listing.own += size;
        listing.items += 1;
        if size >= SMALLEST_KEPT {
            listing.files.push(File {
                name: name.into_boxed_os_str(),
                size,
            });
        } else {
            listing.other_count += 1;
            listing.other_size += size;
        }
    }
    if listing.files.len() > KEPT_FILES {
        listing
            .files
            .select_nth_unstable_by(KEPT_FILES, |a, b| b.size.cmp(&a.size));
        for file in listing.files.drain(KEPT_FILES..) {
            listing.other_count += 1;
            listing.other_size += file.size;
        }
    }
    Some(listing)
}

pub fn walk<'scope>(
    scope: &rayon::Scope<'scope>,
    node: Arc<Node>,
    path: PathBuf,
    dev: u64,
    shared: &'scope Shared,
) {
    if shared.cancelled.load(Ordering::Relaxed) {
        return;
    }
    let Some(listing) = list(&node, &path, dev, shared) else {
        shared.unreadable.fetch_add(1, Ordering::Relaxed);
        node.settle(0, 0, -1);
        return;
    };
    *node.contents.write() = Contents {
        dirs: listing.dirs,
        files: listing.files,
        other_count: listing.other_count,
        other_size: listing.other_size,
    };
    node.settle(
        listing.own as i64,
        listing.items,
        listing.subdirs.len() as i64 - 1,
    );
    for (child, child_path, child_dev) in listing.subdirs {
        scope.spawn(move |scope| walk(scope, child, child_path, child_dev, shared));
    }
}
