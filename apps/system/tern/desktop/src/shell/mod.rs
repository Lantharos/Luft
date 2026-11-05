use std::env;
use std::ffi::OsString;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::OnceLock;

use uzers::os::unix::UserExt;

const BASH: &str = include_str!("scripts/tern.bash");
const ZSHENV: &str = include_str!("scripts/zshenv");
const FISH: &str = include_str!("scripts/tern.fish");
const DEFAULT_DATA_DIRS: &str = "/usr/local/share:/usr/share";
const LAUNCHER_VARIABLES: [&str; 8] = [
    "COLUMNS",
    "LINES",
    "VTE_VERSION",
    "WINDOWID",
    "DESKTOP_STARTUP_ID",
    "XDG_ACTIVATION_TOKEN",
    "GIO_LAUNCHED_DESKTOP_FILE",
    "GIO_LAUNCHED_DESKTOP_FILE_PID",
];

pub fn default_shell() -> PathBuf {
    uzers::get_user_by_uid(uzers::get_current_uid())
        .map(|user| user.shell().to_path_buf())
        .filter(|shell| shell.is_file())
        .or_else(|| env::var_os("SHELL").map(PathBuf::from))
        .unwrap_or_else(|| PathBuf::from("/bin/sh"))
}

pub fn available_shells() -> Vec<String> {
    let mut shells: Vec<String> = Vec::new();
    let mut seen: Vec<PathBuf> = Vec::new();
    let listed = fs::read_to_string("/etc/shells").unwrap_or_default();
    for line in listed.lines().map(str::trim) {
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let Ok(resolved) = fs::canonicalize(line) else {
            continue;
        };
        if !seen.contains(&resolved) {
            seen.push(resolved);
            shells.push(line.to_string());
        }
    }
    shells
}

pub fn command(shell: &Path, directory: &Path, run: Option<&[String]>) -> Command {
    let mut command = match run {
        Some([line]) if line.contains(char::is_whitespace) => {
            let mut command = Command::new(shell);
            command.arg("-c").arg(line);
            command
        }
        Some([program, arguments @ ..]) => {
            let mut command = Command::new(program);
            command.args(arguments);
            command
        }
        _ => interactive(shell),
    };
    for (key, _) in env::vars_os() {
        if key.to_string_lossy().starts_with("SABINE_") {
            command.env_remove(key);
        }
    }
    for key in LAUNCHER_VARIABLES {
        command.env_remove(key);
    }
    command
        .current_dir(directory)
        .env("TERM", "xterm-256color")
        .env("COLORTERM", "truecolor")
        .env("TERM_PROGRAM", "Tern")
        .env("TERM_PROGRAM_VERSION", env!("CARGO_PKG_VERSION"));
    command
}

fn interactive(shell: &Path) -> Command {
    let mut command = Command::new(shell);
    let (Some(scripts), Some(name)) = (scripts(), shell.file_name()) else {
        return command;
    };
    match name.to_str() {
        Some("bash") => {
            command.arg("--init-file").arg(scripts.join("tern.bash"));
        }
        Some("zsh") => {
            if let Some(original) = env::var_os("ZDOTDIR") {
                command.env("TERN_ZDOTDIR", original);
            }
            command.env("ZDOTDIR", scripts.join("zsh"));
        }
        Some("fish") => {
            let data = scripts.join("fish");
            let mut dirs = OsString::from(&data);
            dirs.push(":");
            dirs.push(env::var_os("XDG_DATA_DIRS").unwrap_or_else(|| DEFAULT_DATA_DIRS.into()));
            command
                .env("XDG_DATA_DIRS", dirs)
                .env("TERN_FISH_DATA", data);
        }
        _ => {}
    }
    command
}

fn scripts() -> Option<&'static Path> {
    static SCRIPTS: OnceLock<Option<PathBuf>> = OnceLock::new();
    SCRIPTS
        .get_or_init(|| {
            let root = dirs::runtime_dir()
                .or_else(dirs::cache_dir)?
                .join("tern")
                .join("shell");
            install(&root).ok()?;
            Some(root)
        })
        .as_deref()
}

fn install(root: &Path) -> io::Result<()> {
    let fish = root.join("fish/fish/vendor_conf.d");
    fs::create_dir_all(root.join("zsh"))?;
    fs::create_dir_all(&fish)?;
    fs::write(root.join("tern.bash"), BASH)?;
    fs::write(root.join("zsh/.zshenv"), ZSHENV)?;
    fs::write(fish.join("tern.fish"), FISH)
}
