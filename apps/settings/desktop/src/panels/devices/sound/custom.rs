use std::collections::HashMap;
use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::io;
use std::path::{Path, PathBuf};

use gio::glib;
use gio::prelude::*;
use luft_app::Empty;
use luft_app::portal::{self, FileChooser, Filter};
use luft_i18n::t;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::kestrel::{self, Verdict};
use crate::L10N;

const SCHEMA: &str = "com.lantharos.kestrel.sounds";
const CUSTOM: &str = "custom";
const THEME_FOLDER: &str = "stereo";
const EXTENSIONS: [&str; 8] = ["oga", "ogg", "opus", "wav", "flac", "mp3", "m4a", "aac"];
const LONGEST_SECONDS: u32 = 10;

#[derive(Deserialize, Type)]
pub struct Sound {
    name: String,
}

#[derive(Deserialize, Type)]
pub struct Sounds {
    names: Vec<String>,
}

#[derive(Serialize, Type)]
pub struct SoundSet {
    used: u32,
    skipped: Vec<String>,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn store() -> PathBuf {
    glib::user_data_dir().join("kestrel/sounds")
}

fn file_name(path: &Path) -> String {
    path.file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .into_owned()
}

fn remember(change: impl FnOnce(&mut HashMap<String, String>)) -> Result<(), String> {
    let settings = gio::Settings::new(SCHEMA);
    let mut custom: HashMap<String, String> = settings.get(CUSTOM);
    change(&mut custom);
    settings.set(CUSTOM, &custom).map_err(failed)?;
    gio::Settings::sync();
    Ok(())
}

fn remove_folder(folder: &Path) -> io::Result<()> {
    match fs::remove_dir_all(folder) {
        Err(error) if error.kind() != io::ErrorKind::NotFound => Err(error),
        _ => Ok(()),
    }
}

fn keep_copy(name: &str, source: &Path) -> Result<String, String> {
    let contents = fs::read(source).map_err(failed)?;
    let mut hasher = DefaultHasher::new();
    contents.hash(&mut hasher);
    let sound = store().join(name);
    remove_folder(&sound).map_err(failed)?;
    let folder = sound.join(format!("{:016x}", hasher.finish()));
    fs::create_dir_all(&folder).map_err(failed)?;
    let copy = folder.join(file_name(source));
    fs::write(&copy, contents).map_err(failed)?;
    Ok(copy.to_string_lossy().into_owned())
}

async fn usable(path: &Path) -> Result<(), String> {
    let name = file_name(path);
    match kestrel::check(path).await? {
        Verdict::Playable => Ok(()),
        Verdict::TooLong => Err(t!(
            L10N,
            "desktop-sound-too-long",
            name = name.as_str(),
            seconds = LONGEST_SECONDS
        )),
        Verdict::Unplayable => Err(t!(L10N, "desktop-sound-unplayable", name = name.as_str())),
    }
}

fn local_path(uri: &str) -> Result<PathBuf, String> {
    gio::File::for_uri(uri)
        .path()
        .ok_or_else(|| t!(L10N, "desktop-sound-unopenable"))
}

pub async fn choose(Sound { name }: Sound) -> Result<(), String> {
    let title = t!(L10N, "desktop-sound-choose-title");
    let filter = t!(L10N, "desktop-sound-filter");
    let Some(uri) = portal::open_file(
        &title,
        Filter {
            name: &filter,
            patterns: EXTENSIONS
                .iter()
                .map(|extension| format!("*.{extension}"))
                .collect(),
        },
    )
    .await?
    else {
        return Ok(());
    };
    let source = local_path(&uri)?;
    usable(&source).await?;
    let copy = keep_copy(&name, &source)?;
    remember(|custom| {
        custom.insert(name, copy);
    })
}

fn is_audio(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .is_some_and(|extension| EXTENSIONS.contains(&extension.to_ascii_lowercase().as_str()))
}

fn named_files(folder: &Path, names: &[String]) -> Vec<(String, PathBuf)> {
    let mut found = HashMap::new();
    for folder in [folder.to_owned(), folder.join(THEME_FOLDER)] {
        for path in fs::read_dir(folder).into_iter().flatten().flatten() {
            let path = path.path();
            let stem = path.file_stem().and_then(|stem| stem.to_str());
            if let Some(name) =
                stem.filter(|stem| is_audio(&path) && names.iter().any(|name| name == stem))
            {
                found.entry(name.to_owned()).or_insert(path);
            }
        }
    }
    found.into_iter().collect()
}

pub async fn choose_set(Sounds { names }: Sounds) -> Result<Option<SoundSet>, String> {
    let title = t!(L10N, "desktop-sound-set-choose-title");
    let chooser = FileChooser {
        title: &title,
        directory: true,
        ..FileChooser::default()
    };
    let Some(uri) = chooser.open().await?.into_iter().next() else {
        return Ok(None);
    };
    let found = named_files(&local_path(&uri)?, &names);
    if found.is_empty() {
        return Err(t!(L10N, "desktop-sound-set-empty"));
    }
    let mut usable_files = Vec::new();
    let mut skipped = Vec::new();
    for (name, path) in found {
        match usable(&path).await {
            Ok(()) => usable_files.push((name, path)),
            Err(_) => skipped.push(file_name(&path)),
        }
    }
    if usable_files.is_empty() {
        return Err(t!(L10N, "desktop-sound-set-unusable"));
    }
    remove_folder(&store()).map_err(failed)?;
    let mut copies = HashMap::new();
    for (name, path) in &usable_files {
        copies.insert(name.clone(), keep_copy(name, path)?);
    }
    remember(|custom| *custom = copies)?;
    skipped.sort();
    Ok(Some(SoundSet {
        used: usable_files.len() as u32,
        skipped,
    }))
}

pub fn reset(Sound { name }: Sound) -> Result<(), String> {
    remember(|custom| {
        custom.remove(&name);
    })?;
    remove_folder(&store().join(&name)).map_err(failed)
}

pub fn reset_all(Empty {}: Empty) -> Result<(), String> {
    remember(HashMap::clear)?;
    remove_folder(&store()).map_err(failed)
}
