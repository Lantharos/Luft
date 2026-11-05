use std::path::Path;

use lofty::config::WriteOptions;
use lofty::file::TaggedFileExt;
use lofty::read_from_path;
use lofty::tag::{Tag, TagExt};

use crate::engine::error::Result;

fn source_tag(path: &Path) -> Option<Tag> {
    let file = read_from_path(path).ok()?;
    file.primary_tag().or_else(|| file.first_tag()).cloned()
}

pub fn carry(source: &Path, output: &Path) -> Result<()> {
    let Some(mut tag) = source_tag(source) else {
        return Ok(());
    };
    let Ok(file) = read_from_path(output) else {
        return Ok(());
    };
    tag.re_map(file.primary_tag_type());
    let _ = tag.save_to_path(output, WriteOptions::default());
    Ok(())
}
