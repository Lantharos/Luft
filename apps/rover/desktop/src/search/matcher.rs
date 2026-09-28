use std::fs::{File, Metadata};
use std::io::Read;
use std::os::unix::fs::MetadataExt;
use std::path::Path;

use memchr::memchr;
use regex::bytes::{Regex, RegexBuilder};
use serde::Deserialize;

use super::kinds::{Kind, is_binary_extension, kind_of};

const MAX_CONTENT_BYTES: u64 = 16 * 1024 * 1024;
const BINARY_PROBE_BYTES: usize = 8 * 1024;
const SNIPPET_CHARS: usize = 120;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Query {
    pub root: String,
    pub text: String,
    pub contents: bool,
    pub kinds: Vec<Kind>,
    pub modified_after: Option<i64>,
    pub min_size: Option<u64>,
    pub max_size: Option<u64>,
    pub show_hidden: bool,
}

pub enum Found {
    Name,
    Content(String),
}

pub struct Matcher {
    tokens: Vec<String>,
    contents: Option<Regex>,
    kinds: Vec<Kind>,
    modified_after: Option<i64>,
    min_size: Option<u64>,
    max_size: Option<u64>,
}

impl Matcher {
    pub fn new(query: &Query) -> Result<Self, String> {
        let text = query.text.trim();
        let contents = (query.contents && !text.is_empty())
            .then(|| {
                RegexBuilder::new(&regex::escape(text))
                    .case_insensitive(true)
                    .unicode(false)
                    .build()
            })
            .transpose()
            .map_err(|error| error.to_string())?;
        Ok(Self {
            tokens: text.split_whitespace().map(str::to_lowercase).collect(),
            contents,
            kinds: query.kinds.clone(),
            modified_after: query.modified_after,
            min_size: query.min_size,
            max_size: query.max_size,
        })
    }

    pub fn find(
        &self,
        path: &Path,
        name: &str,
        is_dir: bool,
        metadata: impl Fn() -> Option<Metadata>,
    ) -> Option<Found> {
        if !self.kinds.is_empty()
            && !kind_of(name, is_dir).is_some_and(|kind| self.kinds.contains(&kind))
        {
            return None;
        }
        let name_matches = self.matches_name(name);
        let searches_content =
            !name_matches && !is_dir && self.contents.is_some() && !is_binary_extension(name);
        if !name_matches && !searches_content {
            return None;
        }
        let metadata = metadata()?;
        if !self.passes_filters(&metadata, is_dir) {
            return None;
        }
        if name_matches {
            return Some(Found::Name);
        }
        if metadata.len() > MAX_CONTENT_BYTES {
            return None;
        }
        self.search_contents(path).map(Found::Content)
    }

    fn matches_name(&self, name: &str) -> bool {
        if self.tokens.is_empty() {
            return true;
        }
        if name.is_ascii() {
            return self
                .tokens
                .iter()
                .all(|token| contains_ignore_ascii_case(name.as_bytes(), token.as_bytes()));
        }
        let lowered = name.to_lowercase();
        self.tokens
            .iter()
            .all(|token| lowered.contains(token.as_str()))
    }

    fn passes_filters(&self, metadata: &Metadata, is_dir: bool) -> bool {
        if self
            .modified_after
            .is_some_and(|after| metadata.mtime() < after)
        {
            return false;
        }
        if is_dir {
            return self.min_size.is_none() && self.max_size.is_none();
        }
        let size = metadata.len();
        self.min_size.is_none_or(|min| size >= min) && self.max_size.is_none_or(|max| size <= max)
    }

    fn search_contents(&self, path: &Path) -> Option<String> {
        let pattern = self.contents.as_ref()?;
        let mut data = Vec::new();
        File::open(path).ok()?.read_to_end(&mut data).ok()?;
        if memchr(0, &data[..data.len().min(BINARY_PROBE_BYTES)]).is_some() {
            return None;
        }
        let found = pattern.find(&data)?;
        let start = data[..found.start()]
            .iter()
            .rposition(|byte| *byte == b'\n')
            .map_or(0, |index| index + 1);
        let end = data[found.end()..]
            .iter()
            .position(|byte| *byte == b'\n')
            .map_or(data.len(), |index| found.end() + index);
        Some(snippet(
            &String::from_utf8_lossy(&data[start..end]),
            found.start() - start,
        ))
    }
}

fn snippet(line: &str, match_offset: usize) -> String {
    let line = line.trim_end();
    let match_char = line
        .char_indices()
        .take_while(|(index, _)| *index < match_offset)
        .count();
    let skip = match_char.saturating_sub(SNIPPET_CHARS / 3);
    let text: String = line.chars().skip(skip).take(SNIPPET_CHARS).collect();
    let text = text.trim();
    if skip > 0 {
        format!("…{text}")
    } else {
        text.to_string()
    }
}

fn contains_ignore_ascii_case(haystack: &[u8], needle: &[u8]) -> bool {
    if needle.len() > haystack.len() {
        return false;
    }
    haystack
        .windows(needle.len())
        .any(|window| window.eq_ignore_ascii_case(needle))
}
