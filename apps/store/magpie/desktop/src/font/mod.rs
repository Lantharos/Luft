mod data;
mod faces;
mod install;
mod preview;

use std::path::Path;

use serde::Serialize;

use data::FontData;
use faces::FontFace;
use specta::Type;

pub use install::{install, remove, status, use_as};
pub use preview::source;

#[derive(Serialize, Type)]
pub struct FontFile {
    format: &'static str,
    faces: Vec<FontFace>,
}

pub fn info(path: &Path) -> Result<FontFile, String> {
    let data = FontData::read(path)?;
    Ok(FontFile {
        format: data.format(),
        faces: faces::read(&data.bytes)?,
    })
}
