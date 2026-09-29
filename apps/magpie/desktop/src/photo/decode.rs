use std::fs::{self, File};
use std::io::{BufWriter, Write};
use std::path::{Path, PathBuf};
use std::sync::LazyLock;
use std::sync::mpsc;
use std::thread;

use gio::glib;
use glycin::{Frame, Loader, MainContextSelector, MemoryFormat, MemoryFormatSelection};
use serde::Serialize;

use crate::cache;

const BUDGET: u64 = 2 << 30;
const WRITE_BUFFER: usize = 1 << 20;

#[derive(Serialize)]
pub struct Pixels {
    path: String,
    width: u32,
    height: u32,
    channels: u8,
}

static CONTEXT: LazyLock<glib::MainContext> = LazyLock::new(|| {
    let context = glib::MainContext::new();
    let running = context.clone();
    thread::spawn(move || {
        let runtime = tokio::runtime::Builder::new_multi_thread()
            .worker_threads(1)
            .thread_name("glycin")
            .enable_all()
            .build()
            .expect("the image decoding runtime starts");
        let _entered = runtime.enter();
        let _ = running.with_thread_default(|| {
            glib::MainLoop::new(Some(&running), false).run();
        });
    });
    context
});

pub fn decode(source: &Path) -> Result<Pixels, String> {
    let folder = cache::folder("pixels")?;
    let key = cache::key(source)?;
    if let Some(pixels) = cached(&folder, &key) {
        return Ok(pixels);
    }
    let (sender, receiver) = mpsc::channel();
    let file = gio::File::for_path(source);
    CONTEXT.spawn(async move {
        let _ = sender.send(load(file).await);
    });
    let frame = receiver.recv().map_err(|error| error.to_string())??;
    let pixels = store(&folder, &key, &frame)?;
    cache::prune(&folder, BUDGET);
    Ok(pixels)
}

async fn load(file: gio::File) -> Result<Frame, String> {
    let mut loader = Loader::new(file);
    loader
        .accepted_memory_formats(MemoryFormatSelection::R8g8b8 | MemoryFormatSelection::R8g8b8a8)
        .main_context_selector(MainContextSelector::Specific(CONTEXT.clone()));
    let mut image = loader.load().await.map_err(|error| error.to_string())?;
    image.next_frame().await.map_err(|error| error.to_string())
}

fn file_name(key: &str, width: u32, height: u32, channels: u8) -> String {
    format!("{key}-{width}x{height}-{channels}.pixels")
}

fn cached(folder: &Path, key: &str) -> Option<Pixels> {
    let prefix = format!("{key}-");
    fs::read_dir(folder).ok()?.flatten().find_map(|entry| {
        let name = entry.file_name().into_string().ok()?;
        let (size, channels) = name
            .strip_prefix(&prefix)?
            .strip_suffix(".pixels")?
            .split_once('-')?;
        let (width, height) = size.split_once('x')?;
        let path = entry.path();
        cache::touch(&path);
        Some(Pixels {
            path: path.to_string_lossy().into_owned(),
            width: width.parse().ok()?,
            height: height.parse().ok()?,
            channels: channels.parse().ok()?,
        })
    })
}

fn store(folder: &Path, key: &str, frame: &Frame) -> Result<Pixels, String> {
    let channels: u8 = match frame.memory_format() {
        MemoryFormat::R8g8b8 => 3,
        _ => 4,
    };
    let (width, height) = (frame.width(), frame.height());
    let row = width as usize * channels as usize;
    let stride = frame.stride() as usize;
    let path: PathBuf = folder.join(file_name(key, width, height, channels));
    let partial = path.with_extension("partial");
    let mut writer = BufWriter::with_capacity(
        WRITE_BUFFER,
        File::create(&partial).map_err(|error| error.to_string())?,
    );
    for line in frame.buf_slice().chunks(stride).take(height as usize) {
        writer
            .write_all(&line[..row])
            .map_err(|error| error.to_string())?;
    }
    writer.flush().map_err(|error| error.to_string())?;
    fs::rename(&partial, &path).map_err(|error| error.to_string())?;
    Ok(Pixels {
        path: path.to_string_lossy().into_owned(),
        width,
        height,
        channels,
    })
}
