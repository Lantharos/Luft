pub mod appstream;
pub mod config;
pub mod extension;
pub mod files;
pub mod git;
pub mod permissions;
pub mod sabine;
pub mod source;

use std::path::{Path, PathBuf};
use std::sync::LazyLock;

use regex::Regex;
use serde_json::Value;

use crate::error::Result;
use crate::schema::listing::SUMMARY_LIMIT;
use appstream::{Component, parse_metainfo};
use extension::{ExtensionManifest, read_extension};
use files::{find_files, read_optional, read_quietly};
use git::{Repository, github_repository};
use sabine::{SabineApp, read_sabine};

/// An app framework whose updater Schelf serves feeds for.
#[derive(Clone, Debug, PartialEq)]
pub struct Framework {
    pub updater: &'static str,
    pub evidence: &'static str,
    pub id: Option<String>,
}

pub struct Appstream {
    pub path: String,
    pub component: Component,
}

/// What a repository holds, as far as publishing it goes.
pub struct Project {
    pub root: PathBuf,
    pub kind: &'static str,
    pub format: &'static str,
    pub id: Option<String>,
    pub name: Option<String>,
    pub summary: Option<String>,
    pub licence: Option<String>,
    pub icon: Option<String>,
    pub sabine: Option<SabineApp>,
    pub extension: Option<ExtensionManifest>,
    pub appstream: Option<Appstream>,
    pub framework: Option<Framework>,
    pub repository: Option<Repository>,
    pub found: Vec<String>,
}

const APPIMAGE_CONFIGS: [&str; 4] = [
    "AppImageBuilder.yml",
    "appimage-builder.yml",
    "electron-builder.yml",
    "electron-builder.json",
];
static APPIMAGE_TOOLS: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r#"(?i)appimagetool|linuxdeploy|appimage-builder|\.AppImage\b|"AppImage"|\bappimage\b"#,
    )
    .unwrap()
});
static LICENCE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r#"(?m)^license\s*=\s*"([^"]+)""#).unwrap());

fn metainfo_name(name: &str) -> bool {
    name.ends_with(".metainfo.xml") || name.ends_with(".appdata.xml")
}

pub fn bare_id(id: &str) -> &str {
    id.strip_suffix(".desktop").unwrap_or(id)
}

fn find_metainfo(root: &Path, id: Option<&str>) -> Option<Appstream> {
    let components: Vec<Appstream> = find_files(root, metainfo_name)
        .into_iter()
        .filter_map(|path| {
            let component = parse_metainfo(&read_quietly(&root.join(&path))?).ok()?;
            Some(Appstream { path, component })
        })
        .collect();
    let wanted = components
        .iter()
        .position(|entry| id.is_some_and(|id| bare_id(&entry.component.id) == id))
        .unwrap_or(0);
    components.into_iter().nth(wanted)
}

fn find_appimage_build(root: &Path) -> Result<Option<String>> {
    for config in APPIMAGE_CONFIGS {
        if let Some(text) = read_optional(&root.join(config))?
            && (config.starts_with("AppImage")
                || config.starts_with("appimage")
                || APPIMAGE_TOOLS.is_match(&text))
        {
            return Ok(Some(config.to_owned()));
        }
    }
    let workflows = root.join(".github").join("workflows");
    for workflow in find_files(&workflows, |name| {
        name.ends_with(".yml") || name.ends_with(".yaml")
    }) {
        if read_quietly(&workflows.join(&workflow))
            .is_some_and(|text| APPIMAGE_TOOLS.is_match(&text))
        {
            return Ok(Some(format!(".github/workflows/{workflow}")));
        }
    }
    let tauri = read_optional(&root.join("src-tauri").join("tauri.conf.json"))?;
    Ok(tauri
        .filter(|text| text.to_lowercase().contains("appimage"))
        .map(|_| "src-tauri/tauri.conf.json".to_owned()))
}

fn json(text: &str) -> Result<Value> {
    serde_json::from_str(text).map_err(|error| crate::error::Error::Other(error.to_string()))
}

fn find_framework(root: &Path) -> Result<Option<Framework>> {
    if let Some(tauri) = read_optional(&root.join("src-tauri").join("tauri.conf.json"))? {
        return Ok(Some(Framework {
            updater: "tauri",
            evidence: "src-tauri/tauri.conf.json",
            id: json(&tauri)?["identifier"].as_str().map(str::to_owned),
        }));
    }
    let Some(package) = read_optional(&root.join("package.json"))? else {
        return Ok(None);
    };
    let manifest = json(&package)?;
    let electron = ["dependencies", "devDependencies"]
        .iter()
        .any(|key| manifest[key].get("electron").is_some());
    Ok(electron.then(|| Framework {
        updater: "electron",
        evidence: "package.json",
        id: manifest["build"]["appId"].as_str().map(str::to_owned),
    }))
}

