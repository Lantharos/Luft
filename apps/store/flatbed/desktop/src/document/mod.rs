mod ocr;
mod page;

use std::collections::VecDeque;
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Condvar, LazyLock, Mutex};

use image::RgbImage;
use sabine::BridgeEvent;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::EVENTS;
use crate::imaging::{Mode, Origin, Quad};

pub use ocr::{Word, languages as reading_languages, read as read_page};
pub use page::{Kind, Page, PageView, Source, decode};

pub const CHANGED: BridgeEvent<DocumentView> = BridgeEvent::new("document.changed");

/// Decoded sources kept for changing a page again soon after.
const KEPT_SOURCES: usize = 3;

#[derive(Clone, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct DocumentView {
    mode: Mode,
    pages: Vec<PageView>,
}

#[derive(Default, Serialize, Deserialize)]
pub struct Document {
    pub mode: Mode,
    pub pages: Vec<Page>,
    next: u64,
}

static DOCUMENT: LazyLock<Mutex<Document>> = LazyLock::new(Default::default);
static SOURCES: Mutex<VecDeque<(String, Arc<RgbImage>)>> = Mutex::new(VecDeque::new());

pub fn folder() -> PathBuf {
    dirs::state_dir()
        .or_else(dirs::data_local_dir)
        .unwrap_or_else(std::env::temp_dir)
        .join(crate::APP_ID)
        .join("document")
}

fn manifest() -> PathBuf {
    folder().join("document.json")
}

fn lock() -> std::sync::MutexGuard<'static, Document> {
    DOCUMENT.lock().expect("document lock")
}

pub fn restore() {
    if let Some(document) = fs::read(manifest())
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
    {
        *lock() = document;
    }
    let _ = fs::create_dir_all(folder());
    for page in &lock().pages {
        ocr::queue(page);
    }
    std::thread::Builder::new()
        .name("develop".into())
        .spawn(develop_queued)
        .expect("a thread for developing pages");
}

pub fn view() -> DocumentView {
    let document = lock();
    let folder = folder();
    DocumentView {
        mode: document.mode,
        pages: document
            .pages
            .iter()
            .map(|page| page.view(&folder))
            .collect(),
    }
}

fn changed(document: &Document) {
    if let Ok(bytes) = serde_json::to_vec(document) {
        let _ = luft_app::files::replace(&manifest(), &bytes);
    }
    let folder = folder();
    EVENTS.emit(
        CHANGED,
        DocumentView {
            mode: document.mode,
            pages: document
                .pages
                .iter()
                .map(|page| page.view(&folder))
                .collect(),
        },
    );
}

fn keep_source(id: &str, source: Arc<RgbImage>) {
    let mut sources = SOURCES.lock().expect("sources lock");
    sources.retain(|(kept, _)| kept != id);
    sources.push_front((id.to_owned(), source));
    sources.truncate(KEPT_SOURCES);
}

fn source(page: &Page) -> Result<Arc<RgbImage>, String> {
    if let Some((_, source)) = SOURCES
        .lock()
        .expect("sources lock")
        .iter()
        .find(|(id, _)| *id == page.id)
    {
        return Ok(source.clone());
    }
    let source = Arc::new(page.load_source(&folder())?);
    keep_source(&page.id, source.clone());
    Ok(source)
}

impl Document {
    fn next(&mut self) -> u64 {
        self.next += 1;
        self.next
    }
}

/// Adds a page at the end, straightened and cleaned up, and returns its id.
pub fn add(source: Source, origin: Origin, dpi: Option<f32>) -> Result<String, String> {
    let (id, version, mode) = {
        let mut document = lock();
        (
            format!("p{:x}", document.next()),
            document.next() as u32,
            document.mode,
        )
    };
    let folder = folder();
    fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let (mut page, pixels) = Page::new(id.clone(), &folder, source, origin, dpi)?;
    let developed = page.develop(&folder, &pixels, mode, version)?;
    page.adopt(&folder, developed, mode);
    keep_source(&id, Arc::new(pixels));
    let mut document = lock();
    if document.mode != mode {
        develop_later([id.clone()]);
    }
    ocr::queue(&page);
    document.pages.push(page);
    changed(&document);
    Ok(id)
}

