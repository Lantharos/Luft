use std::path::PathBuf;

use gio::glib;

use crate::{APP_ID, BACKGROUND};

const GROUP: &str = "Desktop Entry";
const EXEC: &str = "Exec";
const STARTUP_NOTIFY: &str = "StartupNotify";

fn entry() -> PathBuf {
    glib::user_config_dir()
        .join("autostart")
        .join(format!("{APP_ID}.desktop"))
}

fn quoted(program: &str) -> String {
    let escaped: String = program
        .chars()
        .flat_map(|character| match character {
            '"' | '`' | '$' | '\\' => vec!['\\', character],
            _ => vec![character],
        })
        .collect();
    format!("\"{escaped}\"")
}

pub fn run_in_background() {
    let path = entry();
    let file = glib::KeyFile::new();
    let flags = glib::KeyFileFlags::KEEP_COMMENTS | glib::KeyFileFlags::KEEP_TRANSLATIONS;
    if file.load_from_file(&path, flags).is_err() {
        return;
    }
    let Some(arguments) = file
        .string(GROUP, EXEC)
        .ok()
        .and_then(|exec| glib::shell_parse_argv(exec.as_str()).ok())
    else {
        return;
    };
    let Some(program) = arguments.first().and_then(|program| program.to_str()) else {
        return;
    };
    if arguments.iter().any(|argument| argument == BACKGROUND) {
        return;
    }
    file.set_string(GROUP, EXEC, &format!("{} {BACKGROUND}", quoted(program)));
    file.set_boolean(GROUP, STARTUP_NOTIFY, false);
    if let Err(error) = file.save_to_file(&path) {
        eprintln!("mailman: can't start in the background at login: {error}");
    }
}
