mod file;
mod verity;

use std::collections::{HashMap, HashSet};
use std::fs::Metadata;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::mpsc::{Receiver, SyncSender, sync_channel};
use std::sync::{Arc, Mutex};

use anyhow::{Context, Result, anyhow};
use rustix::fs::IFlags;

use crate::system::host::command::Tool;

const WORKERS: usize = 4;
const QUEUED: usize = 512;
const SUBVOLUME_ROOT: u64 = 256;

#[derive(Default)]
pub struct Progress {
    pub done: AtomicU64,
    pub total: AtomicU64,
}

struct Job {
    from: PathBuf,
    to: PathBuf,
    meta: Metadata,
    flags: IFlags,
}

struct Folder {
    from: PathBuf,
    to: PathBuf,
    meta: Metadata,
    flags: IFlags,
    read_only: bool,
}

fn is_subvolume(meta: &Metadata, parent: &Metadata) -> bool {
    meta.is_dir() && meta.ino() == SUBVOLUME_ROOT && meta.dev() != parent.dev()
}

fn read_only(path: &Path) -> bool {
    Tool::new("btrfs")
        .args(["property", "get", "-ts"])
        .arg(path)
        .arg("ro")
        .output()
        .is_ok_and(|value| value.trim() == "ro=true")
}

fn set_read_only(path: &Path, read_only: bool) -> Result<()> {
    Tool::new("btrfs")
        .args(["property", "set", "-f", "-ts"])
        .arg(path)
        .args(["ro", if read_only { "true" } else { "false" }])
        .status()
}

fn children(path: &Path) -> Result<Vec<PathBuf>> {
    std::fs::read_dir(path)
        .with_context(|| format!("{} couldn't be read", path.display()))?
        .map(|entry| Ok(entry?.path()))
        .collect()
}

pub fn measure(root: &Path) -> Result<u64> {
    let mut total = 0;
    let mut seen = HashSet::new();
    let mut folders = vec![root.to_owned()];
    while let Some(folder) = folders.pop() {
        for path in children(&folder)? {
            let meta = std::fs::symlink_metadata(&path)?;
            if meta.is_dir() {
                folders.push(path);
            } else if meta.is_file() && (meta.nlink() == 1 || seen.insert((meta.dev(), meta.ino())))
            {
                total += meta.len();
            }
        }
    }
    Ok(total)
}

struct Walk<'a> {
    from: &'a Path,
    to: &'a Path,
    progress: &'a Progress,
    jobs: SyncSender<Job>,
    failed: &'a AtomicBool,
    linked: HashMap<(u64, u64), PathBuf>,
    folders: Vec<Folder>,
}

impl Walk<'_> {
    fn target(&self, path: &Path) -> Result<PathBuf> {
        Ok(self.to.join(path.strip_prefix(self.from)?))
    }

    fn file(&mut self, from: PathBuf, to: PathBuf, meta: Metadata) -> Result<()> {
        if meta.nlink() > 1 {
            let key = (meta.dev(), meta.ino());
            if let Some(first) = self.linked.get(&key) {
                return file::hard_link(first, &to);
            }
            self.linked.insert(key, to.clone());
            if file::unchanged(&meta, &to) {
                self.progress.done.fetch_add(meta.len(), Ordering::Relaxed);
                return Ok(());
            }
            let flags = file::flags_of(&from, &meta);
            file::copy_contents(&from, &to, &meta, flags, &self.progress.done)?;
            return file::finish(&from, &to, &meta, flags);
        }
        if file::unchanged(&meta, &to) {
            self.progress.done.fetch_add(meta.len(), Ordering::Relaxed);
            return Ok(());
        }
        let flags = file::flags_of(&from, &meta);
        self.jobs
            .send(Job {
                from,
                to,
                meta,
                flags,
            })
            .map_err(|_| anyhow!("The copy stopped"))
    }

    fn folder(&mut self, from: PathBuf, meta: Metadata, parent: &Metadata) -> Result<()> {
        let to = self.target(&from)?;
        let flags = file::flags_of(&from, &meta);
        let subvolume = is_subvolume(&meta, parent);
        file::make_dir(&to, subvolume, flags)?;
        let read_only = subvolume && read_only(&from);
        if read_only && self::read_only(&to) {
            set_read_only(&to, false)?;
        }
        for child in children(&from)? {
            if self.failed.load(Ordering::Relaxed) {
                return Ok(());
            }
            self.entry(child, &meta)?;
        }
        self.folders.push(Folder {
            from,
            to,
            meta,
            flags,
            read_only,
        });
        Ok(())
    }

    fn entry(&mut self, from: PathBuf, parent: &Metadata) -> Result<()> {
        let meta = std::fs::symlink_metadata(&from)?;
        if meta.is_dir() {
            return self.folder(from, meta, parent);
        }
        let to = self.target(&from)?;
        if meta.is_file() {
            return self.file(from, to, meta);
        }
        if meta.is_symlink() {
            file::make_symlink(&from, &to)?;
        } else {
            file::make_special(&to, &meta)?;
        }
        file::finish(&from, &to, &meta, IFlags::empty())
    }
}

fn work(
    jobs: &Mutex<Receiver<Job>>,
    progress: &Progress,
    failed: &AtomicBool,
    error: &Mutex<Option<anyhow::Error>>,
) {
    loop {
        let job = jobs.lock().expect("job queue").recv();
        let Ok(job) = job else { return };
        if failed.load(Ordering::Relaxed) {
            continue;
        }
        let copied = file::copy_contents(&job.from, &job.to, &job.meta, job.flags, &progress.done)
            .and_then(|()| file::finish(&job.from, &job.to, &job.meta, job.flags));
        if let Err(caught) = copied {
            failed.store(true, Ordering::Relaxed);
            error.lock().expect("copy error").get_or_insert(caught);
        }
    }
}

pub fn tree(from: &Path, to: &Path, progress: &Progress) -> Result<()> {
    progress.total.store(measure(from)?, Ordering::Relaxed);
    let root = std::fs::symlink_metadata(from)?;
    let (sender, receiver) = sync_channel(QUEUED);
    let receiver = Arc::new(Mutex::new(receiver));
    let failed = AtomicBool::new(false);
    let error = Mutex::new(None);
    let walked = std::thread::scope(|scope| {
        for _ in 0..WORKERS {
            let receiver = receiver.clone();
            let (failed, error) = (&failed, &error);
            scope.spawn(move || work(&receiver, progress, failed, error));
        }
        let mut walk = Walk {
            from,
            to,
            progress,
            jobs: sender,
            failed: &failed,
            linked: HashMap::new(),
            folders: Vec::new(),
        };
        let walked = children(from).and_then(|entries| {
            entries
                .into_iter()
                .try_for_each(|child| walk.entry(child, &root))
        });
        if walked.is_err() {
            failed.store(true, Ordering::Relaxed);
        }
        let Walk { folders, .. } = walk;
        walked.map(|()| folders)
    });
    if let Some(caught) = error.into_inner().expect("copy error") {
        return Err(caught);
    }
    for folder in walked?.iter().rev() {
        file::finish(&folder.from, &folder.to, &folder.meta, folder.flags)?;
        if folder.read_only {
            set_read_only(&folder.to, true)?;
        }
    }
    file::finish(from, to, &root, file::flags_of(from, &root))?;
    rustix::fs::syncfs(std::fs::File::open(to)?)?;
    Ok(())
}
