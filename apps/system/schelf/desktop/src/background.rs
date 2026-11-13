use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

use luft_app::block_on;
use luft_software::apps::appimage::{self, Placement};
use luft_software::apps::{flatpak, toolbox, updates};
use luft_software::task::{Cancel, Task};

use schelf_core::store;
use schelf_core::store::install::Reason;

const SEEDS: &str = "/usr/share/luft/preinstall";

pub fn run(command: &str) -> Option<i32> {
    let result = match command {
        "--preinstall" => preinstall(),
        "--update-apps" => update_apps(),
        "--check-revocations" => store::check_revocations(),
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

fn is_store_listing(path: &Path) -> bool {
    path.extension()
        .is_some_and(|extension| extension == "json")
}

fn seeds() -> Vec<PathBuf> {
    let Ok(entries) = fs::read_dir(SEEDS) else {
        return Vec::new();
    };
    let mut seeds: Vec<PathBuf> = entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| appimage::is_appimage(path) || is_store_listing(path))
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
    let mut failures = Vec::new();
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
        if let Err(error) = install_seed(&seed) {
            failures.push(format!("{name}: {error}"));
            continue;
        }
        done.insert(name);
        fs::create_dir_all(record.parent().unwrap_or(Path::new("/")))
            .map_err(|error| error.to_string())?;
        let lines: Vec<&str> = done.iter().map(String::as_str).collect();
        fs::write(&record, lines.join("\n") + "\n").map_err(|error| error.to_string())?;
    }
    if failures.is_empty() {
        Ok(())
    } else {
        Err(failures.join("\n"))
    }
}

fn install_seed(seed: &Path) -> Result<(), String> {
    if is_store_listing(seed) {
        return quietly(|task| store::install::install_shipped(seed, task));
    }
    let bundle = appimage::inspect(seed)?;
    let Placement { id, path } = appimage::placement(seed, &bundle);
    if appimage::list()
        .iter()
        .any(|app| app.id == id || app.path == path)
    {
        return Ok(());
    }
    let installed = quietly(|task| appimage::install_link(seed, task))?;
    block_on(appimage::reset(
        &installed.app.id,
        installed.declaration.as_ref(),
        false,
    ))
}

fn update_store_apps(failures: &mut Vec<String>) {
    let found = match store::updates::find() {
        Ok(found) => found,
        Err(error) => return failures.push(error),
    };
    for update in found.into_iter().filter(|update| !update.widens) {
        match quietly(|task| {
            store::install::install(&update.id, &update.consent, Reason::Update, task)
        }) {
            Ok(()) => match &update.replacement {
                Some(replacement) => eprintln!("Replaced {} with {replacement}", update.name),
                None => eprintln!("Updated {} to {}", update.name, update.to),
            },
            Err(error) => failures.push(format!("{}: {error}", update.name)),
        }
    }
}

fn update_apps() -> Result<(), String> {
    let mut failures = Vec::new();
    update_store_apps(&mut failures);
    let managed: BTreeSet<String> = store::record::all()
        .into_values()
        .map(|installed| installed.local)
        .collect();
    for (app, _) in updates::appimages()
        .into_iter()
        .filter(|(app, _)| !managed.contains(&app.id))
    {
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
