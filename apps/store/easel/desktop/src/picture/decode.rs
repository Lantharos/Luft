use std::fs;
use std::path::Path;

use glycin::{Loader, MainContextSelector, MemoryFormat, MemoryFormatSelection};
use serde::Serialize;
use specta::Type;

use super::{context, on_glycin, premultiply};
use crate::files::{cache_file, failed};

#[derive(Serialize, Type)]
pub struct Decoded {
    file: String,
    width: u32,
    height: u32,
}

impl Decoded {
    pub fn new(file: std::path::PathBuf, width: u32, height: u32) -> Self {
        Self {
            file: file.to_string_lossy().into_owned(),
            width,
            height,
        }
    }
}

pub fn decode(path: &Path) -> Result<Decoded, String> {
    let file = gio::File::for_path(path);
    let (width, height, mut pixels) = on_glycin(async move {
        let mut loader = Loader::new(file);
        loader
            .accepted_memory_formats(MemoryFormatSelection::R8g8b8a8)
            .main_context_selector(MainContextSelector::Specific(context()));
        let mut image = loader.load().await.map_err(failed)?;
        let frame = image.next_frame().await.map_err(failed)?;
        debug_assert_eq!(frame.memory_format(), MemoryFormat::R8g8b8a8);
        let (width, height) = (frame.width(), frame.height());
        let row = width as usize * 4;
        let stride = frame.stride() as usize;
        let mut pixels = Vec::with_capacity(row * height as usize);
        for line in frame.buf_slice().chunks(stride).take(height as usize) {
            pixels.extend_from_slice(&line[..row]);
        }
        Ok((width, height, pixels))
    })?;
    premultiply(&mut pixels);
    let target = cache_file("pixels")?;
    fs::write(&target, pixels).map_err(failed)?;
    Ok(Decoded::new(target, width, height))
}
