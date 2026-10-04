use std::fs;
use std::path::{Path, PathBuf};

use luft_app::fonts;
use serde::Serialize;

use super::data::FontData;
use super::faces::{self, Identity};

const MAX_SUFFIX: u32 = 100;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Status {
    Missing,
    System,
    User,
}

fn matches(identity: &Identity, face: &fonts::Face) -> bool {
    match &identity.postscript {
        Some(postscript) if !face.postscript.is_empty() => *postscript == face.postscript,
        _ => {
            identity.family.eq_ignore_ascii_case(&face.family)
                && identity.style.eq_ignore_ascii_case(&face.style)
        }
    }
}

fn installed_copies(path: &Path) -> Result<Option<Vec<PathBuf>>, String> {
    let data = FontData::read(path)?;
    let identity = faces::identities(&data.bytes)?.swap_remove(0);
    let mut copies: Vec<PathBuf> = fonts::installed()?
        .into_iter()
        .filter(|face| matches(&identity, face))
        .map(|face| face.file)
        .collect();
    copies.sort();
    copies.dedup();
    Ok((!copies.is_empty() || fonts::belongs_to_user(path)).then_some(copies))
}

fn user_copies(path: &Path, copies: Vec<PathBuf>) -> Vec<PathBuf> {
    let mut owned: Vec<PathBuf> = copies
        .into_iter()
        .filter(|file| fonts::belongs_to_user(file))
        .collect();
    if fonts::belongs_to_user(path) && !owned.iter().any(|file| file == path) {
        owned.push(path.to_path_buf());
    }
    owned
}

pub fn status(path: &Path) -> Result<Status, String> {
    let Some(copies) = installed_copies(path)? else {
        return Ok(Status::Missing);
    };
    Ok(if user_copies(path, copies).is_empty() {
        Status::System
    } else {
        Status::User
    })
}

fn target(folder: &Path, stem: &str, extension: &str, bytes: &[u8]) -> Result<PathBuf, String> {
    std::iter::once(format!("{stem}.{extension}"))
        .chain((2..=MAX_SUFFIX).map(|number| format!("{stem}-{number}.{extension}")))
        .map(|name| folder.join(name))
        .find(|candidate| fs::read(candidate).map_or(true, |existing| existing == bytes))
        .ok_or_else(|| "There's no free name for this font in your fonts folder".into())
}

pub fn install(path: &Path) -> Result<Status, String> {
    let data = FontData::read(path)?;
    let folder = fonts::user_folder()?;
    fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let stem = path
        .file_stem()
        .map(|stem| stem.to_string_lossy().trim_start_matches('.').to_owned())
        .filter(|stem| !stem.is_empty())
        .unwrap_or_else(|| "font".to_owned());
    let target = target(&folder, &stem, data.extension(), &data.bytes)?;
    fs::write(&target, &data.bytes).map_err(|error| error.to_string())?;
    fonts::refresh()?;
    status(path)
}

pub fn use_as(path: &Path, role: fonts::Role) -> Result<Status, String> {
    let status = match status(path)? {
        Status::Missing => install(path)?,
        installed => installed,
    };
    let data = FontData::read(path)?;
    let identity = faces::identities(&data.bytes)?.swap_remove(0);
    let family = fonts::installed()?
        .into_iter()
        .find(|face| matches(&identity, face))
        .map(|face| face.family)
        .ok_or("The font couldn't be found after installing it")?;
    fonts::use_family(role, &family)?;
    Ok(status)
}

pub fn remove(path: &Path) -> Result<Status, String> {
    let copies = installed_copies(path)?.unwrap_or_default();
    fonts::remove(&user_copies(path, copies))?;
    if path.exists() {
        status(path)
    } else {
        Ok(Status::Missing)
    }
}
