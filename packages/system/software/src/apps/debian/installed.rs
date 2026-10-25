use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use super::container;

const FOLDER: &str = "luft";
const FILE: &str = "debian.json";

/// An app installed from a `.deb` file into the Ubuntu container.
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DebApp {
    pub package: String,
    pub name: String,
    pub version: String,
    pub summary: String,
    pub size: u64,
    pub desktop: Vec<String>,
    pub icon: Option<String>,
    /// The menu entries and icons it put in the home folder
    pub files: Vec<String>,
}

fn file() -> Option<PathBuf> {
    Some(dirs::data_dir()?.join(FOLDER).join(FILE))
}

pub fn recorded() -> Vec<DebApp> {
    file()
        .and_then(|file| std::fs::read_to_string(file).ok())
        .and_then(|text| serde_json::from_str(&text).ok())
        .unwrap_or_default()
}

pub fn save(apps: &[DebApp]) -> Result<(), String> {
    let file = file().ok_or("There's no home folder to keep the list of apps in.")?;
    if let Some(folder) = file.parent() {
        std::fs::create_dir_all(folder).map_err(|error| error.to_string())?;
    }
    let text = serde_json::to_string_pretty(apps).map_err(|error| error.to_string())?;
    std::fs::write(file, text).map_err(|error| error.to_string())
}

pub fn installed() -> Vec<DebApp> {
    let apps = recorded();
    if apps.is_empty() || !container::exists() {
        return Vec::new();
    }
    apps
}

pub struct Details {
    pub version: String,
    pub size: u64,
    pub summary: String,
}

pub fn details(package: &str) -> Result<Details, String> {
    let text = container::query(&[
        "dpkg-query",
        "--show",
        "--showformat",
        "${Version}\\t${Installed-Size}\\t${binary:Summary}",
        "--",
        package,
    ])?;
    let mut fields = text.splitn(3, '\t');
    let mut field = || fields.next().unwrap_or_default().trim().to_owned();
    Ok(Details {
        version: field(),
        size: field().parse::<u64>().unwrap_or(0) * 1024,
        summary: field(),
    })
}