static DEVELOP: (Mutex<VecDeque<String>>, Condvar) = (Mutex::new(VecDeque::new()), Condvar::new());

fn develop_later(ids: impl IntoIterator<Item = String>) {
    let mut queue = DEVELOP.0.lock().expect("develop queue");
    for id in ids {
        if !queue.contains(&id) {
            queue.push_back(id);
        }
    }
    DEVELOP.1.notify_one();
}

/// Develops pages whose corners, turn or mode changed, one at a time, each
/// as it is when its turn comes.
fn develop_queued() {
    loop {
        let id = {
            let mut queue = DEVELOP.0.lock().expect("develop queue");
            loop {
                match queue.pop_front() {
                    Some(id) => break id,
                    None => queue = DEVELOP.1.wait(queue).expect("develop queue"),
                }
            }
        };
        let (page, mode, version) = {
            let mut document = lock();
            let Some(page) = document.pages.iter().find(|page| page.id == id).cloned() else {
                continue;
            };
            let version = document.next() as u32;
            (page, document.mode, version)
        };
        let folder = folder();
        match source(&page).and_then(|source| page.develop(&folder, &source, mode, version)) {
            Ok(developed) => {
                let mut document = lock();
                let mode = document.mode;
                match document.pages.iter_mut().find(|slot| slot.id == id) {
                    Some(slot) => {
                        slot.adopt(&folder, developed, mode);
                        ocr::queue(slot);
                    }
                    None => page.discard(&folder, developed),
                }
                changed(&document);
            }
            Err(error) => eprintln!("flatbed: couldn't develop page {id}: {error}"),
        }
    }
}

fn change(id: &str, apply: impl FnOnce(&mut Page)) -> Result<(), String> {
    let mut document = lock();
    let page = document
        .pages
        .iter_mut()
        .find(|page| page.id == id)
        .ok_or("That page is gone")?;
    apply(page);
    page.shape += 1;
    changed(&document);
    develop_later([id.to_owned()]);
    Ok(())
}

pub fn set_corners(id: &str, quad: Quad) -> Result<(), String> {
    change(id, |page| page.quad = quad)
}

pub fn turn(id: &str, quarters: i8) -> Result<(), String> {
    change(id, |page| {
        page.turns = (page.turns as i8 + quarters).rem_euclid(4) as u8
    })
}

pub fn remove(id: &str) {
    let mut document = lock();
    let folder = folder();
    document.pages.retain(|page| {
        let gone = page.id == id;
        if gone {
            page.remove_files(&folder);
        }
        !gone
    });
    changed(&document);
}

pub fn reorder(ids: &[String]) {
    let mut document = lock();
    document.pages.sort_by_key(|page| {
        ids.iter()
            .position(|id| *id == page.id)
            .unwrap_or(usize::MAX)
    });
    changed(&document);
}

pub fn clear() {
    let mut document = lock();
    let folder = folder();
    for page in document.pages.drain(..) {
        page.remove_files(&folder);
    }
    SOURCES.lock().expect("sources lock").clear();
    changed(&document);
}

/// Changes how every page comes out, developing them again in turn.
pub fn set_mode(mode: Mode) {
    let mut document = lock();
    if document.mode == mode {
        return;
    }
    document.mode = mode;
    changed(&document);
    develop_later(document.pages.iter().map(|page| page.id.clone()));
}

pub fn mode() -> Mode {
    lock().mode
}

/// A copy of the pages as they are now, for saving.
pub fn snapshot() -> (Vec<Page>, Mode, PathBuf) {
    let document = lock();
    (document.pages.clone(), document.mode, folder())
}

/// The pages' source pictures, for developing them again when saving.
pub fn source_of(page: &Page) -> Result<Arc<RgbImage>, String> {
    source(page)
}
