use std::path::Path;

use lofty::config::ParseOptions;
use lofty::file::TaggedFileExt;
use lofty::picture::PictureType;
use lofty::probe::Probe;

use crate::artwork;

pub fn write(input: &Path, size: u32, output: &Path) -> Result<(), String> {
    let failed = |error: lofty::error::FileParseError| error.to_string();
    let file = Probe::open(input)
        .map_err(failed)?
        .guess_file_type()
        .map_err(|error| error.to_string())?
        .options(ParseOptions::new().read_properties(false))
        .read()
        .map_err(failed)?;
    let cover = file
        .tags()
        .iter()
        .flat_map(|tag| tag.pictures())
        .min_by_key(|picture| picture.pic_type() != PictureType::CoverFront)
        .ok_or_else(|| format!("{} has no cover art", input.display()))?;
    artwork::write_picture(cover.data(), size, output)
}
