use std::fs;
use std::io::ErrorKind;
use std::process::{Command, Stdio};
use std::thread;

use super::store::Summary;
use crate::paths;

pub const SERVE_FLAG: &str = "--input-methods";

fn entry(executable: &str) -> String {
    format!(
        "[Desktop Entry]\nType=Application\nName=Keys input methods\nExec=\"{}\" {SERVE_FLAG}\nNoDisplay=true\nX-GNOME-Autostart-enabled=true\n",
        executable.replace('\\', "\\\\").replace('"', "\\\"")
    )
}

pub fn refresh(methods: &[Summary]) -> Result<(), String> {
    let autostart = paths::autostart();
    if methods.is_empty() {
        return match fs::remove_file(&autostart) {
            Err(error) if error.kind() != ErrorKind::NotFound => Err(error.to_string()),
            _ => Ok(()),
        };
    }
    let executable = std::env::current_exe().map_err(|error| error.to_string())?;
    let wanted = entry(&executable.to_string_lossy());
    if fs::read_to_string(&autostart).ok().as_deref() != Some(wanted.as_str()) {
        paths::write(&autostart, &wanted)?;
    }
    let mut host = Command::new(executable)
        .arg(SERVE_FLAG)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .spawn()
        .map_err(|error| error.to_string())?;
    thread::spawn(move || host.wait());
    Ok(())
}
