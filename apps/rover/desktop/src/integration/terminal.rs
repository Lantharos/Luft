use std::env;
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;

use gio::prelude::*;

const TERMINAL_CATEGORY: &str = "TerminalEmulator";
const KNOWN: [&str; 12] = [
    "ptyxis",
    "kgx",
    "gnome-terminal",
    "konsole",
    "ghostty",
    "kitty",
    "alacritty",
    "foot",
    "wezterm",
    "xfce4-terminal",
    "tilix",
    "xterm",
];

pub fn open(path: &str) -> Result<(), String> {
    let path = Path::new(path);
    let folder = if path.is_dir() {
        path
    } else {
        path.parent()
            .ok_or("This folder can't be opened in a terminal")?
    };
    let mut failures = Vec::new();
    for program in candidates() {
        match launch(&program, folder) {
            Ok(()) => return Ok(()),
            Err(error) => failures.push(error),
        }
    }
    Err(if failures.is_empty() {
        "No terminal app is installed".to_string()
    } else {
        failures.join("; ")
    })
}

fn candidates() -> Vec<PathBuf> {
    let mut programs: Vec<PathBuf> = env::var_os("TERMINAL")
        .map(PathBuf::from)
        .into_iter()
        .collect();
    programs.push(PathBuf::from("xdg-terminal-exec"));
    programs.extend(
        gio::AppInfo::all()
            .into_iter()
            .filter_map(|app| app.downcast::<gio_unix::DesktopAppInfo>().ok())
            .filter(|app| {
                app.categories().is_some_and(|categories| {
                    categories
                        .split(';')
                        .any(|category| category == TERMINAL_CATEGORY)
                })
            })
            .map(|app| app.executable()),
    );
    programs.extend(KNOWN.iter().map(PathBuf::from));
    let mut unique = Vec::with_capacity(programs.len());
    for program in programs {
        if let Some(found) = resolve(&program)
            && !unique.contains(&found)
        {
            unique.push(found);
        }
    }
    unique
}

fn resolve(program: &Path) -> Option<PathBuf> {
    if program.is_absolute() {
        return program.is_file().then(|| program.to_path_buf());
    }
    env::split_paths(&env::var_os("PATH")?)
        .map(|folder| folder.join(program))
        .find(|candidate| candidate.is_file())
}

fn launch(program: &Path, folder: &Path) -> Result<(), String> {
    let name = program
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .unwrap_or_default();
    let folder_argument = folder.to_string_lossy();
    let arguments: Vec<String> = match name.as_str() {
        "ptyxis" => vec![
            "--new-window".into(),
            format!("--working-directory={folder_argument}"),
        ],
        "gnome-terminal" | "kgx" | "xfce4-terminal" | "tilix" | "ghostty" | "foot" => {
            vec![format!("--working-directory={folder_argument}")]
        }
        "konsole" => vec!["--workdir".into(), folder_argument.into_owned()],
        "kitty" => vec!["--directory".into(), folder_argument.into_owned()],
        "alacritty" => vec!["--working-directory".into(), folder_argument.into_owned()],
        "wezterm" => vec!["start".into(), "--cwd".into(), folder_argument.into_owned()],
        _ => Vec::new(),
    };
    Command::new(program)
        .args(arguments)
        .current_dir(folder)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .process_group(0)
        .spawn()
        .map(|mut child| {
            thread::spawn(move || child.wait());
        })
        .map_err(|error| format!("{name}: {error}"))
}
