use std::fs;
use std::path::Path;

use skrifa::{FontRef, Tag};
use write_fonts::FontBuilder;

use super::data::FontData;
use crate::cache;

const CACHE_BUDGET: u64 = 256 * 1024 * 1024;
const CFF: Tag = Tag::new(b"CFF ");
const CFF2: Tag = Tag::new(b"CFF2");

pub fn source(path: &Path, index: u32) -> Result<String, String> {
    let data = FontData::read(path)?;
    if !data.is_collection() {
        return Ok(path.to_string_lossy().into_owned());
    }
    let font = FontRef::from_index(&data.bytes, index)
        .map_err(|_| "This font file is damaged".to_string())?;
    let outlines = font.table_data(CFF).or_else(|| font.table_data(CFF2));
    let extension = if outlines.is_some() { "otf" } else { "ttf" };
    let folder = cache::folder("fonts")?;
    let face = folder.join(format!("{}-{index}.{extension}", cache::key(path)?));
    if face.is_file() {
        cache::touch(&face);
    } else {
        fs::write(&face, FontBuilder::new().copy_missing_tables(font).build())
            .map_err(|error| error.to_string())?;
        cache::prune(&folder, CACHE_BUDGET);
    }
    Ok(face.to_string_lossy().into_owned())
}
