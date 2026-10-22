use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

use luft_software::apps::appimage::{self, Placement};
use luft_software::apps::{flatpak, toolbox};
use luft_software::system::updates;
use luft_software::task::{Cancel, Task};

const SEEDS: &str = "/usr/share/luft/preinstall";

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
        install_seed(&seed)?;
        done.insert(name);
        fs::create_dir_all(record.parent().unwrap_or(Path::new("/")))
            .map_err(|error| error.to_string())?;
        let lines: Vec<&str> = done.iter().map(String::as_str).collect();
        fs::write(&record, lines.join("\n") + "\n").map_err(|error| error.to_string())?;
    }
    Ok(())
}

fn install_seed(seed: &Path) -> Result<(), String> {
    let bundle = appimage::inspect(seed)?;
    let Placement { id, path } = appimage::placement(seed, &bundle);
    if appimage::list()
        .iter()
        .any(|app| app.id == id || app.path == path)
    {
        return Ok(());
    }
    quietly(|task| appimage::install_link(seed, task)).map(drop)
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
    if let Err(error) = toolbox::retire_shadowed() {
        eprintln!("{error}");
    }
}
