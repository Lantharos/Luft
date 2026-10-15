use std::fs;
use std::os::windows::fs::MetadataExt;
use std::path::{Path, PathBuf};

const HIDDEN: u32 = 0x2;
const SYSTEM: u32 = 0x4;
const OFFLINE: u32 = 0x1000;
const RECALL_ON_OPEN: u32 = 0x40000;
const RECALL_ON_DATA_ACCESS: u32 = 0x400000;

pub struct Item {
    pub source: PathBuf,
    pub target: String,
    pub size: u64,
}

pub fn verbatim(path: &Path) -> PathBuf {
    let text = path.to_string_lossy();
    if text.starts_with(r"\\?\") {
        path.to_owned()
    } else {
        PathBuf::from(format!(r"\\?\{text}"))
    }
}

pub fn walk(source: &Path, target: &str, items: &mut Vec<Item>) {
    let Ok(entries) = fs::read_dir(verbatim(source)) else {
        return;
    };
    for entry in entries.flatten() {
        let Ok(metadata) = entry.metadata() else {
            continue;
        };
        let attributes = metadata.file_attributes();
        let only_online = attributes & (OFFLINE | RECALL_ON_OPEN | RECALL_ON_DATA_ACCESS) != 0;
        let windows_own = attributes & (HIDDEN | SYSTEM) == HIDDEN | SYSTEM;
        if metadata.file_type().is_symlink() || only_online || windows_own {
            continue;
        }
        let target = format!("{target}/{}", entry.file_name().to_string_lossy());
        if metadata.is_dir() {
            walk(&entry.path(), &target, items);
        } else {
            items.push(Item {
                source: entry.path(),
                target,
                size: metadata.len(),
            });
        }
    }
}
