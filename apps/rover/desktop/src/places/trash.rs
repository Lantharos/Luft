use std::fs;
use std::path::Path;

use crate::files::trash::trash_locations;

pub fn count() -> Result<usize, String> {
    Ok(trash_locations()?
        .iter()
        .filter_map(|location| fs::read_dir(Path::new(&location.path).join("files")).ok())
        .map(Iterator::count)
        .sum())
}
