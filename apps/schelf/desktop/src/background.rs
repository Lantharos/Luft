use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

use gio::prelude::*;
use luft_software::appimage::{self, AppImage, Placement};
use luft_software::task::{Cancel, Task};
use luft_software::{flatpak, updates};

const SEEDS: &str = "/usr/share/luft/preinstall";
const BROWSER_TYPES: [&str; 4] = [
    "x-scheme-handler/https",
    "x-scheme-handler/http",
    "text/html",
    "application/xhtml+xml",
];

pub fn run(command: &str) -> Option<i32> {
    let result = match command {
        "--preinstall" => preinstall(),
        "--update-apps" => update_apps(),
        "--integrate-apps" => {
            integrate_apps();
            Ok(())
        }
        _ => return None,
    };
    Some(match result {
        Ok(()) => 0,
        Err(error) => {
            eprintln!("{error}");
            1
        }
    })
}

fn quietly<T>(work: impl FnOnce(Task) -> Result<T, String>) -> Result<T, String> {
    let cancel = Cancel::default();
    let task = Task {
        report: &|_| {},
        cancel: &cancel,
    };
    let _exclusive = task.exclusive()?;
    work(task)
}

fn record() -> PathBuf {
    dirs::state_dir()
        .unwrap_or_default()
        .join("luft/preinstalled")
}

fn seeds() -> Vec<PathBuf> {
    let Ok(entries) = fs::read_dir(SEEDS) else {
        return Vec::new();
    };
    let mut seeds: Vec<PathBuf> = entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| appimage::is_appimage(path))
        .collect();
    seeds.sort();
    seeds
}

fn preinstall() -> Result<(), String> {
    let record = record();
    let mut done: BTreeSet<String> = fs::read_to_string(&record)
        .unwrap_or_default()
        .lines()
        .map(str::to_owned)
        .collect();
    for seed in seeds() {
        let Some(name) = seed
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
        else {
            continue;
        };
        if done.contains(&name) {
            continue;
        }
        if let Some(app) = install_seed(&seed)? {
            prefer_as_browser(&app);
        }
        done.insert(name);
        fs::create_dir_all(record.parent().unwrap_or(Path::new("/")))
            .map_err(|error| error.to_string())?;
        let lines: Vec<&str> = done.iter().map(String::as_str).collect();
        fs::write(&record, lines.join("\n") + "\n").map_err(|error| error.to_string())?;
    }
    Ok(())
}

fn install_seed(seed: &Path) -> Result<Option<AppImage>, String> {
    let bundle = appimage::inspect(seed)?;
    let Placement { id, path } = appimage::placement(seed, &bundle);
    if appimage::list()
        .iter()
        .any(|app| app.id == id || app.path == path)
    {
        return Ok(None);
    }
    quietly(|task| appimage::install_link(seed, task)).map(Some)
}

fn prefer_as_browser(app: &AppImage) {
    let Some(info) = gio_unix::DesktopAppInfo::new(&format!("{}.desktop", app.id)) else {
        return;
    };
    let supported = info.supported_types();
    let chosen = gio::AppInfo::default_for_type(BROWSER_TYPES[0], false)
        .and_then(|default| default.id())
        .filter(|default| *default != info.id().unwrap_or_default());
    if chosen.is_some() || !supported.iter().any(|kind| kind == BROWSER_TYPES[0]) {
        return;
    }
    for kind in BROWSER_TYPES {
        if supported.iter().any(|supported| supported == kind)
            && let Err(error) = info.set_as_default_for_type(kind)
        {
            eprintln!("{} can't open {kind}: {error}", app.name);
        }
    }
}

fn update_apps() -> Result<(), String> {
    let mut failures = Vec::new();
    for (app, _) in updates::appimages() {
        match quietly(|task| appimage::update(&app, task)) {
            Ok(updated) => eprintln!(
                "Updated {} to {}",
                updated.name,
                updated.version.as_deref().unwrap_or("its newest version")
            ),
            Err(error) => failures.push(format!("{}: {error}", app.name)),
        }
    }
    if failures.is_empty() {
        Ok(())
    } else {
        Err(failures.join("\n"))
    }
}

pub fn integrate_apps() {
    appimage::repair();
    flatpak::integrate();
}