fn find_licence(root: &Path, component: Option<&Component>) -> Result<Option<String>> {
    if let Some(licence) = component.and_then(|component| component.project_license.clone()) {
        return Ok(Some(licence));
    }
    if let Some(package) = read_optional(&root.join("package.json"))?
        && let Some(licence) = json(&package)?["license"]
            .as_str()
            .filter(|licence| !licence.is_empty())
    {
        return Ok(Some(licence.to_owned()));
    }
    Ok(read_optional(&root.join("Cargo.toml"))?
        .and_then(|cargo| LICENCE.captures(&cargo).map(|found| found[1].to_owned())))
}

fn find_icon(
    root: &Path,
    id: Option<&str>,
    sabine: Option<&SabineApp>,
    component: Option<&Component>,
) -> Option<String> {
    if let Some(icon) = sabine.and_then(|sabine| sabine.icon.clone()) {
        return Some(icon);
    }
    let declared = component.and_then(|component| {
        component
            .icons
            .iter()
            .find(|icon| icon.kind == "remote")
            .or(component.icons.first())
    });
    if let Some(icon) = declared {
        return Some(icon.value.clone());
    }
    let id = id?;
    find_files(root, |name| {
        name == format!("{id}.svg") || name == format!("{id}.png")
    })
    .into_iter()
    .next()
}

/// Reads what kind of project `root` holds and what it says about itself.
pub fn detect_project(root: &Path) -> Result<Project> {
    let sabine = read_optional(&root.join("Sabine.toml"))?
        .map(|text| read_sabine(&text))
        .transpose()?;
    let extension = read_optional(&root.join("extension.toml"))?
        .map(|text| read_extension(&text))
        .transpose()?;
    let repository = github_repository(root);
    let mut found = Vec::new();
    if sabine.is_some() {
        found.push("Sabine.toml".to_owned());
    }
    if extension.is_some() {
        found.push("extension.toml".to_owned());
    }
    let own_id = sabine
        .as_ref()
        .map(|sabine| sabine.id.as_str())
        .or(extension.as_ref().map(|extension| extension.id.as_str()));
    let appstream = find_metainfo(root, own_id);
    if let Some(appstream) = &appstream {
        found.push(appstream.path.clone());
    }
    let framework = if sabine.is_some() || extension.is_some() {
        None
    } else {
        find_framework(root)?
    };
    if let Some(framework) = &framework {
        found.push(framework.evidence.to_owned());
    }
    let appimage = if sabine.is_some() || extension.is_some() || framework.is_some() {
        None
    } else {
        find_appimage_build(root)?
    };
    if let Some(evidence) = &appimage {
        found.push(evidence.clone());
    }
    let format = if extension.is_some() {
        "luft-extension"
    } else if sabine.is_some() {
        "sabine"
    } else if framework.is_some() || appimage.is_none() {
        "files"
    } else {
        "appimage"
    };
    let component = appstream.as_ref().map(|entry| &entry.component);
    let id = extension
        .as_ref()
        .map(|extension| extension.id.clone())
        .or(sabine.as_ref().map(|sabine| sabine.id.clone()))
        .or(component.map(|component| bare_id(&component.id).to_owned()))
        .or(framework
            .as_ref()
            .and_then(|framework| framework.id.clone()));
    let fitting = sabine
        .as_ref()
        .and_then(|sabine| sabine.description.clone())
        .filter(|description| description.encode_utf16().count() <= SUMMARY_LIMIT);
    Ok(Project {
        kind: if extension.is_some() {
            "extension"
        } else {
            "app"
        },
        format,
        name: extension
            .as_ref()
            .map(|extension| extension.name.clone())
            .or(sabine.as_ref().map(|sabine| sabine.name.clone()))
            .or(component.and_then(|component| component.name.clone())),
        summary: extension
            .as_ref()
            .and_then(|extension| extension.summary.clone())
            .or(component.and_then(|component| component.summary.clone()))
            .or(fitting),
        licence: find_licence(root, component)?,
        icon: find_icon(root, id.as_deref(), sabine.as_ref(), component),
        root: root.to_path_buf(),
        id,
        sabine,
        extension,
        appstream,
        framework,
        repository,
        found,
    })
}

#[cfg(test)]
mod tests;
