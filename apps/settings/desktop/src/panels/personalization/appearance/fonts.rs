use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

use gio::prelude::*;
use luft_app::fonts::{self, Defaults, Face, Role};
use luft_app::{Empty, launch};
use luft_i18n::t;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::L10N;

const MAGPIE: &str = "com.lantharos.magpie.desktop";
const REGULAR_STYLES: [&str; 4] = ["regular", "book", "normal", "roman"];

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Family {
    name: String,
    styles: usize,
    monospace: bool,
    file: String,
    removable: bool,
}

#[derive(Deserialize, Type)]
pub struct Open {
    file: String,
    token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct Remove {
    family: String,
}

#[derive(Deserialize, Type)]
pub struct Use {
    role: Role,
    family: String,
}

#[derive(Deserialize, Type)]
pub struct Reset {
    role: Role,
}

fn is_regular(face: &Face) -> bool {
    face.face == 0 && REGULAR_STYLES.contains(&face.style.to_ascii_lowercase().as_str())
}

fn family(name: String, faces: &[Face], user_files: &HashSet<PathBuf>) -> Family {
    let shown = faces
        .iter()
        .find(|face| is_regular(face))
        .unwrap_or(&faces[0]);
    let styles: HashSet<&str> = faces
        .iter()
        .map(|face| face.style.as_str())
        .filter(|style| !style.is_empty())
        .collect();
    Family {
        name,
        styles: styles.len().max(1),
        monospace: fonts::is_monospaced(&shown.file, shown.face),
        file: shown.file.to_string_lossy().into_owned(),
        removable: faces.iter().any(|face| user_files.contains(&face.file)),
    }
}

fn user_files(faces: &[Face]) -> HashSet<PathBuf> {
    let files: HashSet<&PathBuf> = faces.iter().map(|face| &face.file).collect();
    files
        .into_iter()
        .filter(|file| fonts::belongs_to_user(file))
        .cloned()
        .collect()
}

pub fn list(Empty {}: Empty) -> Result<Vec<Family>, String> {
    let faces = fonts::installed()?;
    let user_files = user_files(&faces);
    let mut grouped: HashMap<String, Vec<Face>> = HashMap::new();
    for face in faces {
        grouped.entry(face.family.clone()).or_default().push(face);
    }
    let mut families: Vec<Family> = grouped
        .into_iter()
        .map(|(name, faces)| family(name, &faces, &user_files))
        .collect();
    families.sort_by_cached_key(|family| family.name.to_lowercase());
    Ok(families)
}

pub fn open(Open { file, token }: Open) -> Result<(), String> {
    let magpie = gio_unix::DesktopAppInfo::new(MAGPIE)
        .ok_or_else(|| t!(L10N, "desktop-fonts-magpie-missing"))?;
    launch::open_files(
        magpie.upcast_ref(),
        &[gio::File::for_path(file)],
        token.as_deref(),
    )
    .map_err(|error| error.to_string())
}

pub fn remove(Remove { family }: Remove) -> Result<(), String> {
    let faces = fonts::installed()?;
    let files: HashSet<PathBuf> = faces
        .into_iter()
        .filter(|face| face.family == family)
        .map(|face| face.file)
        .filter(|file| fonts::belongs_to_user(file))
        .collect();
    fonts::remove(&files.into_iter().collect::<Vec<_>>())
}

pub fn defaults(Empty {}: Empty) -> Result<Defaults, String> {
    Ok(fonts::defaults())
}

pub fn use_family(Use { role, family }: Use) -> Result<(), String> {
    fonts::use_family(role, &family)
}

pub fn reset(Reset { role }: Reset) -> Result<(), String> {
    fonts::reset(role);
    Ok(())
}
