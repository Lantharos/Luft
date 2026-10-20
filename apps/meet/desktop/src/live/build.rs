use std::fs;
use std::path::Path;

use luft_i18n::t;

use super::download::parse_checksum;
use super::files::{self, BUILD_RECORD, UPDATING};
use super::iso::{self, Entry};
use super::source::Source;
use crate::L10N;

pub struct Listing {
    pub entries: Vec<Entry>,
    pub download: u64,
}

pub fn listing(source: &Source) -> Result<Listing, String> {
    let opened = source.open().map_err(|error| error.to_string())?;
    let download = opened.total;
    let entries = iso::list(opened.reader).map_err(|error| error.to_string())?;
    if let Some(missing) = files::missing(&entries) {
        return Err(t!(L10N, "live-download-incomplete", file = missing));
    }
    Ok(Listing { entries, download })
}

pub fn unfinished(live: &Path) -> bool {
    live.join(UPDATING).exists()
}

pub fn outdated(live: &Path, source: &Source) -> bool {
    if unfinished(live) {
        return true;
    }
    let Ok(newest) = source.checksum() else {
        return false;
    };
    let copied = fs::read_to_string(live.join(BUILD_RECORD))
        .ok()
        .and_then(|text| parse_checksum(&text));
    newest.is_none() || copied != newest
}
