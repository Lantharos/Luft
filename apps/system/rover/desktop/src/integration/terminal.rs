use std::ffi::OsString;
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;

use gio::prelude::*;

const TERN: &str = "com.lantharos.tern.desktop";

pub fn open(path: &str, token: Option<&str>) -> Result<(), String> {
    let path = Path::new(path);
    let folder = if path.is_dir() {
        path
    } else {
        path.parent()
            .ok_or("This folder can't be opened in a terminal")?
    };
    let mut working_directory = OsString::from("--working-directory=");
    working_directory.push(folder);
    let mut command = Command::new(tern().ok_or("Tern isn't installed")?);
    luft_app::launch::pass_token(&mut command, token);
    command
        .arg(working_directory)
        .current_dir(folder)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .process_group(0)
        .spawn()
        .map(|mut child| {
            thread::spawn(move || child.wait());
        })
        .map_err(|error| format!("Tern couldn't start: {error}"))
}

fn tern() -> Option<PathBuf> {
    let commandline = gio_unix::DesktopAppInfo::new(TERN)?.commandline()?;
    let argv = gio::glib::shell_parse_argv(commandline).ok()?;
    argv.into_iter().next().map(PathBuf::from)
}
