use std::fmt::Write;

use luft_dbus::polkit::Details;
use luft_files::client::Process;
use rustix::process::Signal;

const NAMED_AT_MOST: usize = 3;

/// What a password prompt says is about to change, and the same as values
/// for polkit rules to decide on: `operation`, and `path`, `target` or
/// `processes`.
pub struct Prompt {
    words: String,
    values: Vec<(&'static str, String)>,
}

fn shown(path: &[u8]) -> String {
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

impl Prompt {
    fn on_item(operation: &str, path: &[u8], words: impl FnOnce(&str) -> String) -> Self {
        let path = shown(path);
        Self {
            words: words(&path),
            values: vec![("operation", operation.to_owned()), ("path", path)],
        }
    }

    fn between(operation: &str, verb: &str, source: &[u8], target: &[u8]) -> Self {
        let (source, target) = (shown(source), shown(target));
        Self {
            words: format!("{verb} “{source}” to “{target}”"),
            values: vec![
                ("operation", operation.to_owned()),
                ("path", source),
                ("target", target),
            ],
        }
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

    pub fn copy(source: &[u8], target: &[u8]) -> Self {
        Self::between("copy", "Copy", source, target)
    }

    pub fn move_to(source: &[u8], target: &[u8]) -> Self {
        Self::between("move", "Move", source, target)
    }

    pub fn delete(path: &[u8]) -> Self {
        Self::on_item("delete", path, |path| format!("Delete “{path}” for good"))
    }

    pub fn trash(path: &[u8]) -> Self {
        Self::on_item("trash", path, |path| format!("Move “{path}” to the Trash"))
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
