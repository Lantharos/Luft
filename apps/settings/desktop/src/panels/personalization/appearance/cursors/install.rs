use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;

use super::archive::{self, Format};
use super::download::download;
use super::installed::{UserThemes, only_cursors};
use super::{store, themes};

const MAX_SEARCH_DEPTH: usize = 6;

#[derive(Serialize)]
#[serde(tag = "state", rename_all = "camelCase")]
pub enum Progress {
    Downloading { received: u64, total: Option<u64> },
    Installing,
    Installed { themes: Vec<String> },
    Failed { error: String },
}

struct Staging(PathBuf);

impl Drop for Staging {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn find_themes(dir: &Path, depth: usize, found: &mut Vec<PathBuf>) {
    if themes::is_theme(dir) {
        if dir.join("index.theme").is_file() && only_cursors(dir) {
            found.push(dir.to_path_buf());
        }
        return;
    }
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    if depth == MAX_SEARCH_DEPTH {
        return;
    }
    for entry in entries.flatten() {
        if entry.file_type().is_ok_and(|kind| kind.is_dir()) {
            find_themes(&entry.path(), depth + 1, found);
        }
    }
}

fn stem(file_name: &str) -> String {
    let lowered = file_name.to_ascii_lowercase();
    [
        ".tar.gz", ".tar.bz2", ".tar.xz", ".tgz", ".tbz2", ".tbz", ".txz", ".tar", ".zip",
    ]
    .iter()
    .find(|suffix| lowered.ends_with(*suffix))
    .map(|suffix| file_name[..file_name.len() - suffix.len()].to_string())
    .unwrap_or_else(|| file_name.to_string())
}

fn staging(user: &UserThemes, label: &str) -> Result<Staging, String> {
    let staging = Staging(user.icons().join(format!(".install-{label}")));
    let _ = fs::remove_dir_all(&staging.0);
    fs::create_dir_all(&staging.0).map_err(failed)?;
    Ok(staging)
}

fn unpack_themes(
    user: &UserThemes,
    format: Format,
    archive_path: &Path,
    file_name: &str,
    staging: &Path,
) -> Result<Vec<String>, String> {
    let unpacked = staging.join("files");
    archive::unpack(format, archive_path, &unpacked)?;
    let mut found = Vec::new();
    find_themes(&unpacked, 0, &mut found);
    if found.is_empty() {
        return Err("This download doesn't include a cursor theme for Linux".into());
    }
    found
        .iter()
        .map(|theme| {
            let wanted = if theme == &unpacked {
                stem(file_name)
            } else {
                theme
                    .file_name()
                    .ok_or("This theme has no name")?
                    .to_string_lossy()
                    .into_owned()
            };
            user.adopt(theme, &wanted)
        })
        .collect()
}

pub fn install(id: u64, file: u32, report: &impl Fn(Progress)) -> Result<Vec<String>, String> {
    let (link, file_name) = store::download_link(id, file)?;
    let format =
        Format::of(&file_name).ok_or("This download isn't an archive Settings can open")?;
    let user = UserThemes::new()?;
    let staging = staging(&user, &format!("{id}-{file}"))?;
    let archive_path = staging.0.join("download");
    download(&link, &archive_path, report)?;
    report(Progress::Installing);
    unpack_themes(&user, format, &archive_path, &file_name, &staging.0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::panels::personalization::appearance::cursors::archive::Codec;

    fn write(path: &Path, contents: &str) {
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(path, contents).unwrap();
    }

    fn archive_of(files: &[(&str, &str)], into: &Path) {
        let mut builder = tar::Builder::new(fs::File::create(into).unwrap());
        for (path, contents) in files {
            let mut header = tar::Header::new_gnu();
            header.set_size(contents.len() as u64);
            header.set_mode(0o644);
            builder
                .append_data(&mut header, path, contents.as_bytes())
                .unwrap();
        }
        builder.finish().unwrap();
    }

    #[test]
    fn a_cursor_archive_named_like_an_icon_theme_leaves_the_icons_alone() {
        let scratch = tempfile::tempdir().unwrap();
        let icons = scratch.path().join("data/icons");
        let app_icon = icons.join("hicolor/48x48/apps/com.example.app.png");
        write(&app_icon, "png");
        write(
            &icons.join("hicolor/index.theme"),
            "[Icon Theme]\nName=Hicolor\nDirectories=48x48/apps\n",
        );
        let user = UserThemes::at(icons.clone(), Vec::new());
        let archive_path = scratch.path().join("download.tar");
        archive_of(
            &[
                ("hicolor/index.theme", "[Icon Theme]\nName=Sneaky\n"),
                ("hicolor/cursors/left_ptr", "Xcur"),
                ("Mixed/index.theme", "[Icon Theme]\nName=Mixed\n"),
                ("Mixed/cursors/left_ptr", "Xcur"),
                ("Mixed/48x48/apps/other.png", "png"),
            ],
            &archive_path,
        );

        let staging = staging(&user, "check").unwrap();
        let installed = unpack_themes(
            &user,
            Format::Tar(Codec::Plain),
            &archive_path,
            "hicolor.tar",
            &staging.0,
        )
        .unwrap();

        assert_eq!(installed, ["hicolor-2"]);
        assert!(app_icon.is_file());
        assert!(icons.join("hicolor-2/cursors/left_ptr").is_file());
        assert!(!icons.join("Mixed").exists());
        assert!(user.remove("hicolor").is_err());
        assert!(app_icon.is_file());
        user.remove("hicolor-2").unwrap();
        assert!(!icons.join("hicolor-2").exists());
    }

    #[test]
    fn only_folders_holding_nothing_but_cursors_can_be_removed() {
        let scratch = tempfile::tempdir().unwrap();
        let icons = scratch.path().join("icons");
        write(
            &icons.join("WhiteSur-cursors/index.theme"),
            "[Icon Theme]\nName=WhiteSur\n",
        );
        write(&icons.join("WhiteSur-cursors/cursors/left_ptr"), "Xcur");
        let mixed_icon = icons.join("Papirus/48x48/apps/app.png");
        write(&icons.join("Papirus/cursors/left_ptr"), "Xcur");
        write(&mixed_icon, "png");
        let listed_icon = icons.join("Listed/cursors/left_ptr");
        write(&listed_icon, "Xcur");
        write(
            &icons.join("Listed/index.theme"),
            "[Icon Theme]\nName=Listed\nDirectories=scalable/apps\n",
        );
        let user = UserThemes::at(icons.clone(), Vec::new());

        assert!(user.remove("Papirus").is_err());
        assert!(user.remove("Listed").is_err());
        assert!(user.remove("../icons").is_err());
        assert!(mixed_icon.is_file() && listed_icon.is_file());
        user.remove("WhiteSur-cursors").unwrap();
        assert!(!icons.join("WhiteSur-cursors").exists());
    }
}
