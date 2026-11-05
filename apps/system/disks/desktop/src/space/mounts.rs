use std::collections::HashMap;
use std::path::{Path, PathBuf};

pub struct Mounts {
    sources: HashMap<PathBuf, String>,
    root_source: String,
}

fn unescape(field: &str) -> String {
    let bytes = field.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'\\' && index + 3 < bytes.len() {
            let octal = &field[index + 1..index + 4];
            if let Ok(value) = u8::from_str_radix(octal, 8) {
                out.push(value);
                index += 4;
                continue;
            }
        }
        out.push(bytes[index]);
        index += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

impl Mounts {
    pub fn read(root: &Path) -> Self {
        let table = std::fs::read_to_string("/proc/self/mountinfo").unwrap_or_default();
        let sources: HashMap<PathBuf, String> = table
            .lines()
            .filter_map(|line| {
                let (before, after) = line.split_once(" - ")?;
                let point = before.split(' ').nth(4)?;
                let source = after.split(' ').nth(1)?;
                Some((PathBuf::from(unescape(point)), unescape(source)))
            })
            .collect();
        let root_source = root
            .ancestors()
            .find_map(|ancestor| sources.get(ancestor))
            .cloned()
            .unwrap_or_default();
        Self {
            sources,
            root_source,
        }
    }

    pub fn same_filesystem(&self, directory: &Path) -> bool {
        self.sources
            .get(directory)
            .is_none_or(|source| *source == self.root_source)
    }
}
