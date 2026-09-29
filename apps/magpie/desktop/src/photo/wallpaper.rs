use std::fs;
use std::path::{Path, PathBuf};

use gio::prelude::*;
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Style {
    Light,
    Dark,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn library_copy(source: &Path) -> Result<PathBuf, String> {
    let folder = dirs::picture_dir()
        .ok_or("There is no Pictures folder")?
        .join("Wallpapers");
    if source.parent() == Some(folder.as_path()) {
        return Ok(source.to_path_buf());
    }
    fs::create_dir_all(&folder).map_err(failed)?;
    let name = source.file_name().ok_or("This file has no name")?;
    let size = fs::metadata(source).map_err(failed)?.len();
    let stem = source.file_stem().unwrap_or(name).to_string_lossy();
    let extension = source
        .extension()
        .map(|extension| format!(".{}", extension.to_string_lossy()))
        .unwrap_or_default();
    let mut target = folder.join(name);
    for copy in 2.. {
        match fs::metadata(&target) {
            Ok(existing) if existing.len() == size => return Ok(target),
            Ok(_) => target = folder.join(format!("{stem} ({copy}){extension}")),
            Err(_) => break,
        }
    }
    fs::copy(source, &target).map_err(failed)?;
    Ok(target)
}

pub fn set_wallpaper(source: &Path) -> Result<Style, String> {
    let target = library_copy(source)?;
    let uri = gio::File::for_path(&target).uri();
    let dark =
        gio::Settings::new("org.gnome.desktop.interface").string("color-scheme") == "prefer-dark";
    let key = if dark {
        "picture-uri-dark"
    } else {
        "picture-uri"
    };
    gio::Settings::new("org.gnome.desktop.background")
        .set_string(key, &uri)
        .map_err(failed)?;
    gio::Settings::sync();
    Ok(if dark { Style::Dark } else { Style::Light })
}
