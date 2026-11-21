use std::ffi::OsString;
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;

use gio::prelude::*;
use luft_i18n::t;

use crate::l10n::L10N;

const TERMINAL: &str = "com.lantharos.terminal.desktop";

pub fn open(path: &str, token: Option<&str>) -> Result<(), String> {
    let path = Path::new(path);
    let folder = if path.is_dir() {
        path
    } else {
        path.parent()
            .ok_or_else(|| t!(L10N, "rover-terminal-no-folder"))?
    };
    let mut working_directory = OsString::from("--working-directory=");
    working_directory.push(folder);
    let mut command = Command::new(program().ok_or_else(|| t!(L10N, "rover-terminal-missing"))?);
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
        .map_err(|error| t!(L10N, "rover-terminal-failed", error = error.to_string()))
}

fn program() -> Option<PathBuf> {
    let commandline = gio_unix::DesktopAppInfo::new(TERMINAL)?.commandline()?;
    let argv = gio::glib::shell_parse_argv(commandline).ok()?;
    argv.into_iter().next().map(PathBuf::from)
}
