use std::ffi::OsStr;
use std::fmt::Write;
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::path::Path;

use luft_dbus::polkit::Details;
use luft_files::client::Process;
use rustix::process::Signal;

const NAMED_AT_MOST: usize = 3;

/// What a password prompt says is about to change, and the same as values
/// for polkit rules to decide on: `operation`, and `path`, `target`, `count`
/// or `processes`. One item is named in full; several are counted, with the
/// folder they are all in.
pub struct Prompt {
    words: String,
    values: Vec<(&'static str, String)>,
}

pub(super) fn shown(path: &[u8]) -> String {
    String::from_utf8_lossy(path)
        .chars()
        .map(|character| {
            if character.is_control() {
                char::REPLACEMENT_CHARACTER
            } else {
                character
            }
        })
        .collect()
}

fn name((pid, _): Process) -> String {
    std::fs::read(format!("/proc/{pid}/comm"))
        .map_or_else(|_| pid.to_string(), |name| shown(name.trim_ascii_end()))
}

fn listed(processes: &[Process]) -> String {
    let mut list = String::new();
    for process in processes.iter().take(NAMED_AT_MOST) {
        if !list.is_empty() {
            list.push_str(", ");
        }
        let _ = write!(list, "“{}”", name(*process));
    }
    match processes.len().saturating_sub(NAMED_AT_MOST) {
        0 => {}
        more => {
            let _ = write!(list, " and {more} more");
        }
    }
    list
}

/// The deepest folder every one of the items is in.
fn shared_folder<'a>(mut paths: impl Iterator<Item = &'a Vec<u8>>) -> String {
    let folder = |path: &'a Vec<u8>| {
        Path::new(OsStr::from_bytes(path))
            .parent()
            .unwrap_or(Path::new("/"))
    };
    let first = paths.next().map_or(Path::new("/"), folder);
    let shared = paths.map(folder).fold(first, |shared, next| {
        shared
            .ancestors()
            .find(|ancestor| next.starts_with(ancestor))
            .unwrap_or(Path::new("/"))
    });
    shown(shared.as_os_str().as_bytes())
}

fn nothing() -> io::Error {
    io::ErrorKind::InvalidInput.into()
}

impl Prompt {
    fn on_item(operation: &str, path: &[u8], words: impl FnOnce(&str) -> String) -> Self {
        let path = shown(path);
        Self {
            words: words(&path),
            values: vec![("operation", operation.to_owned()), ("path", path)],
        }
    }

    fn on_items(
        operation: &str,
        paths: &[Vec<u8>],
        one: impl FnOnce(&str) -> String,
        several: impl FnOnce(usize, &str) -> String,
    ) -> io::Result<Self> {
        let (path, words) = match paths {
            [] => return Err(nothing()),
            [path] => {
                let path = shown(path);
                let words = one(&path);
                (path, words)
            }
            paths => {
                let folder = shared_folder(paths.iter());
                let words = several(paths.len(), &folder);
                (folder, words)
            }
        };
        Ok(Self {
            words,
            values: vec![
                ("operation", operation.to_owned()),
                ("path", path),
                ("count", paths.len().to_string()),
            ],
        })
    }

    fn between(operation: &str, verb: &str, items: &[(Vec<u8>, Vec<u8>)]) -> io::Result<Self> {
        let (source, target, words) = match items {
            [] => return Err(nothing()),
            [(source, target)] => {
                let (source, target) = (shown(source), shown(target));
                let words = format!("{verb} “{source}” to “{target}”");
                (source, target, words)
            }
            items => {
                let from = shared_folder(items.iter().map(|(source, _)| source));
                let to = shared_folder(items.iter().map(|(_, target)| target));
                let words = format!("{verb} {} items from “{from}” to “{to}”", items.len());
                (from, to, words)
            }
        };
        Ok(Self {
            words,
            values: vec![
                ("operation", operation.to_owned()),
                ("path", source),
                ("target", target),
                ("count", items.len().to_string()),
            ],
        })
    }

    fn on_processes(operation: &str, verb: &str, processes: &[Process]) -> Self {
        let processes = listed(processes);
        Self {
            words: format!("{verb} {processes}"),
            values: vec![
                ("operation", operation.to_owned()),
                ("processes", processes),
            ],
        }
    }

    pub fn copy(items: &[(Vec<u8>, Vec<u8>)]) -> io::Result<Self> {
        Self::between("copy", "Copy", items)
    }

    pub fn move_to(items: &[(Vec<u8>, Vec<u8>)]) -> io::Result<Self> {
        Self::between("move", "Move", items)
    }

    pub fn delete(paths: &[Vec<u8>]) -> io::Result<Self> {
        Self::on_items(
            "delete",
            paths,
            |path| format!("Delete “{path}” for good"),
            |count, folder| format!("Delete {count} items in “{folder}” for good"),
        )
    }

    pub fn trash(paths: &[Vec<u8>]) -> io::Result<Self> {
        Self::on_items(
            "trash",
            paths,
            |path| format!("Move “{path}” to the Trash"),
            |count, folder| format!("Move {count} items in “{folder}” to the Trash"),
        )
    }

    pub fn make_folder(path: &[u8]) -> Self {
        Self::on_item("make-folder", path, |path| {
            format!("Make the folder “{path}”")
        })
    }

    pub fn make_file(path: &[u8]) -> Self {
        Self::on_item("make-file", path, |path| format!("Make the file “{path}”"))
    }

    pub fn signal(processes: &[Process], signal: Signal) -> Self {
        let (operation, verb) = match signal {
            Signal::KILL => ("force-quit", "Force quit"),
            Signal::STOP => ("pause", "Pause"),
            Signal::CONT => ("continue", "Continue"),
            _ => ("quit", "Quit"),
        };
        Self::on_processes(operation, verb, processes)
    }

    pub fn set_priority(process: Process) -> Self {
        Self::on_processes("set-priority", "Change the priority of", &[process])
    }

    pub fn details(&self) -> Details<'_> {
        self.values
            .iter()
            .fold(Details::message(&self.words), |details, (key, value)| {
                details.with(key, value)
            })
    }
}
