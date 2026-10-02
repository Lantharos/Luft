mod data;
mod faces;
mod install;
mod preview;

use std::path::Path;

use serde::Serialize;

use data::FontData;
use faces::Face;

pub use install::{install, remove, status};
pub use preview::source;

#[derive(Serialize)]
pub struct FontFile {
    format: &'static str,
    faces: Vec<Face>,
}

pub fn info(path: &Path) -> Result<FontFile, String> {
    let data = FontData::read(path)?;
    Ok(FontFile {
        format: data.format(),
        faces: faces::read(&data.bytes)?,
    })
}
