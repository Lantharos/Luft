use std::env;
use std::fs::{self, File, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

use crate::paths;

const LOCALE: &str = "include \"%L\"\n";

fn home() -> PathBuf {
    dirs::home_dir().unwrap_or_default()
}

pub fn main_file() -> PathBuf {
    home().join(".XCompose")
}

fn shadowing() -> Vec<PathBuf> {
    let config = dirs::config_dir().unwrap_or_else(|| home().join(".config"));
    let mut files = vec![
        config.join("XCompose"),
        config.join("ibus/Compose"),
        config.join("gtk-4.0/Compose"),
        config.join("gtk-3.0/Compose"),
    ];
    files.extend(env::var_os("XCOMPOSEFILE").map(PathBuf::from));
    files.retain(|file| file.is_file());
    files
}

fn include_line(file: &Path) -> String {
    let shown = file.strip_prefix(home()).map_or_else(
        |_| file.display().to_string(),
        |relative| format!("%H/{}", relative.display()),
    );
    format!("include \"{shown}\"\n")
}

fn mentions(contents: &str, file: &Path, line: &str) -> bool {
    contents.contains(line.trim_end()) || contents.contains(&file.display().to_string())
}

fn append(target: &Path, line: &str) -> Result<(), String> {
    let contents = fs::read_to_string(target).map_err(|error| error.to_string())?;
    let separator = if contents.is_empty() || contents.ends_with('\n') {
        ""
    } else {
        "\n"
    };
    OpenOptions::new()
        .append(true)
        .open(target)
        .and_then(|mut opened| write!(opened, "{separator}{line}"))
        .map_err(|error| error.to_string())
}

fn touch(target: &Path) {
    if let Ok(opened) = File::options().write(true).open(target) {
        let _ = opened.set_modified(SystemTime::now());
    }
}

pub fn include(file: &Path) -> Result<(), String> {
    let line = include_line(file);
    let main = main_file();
    if !main.exists() {
        paths::write(&main, &format!("{LOCALE}{line}"))?;
    }
    for target in std::iter::once(main).chain(shadowing()) {
        let contents = fs::read_to_string(&target).unwrap_or_default();
        if mentions(&contents, file, &line) {
            touch(&target);
        } else {
            append(&target, &line)?;
        }
    }
    Ok(())
}

pub fn modified() -> Vec<Option<SystemTime>> {
    std::iter::once(main_file())
        .chain(shadowing())
        .chain(std::iter::once(paths::compose()))
        .map(|file| {
            fs::metadata(file)
                .and_then(|metadata| metadata.modified())
                .ok()
        })
        .collect()
}
