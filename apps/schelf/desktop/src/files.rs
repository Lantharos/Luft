use std::collections::HashMap;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::{Path, PathBuf};
use std::process::Command;

use gio::prelude::*;
use luft_app::Commands;
use luft_app::portal::{FileChooser, Filter};
use luft_software::appimage;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};

use crate::catalog::cache;

#[derive(Serialize)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
enum Opened {
    FlatpakRef {
        path: String,
        id: String,
        title: String,
        branch: Option<String>,
        url: String,
        runtime: bool,
        summary: Option<String>,
        homepage: Option<String>,
        icon: Option<String>,
    },
    FlatpakRepo {
        path: String,
        name: String,
        title: String,
        url: String,
        summary: Option<String>,
        homepage: Option<String>,
    },
    Package {
        path: String,
        package: String,
        version: String,
        summary: String,
        description: String,
        license: String,
        homepage: Option<String>,
        size: u64,
        installed: bool,
    },
    AppImage {
        path: String,
        name: String,
        summary: Option<String>,
        version: Option<String>,
        icon: Option<String>,
        size: u64,
    },
}

#[derive(Deserialize)]
struct File {
    path: String,
}

fn keyfile(path: &Path, group: &str) -> Result<HashMap<String, String>, String> {
    let text = std::fs::read_to_string(path).map_err(|error| error.to_string())?;
    let header = format!("[{group}]");
    Ok(text
        .lines()
        .map(str::trim)
        .skip_while(|line| *line != header)
        .skip(1)
        .take_while(|line| !line.starts_with('['))
        .filter_map(|line| line.split_once('='))
        .map(|(key, value)| (key.trim().to_owned(), value.trim().to_owned()))
        .collect())
}

fn flatpak_ref(path: &str) -> Result<Opened, String> {
    let values = keyfile(Path::new(path), "Flatpak Ref")?;
    let id = values
        .get("Name")
        .cloned()
        .ok_or("This file doesn't name an app.")?;
    Ok(Opened::FlatpakRef {
        path: path.to_owned(),
        title: values.get("Title").cloned().unwrap_or_else(|| id.clone()),
        branch: values.get("Branch").cloned(),
        url: values.get("Url").cloned().unwrap_or_default(),
        runtime: values.get("IsRuntime").is_some_and(|value| value == "true"),
        summary: values.get("Comment").cloned(),
        homepage: values.get("Homepage").cloned(),
        icon: values.get("Icon").cloned(),
        id,
    })
}

fn flatpak_repo(path: &str) -> Result<Opened, String> {
    let values = keyfile(Path::new(path), "Flatpak Repo")?;
    let url = values
        .get("Url")
        .cloned()
        .ok_or("This file doesn't name a source.")?;
    let name = Path::new(path)
        .file_stem()
        .map(|stem| stem.to_string_lossy().to_lowercase())
        .unwrap_or_else(|| "source".into());
    Ok(Opened::FlatpakRepo {
        path: path.to_owned(),
        title: values.get("Title").cloned().unwrap_or_else(|| name.clone()),
        name: name
            .chars()
            .filter(|character| character.is_ascii_alphanumeric() || *character == '-')
            .collect(),
        url,
        summary: values.get("Comment").cloned(),
        homepage: values.get("Homepage").cloned(),
    })
}

fn package(path: &str) -> Result<Opened, String> {
    let output = Command::new("rpm")
        .args(["--query", "--package", "--queryformat"])
        .arg("%{NAME}\x1f%{VERSION}-%{RELEASE}\x1f%{SUMMARY}\x1f%{LICENSE}\x1f%{URL}\x1f%{SIZE}\x1f%{DESCRIPTION}")
        .arg(path)
        .output()
        .map_err(|error| error.to_string())?;
    let text = String::from_utf8_lossy(&output.stdout);
    let [name, version, summary, license, url, size, description] =
        text.split('\x1f').collect::<Vec<_>>()[..]
    else {
        return Err("This package file is damaged or isn't meant for this computer.".into());
    };
    let installed = Command::new("rpm")
        .args(["--query", name])
        .output()
        .is_ok_and(|output| output.status.success());
    Ok(Opened::Package {
        path: path.to_owned(),
        package: name.to_owned(),
        version: version.to_owned(),
        summary: summary.to_owned(),
        description: description.trim().to_owned(),
        license: license.to_owned(),
        homepage: (url != "(none)").then(|| url.to_owned()),
        size: size.parse().unwrap_or(0),
        installed,
    })
}

fn appimage_file(path: &str) -> Result<Opened, String> {
    let bundle = appimage::inspect(Path::new(path))?;
    let icon = bundle.icon.as_ref().and_then(|icon| {
        let mut hasher = DefaultHasher::new();
        icon.bytes.hash(&mut hasher);
        let folder = cache::folder().join("opened");
        let file: PathBuf = folder.join(format!("{:x}.{}", hasher.finish(), icon.extension));
        std::fs::create_dir_all(&folder).ok()?;
        std::fs::write(&file, &icon.bytes).ok()?;
        Some(file.to_string_lossy().into_owned())
    });
    Ok(Opened::AppImage {
        path: path.to_owned(),
        name: bundle.entry.get("Name").unwrap_or("AppImage").to_owned(),
        summary: bundle.entry.get("Comment").map(str::to_owned),
        version: bundle.entry.get("X-AppImage-Version").map(str::to_owned),
        size: Path::new(path)
            .metadata()
            .map(|metadata| metadata.len())
            .unwrap_or(0),
        icon,
    })
}

fn inspect(File { path }: File) -> Result<Opened, String> {
    let lowered = path.to_lowercase();
    if lowered.ends_with(".flatpakref") {
        flatpak_ref(&path)
    } else if lowered.ends_with(".flatpakrepo") {
        flatpak_repo(&path)
    } else if lowered.ends_with(".rpm") {
        package(&path)
    } else if appimage::is_appimage(Path::new(&path)) {
        appimage_file(&path)
    } else {
        Err("Schelf can't install this kind of file.".into())
    }
}

fn choose(_: serde_json::Value) -> Result<Option<String>, String> {
    let chosen = FileChooser {
        title: "Add an AppImage",
        filters: vec![Filter {
            name: "AppImages",
            patterns: vec!["*.AppImage".into(), "*.appimage".into()],
        }],
        ..FileChooser::default()
    }
    .open()?;
    Ok(chosen
        .first()
        .and_then(|uri| gio::File::for_uri(uri).path())
        .map(|path| path.to_string_lossy().into_owned()))
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("files_inspect", inspect)
        .command("files_choose_appimage", choose)
}
