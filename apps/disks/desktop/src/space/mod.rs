mod mounts;
mod tree;
mod walk;

use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::{Duration, Instant};

use gio::prelude::*;
use luft_app::{Events, file_manager};
use parking_lot::Mutex;
use serde::Serialize;

use tree::{Node, View};

pub const UPDATE: &str = "space.update";
const TICK: Duration = Duration::from_millis(120);
const MOST_THREADS: usize = 16;

#[derive(Clone, Default)]
pub struct Explorer(Arc<Mutex<Option<Scan>>>);

#[derive(Clone)]
struct Scan {
    id: u64,
    path: PathBuf,
    root: Arc<Node>,
    cancelled: Arc<AtomicBool>,
    unreadable: Arc<AtomicU64>,
    focus: Arc<Mutex<Vec<String>>>,
    started: Instant,
    took: Arc<Mutex<Option<Duration>>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Update {
    scan: u64,
    root: String,
    view: Option<View>,
    scanning: bool,
    total_items: u64,
    total_size: u64,
    unreadable: u64,
    seconds: f64,
}

impl Scan {
    fn update(&self) -> Update {
        let focus = self.focus.lock().clone();
        let took = *self.took.lock();
        Update {
            scan: self.id,
            root: self.path.display().to_string(),
            view: self.root.find(&focus).map(|node| node.view(focus)),
            scanning: took.is_none(),
            total_items: self.root.items(),
            total_size: self.root.size(),
            unreadable: self.unreadable.load(Ordering::Relaxed),
            seconds: took.unwrap_or_else(|| self.started.elapsed()).as_secs_f64(),
        }
    }

    fn location(&self, components: &[String]) -> Option<(Arc<Node>, PathBuf)> {
        let (name, folders) = components.split_last()?;
        let mut node = self.root.clone();
        let mut path = self.path.clone();
        for folder in folders {
            path.push(&*node.exact(folder)?);
            node = node.find(std::slice::from_ref(folder))?;
        }
        path.push(&*node.exact(name)?);
        Some((node, path))
    }

    fn walk(&self, metadata: std::fs::Metadata) {
        let shared = walk::Shared::new(
            &self.path,
            &metadata,
            self.cancelled.clone(),
            self.unreadable.clone(),
        );
        let threads =
            std::thread::available_parallelism().map_or(4, |count| count.get().min(MOST_THREADS));
        let Ok(pool) = rayon::ThreadPoolBuilder::new()
            .num_threads(threads)
            .thread_name(|index| format!("space-{index}"))
            .build()
        else {
            return;
        };
        let (root, path) = (self.root.clone(), self.path.clone());
        pool.scope(|scope| {
            walk::walk(
                scope,
                root,
                path,
                std::os::unix::fs::MetadataExt::dev(&metadata),
                &shared,
            )
        });
        *self.took.lock() = Some(self.started.elapsed());
    }
}

fn report(scan: &Scan, events: &Events) {
    loop {
        std::thread::sleep(TICK);
        if scan.cancelled.load(Ordering::Relaxed) {
            return;
        }
        let update = scan.update();
        let finished = !update.scanning;
        events.emit(UPDATE, update);
        if finished {
            return;
        }
    }
}

impl Explorer {
    fn current(&self) -> Result<Scan, String> {
        self.0
            .lock()
            .clone()
            .ok_or_else(|| "Nothing is being measured".to_owned())
    }

    pub fn start(&self, events: &Events, path: &str) -> Result<Update, String> {
        self.stop();
        let path = Path::new(path)
            .canonicalize()
            .map_err(|error| error.to_string())?;
        let metadata = std::fs::metadata(&path).map_err(|error| error.to_string())?;
        if !metadata.is_dir() {
            return Err("Only folders can be measured".to_owned());
        }
        let name = path.file_name().unwrap_or(path.as_os_str()).to_owned();
        let scan = Scan {
            id: self.0.lock().as_ref().map_or(1, |scan| scan.id + 1),
            root: Node::root(&name, walk::allocated(&metadata)),
            path,
            cancelled: Arc::default(),
            unreadable: Arc::default(),
            focus: Arc::default(),
            started: Instant::now(),
            took: Arc::default(),
        };
        *self.0.lock() = Some(scan.clone());
        let walker = scan.clone();
        std::thread::spawn(move || walker.walk(metadata));
        let reporter = scan.clone();
        let events = events.clone();
        std::thread::spawn(move || report(&reporter, &events));
        Ok(scan.update())
    }

