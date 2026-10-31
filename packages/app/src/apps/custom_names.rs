use std::collections::HashMap;
use std::fs;
use std::io;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::SystemTime;

use gio::glib;

const GROUP: &str = "Names";

struct Index {
    modified: Option<SystemTime>,
    names: HashMap<String, String>,
}

static INDEX: Mutex<Option<Index>> = Mutex::new(None);

fn file() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_default()
        .join("luft")
        .join("app-names")
}

fn load() -> glib::KeyFile {
    let names = glib::KeyFile::new();
    let _ = names.load_from_file(file(), glib::KeyFileFlags::NONE);
    names
}

fn read() -> HashMap<String, String> {
    let names = load();
    names
        .keys(GROUP)
        .into_iter()
        .flatten()
        .filter_map(|id| {
            let name = names.string(GROUP, &id).ok()?;
            Some((id.to_string(), name.to_string()))
        })
        .collect()
}

pub fn custom_name(desktop_id: &str) -> Option<String> {
    let modified = fs::metadata(file()).and_then(|meta| meta.modified()).ok();
    let mut index = INDEX
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    if index
        .as_ref()
        .is_none_or(|index| index.modified != modified)
    {
        *index = Some(Index {
            modified,
            names: read(),
        });
    }
    index.as_ref()?.names.get(desktop_id).cloned()
}

/// Shows the app as `name` instead of the name it comes with, or with its own
/// name again when `name` is empty.
pub fn set_custom_name(desktop_id: &str, name: &str) -> io::Result<()> {
    let names = load();
    match name.trim() {
        "" => {
            let _ = names.remove_key(GROUP, desktop_id);
        }
        name => names.set_string(GROUP, desktop_id, name),
    }
    crate::files::replace(&file(), names.to_data().as_bytes())
}