    pub fn stop(&self) {
        if let Some(scan) = self.0.lock().as_ref() {
            scan.cancelled.store(true, Ordering::Relaxed);
        }
    }

    pub fn view(&self, path: Vec<String>) -> Result<Update, String> {
        let scan = self.current()?;
        *scan.focus.lock() = path;
        Ok(scan.update())
    }

    pub fn trash(&self, components: Vec<String>) -> Result<Update, String> {
        let scan = self.current()?;
        let (parent, path) = scan.location(&components).ok_or("It's no longer there")?;
        let name = components.last().ok_or("Nothing to move")?;
        if parent.measuring(name) {
            return Err("Wait until this folder has been measured".to_owned());
        }
        gio::File::for_path(&path)
            .trash(gio::Cancellable::NONE)
            .map_err(|error| error.to_string())?;
        parent.forget(name);
        Ok(scan.update())
    }

    pub fn show(&self, components: Vec<String>) -> Result<(), String> {
        let scan = self.current()?;
        if components.is_empty() {
            return file_manager::show_folder(&scan.path);
        }
        let (parent, path) = scan.location(&components).ok_or("It's no longer there")?;
        let folder = components
            .last()
            .is_some_and(|name| parent.find(std::slice::from_ref(name)).is_some());
        if folder {
            file_manager::show_folder(&path)
        } else {
            file_manager::show_in_folder(&path)
        }
    }
}

#[cfg(test)]
mod tests {
    use std::os::unix::fs::MetadataExt;

    use super::*;

    fn wait(scan: &Scan) {
        while scan.took.lock().is_none() {
            std::thread::sleep(Duration::from_millis(5));
        }
    }

    fn allocated(path: &Path) -> u64 {
        std::fs::metadata(path).unwrap().blocks() * 512
    }

    #[test]
    fn counts_hard_links_once_and_folds_small_files() {
        let root = std::env::temp_dir().join(format!("disks-space-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&root);
        std::fs::create_dir_all(root.join("videos/raw")).unwrap();
        std::fs::create_dir_all(root.join("notes")).unwrap();
        std::fs::write(root.join("videos/raw/take.mov"), vec![7u8; 3 << 20]).unwrap();
        std::fs::hard_link(
            root.join("videos/raw/take.mov"),
            root.join("videos/copy.mov"),
        )
        .unwrap();
        for index in 0..40 {
            std::fs::write(root.join(format!("notes/{index}.txt")), b"hello").unwrap();
        }

        let explorer = Explorer::default();
        explorer
            .start(&Events::default(), root.to_str().unwrap())
            .unwrap();
        let scan = explorer.current().unwrap();
        wait(&scan);

        let movie = allocated(&root.join("videos/raw/take.mov"));
        let videos = scan.root.find(&["videos".to_owned()]).unwrap();
        let notes = scan.root.find(&["notes".to_owned()]).unwrap();
        let folders = allocated(&root.join("videos"))
            + allocated(&root.join("videos/raw"))
            + allocated(&root.join("notes"));
        assert_eq!(
            videos.size() + notes.size() + allocated(&root),
            scan.root.size()
        );
        assert_eq!(
            scan.root.size(),
            allocated(&root) + folders + movie + 40 * allocated(&root.join("notes/0.txt"))
        );
        assert!(scan.root.done());

        let view = notes.view(vec!["notes".to_owned()]);
        assert!(matches!(
            view.children.as_slice(),
            [tree::Item::Other { count: 40, .. }]
        ));

        std::fs::remove_dir_all(&root).unwrap();
    }
}
