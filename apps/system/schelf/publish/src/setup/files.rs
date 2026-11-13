use std::path::Path;
use std::sync::LazyLock;

use regex::Regex;
use serde::Deserialize;

use super::workflow::{
    SABINE_REPOSITORY, SCHELF_SABINE_VERSION, SCHELF_WORKFLOW, SetupInput, schelf_toml_for,
    workflow_for,
};
use crate::api::http::{Body, request};
use crate::error::Result;
use crate::project::files::{find_files, read_optional};
use crate::project::sabine::follow_schelf_updates;
use crate::schema::versions::compare_versions;

static RELEASE_APP: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)Lantharos/Sabine/\.github/workflows/release-app\.yml@(v[\d.]+)?").unwrap()
});
static CARGO_PIN: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)Lantharos/Sabine(?:\.git)?"[^}\n]*\btag\s*=\s*"(v[\d.]+)""#).unwrap()
});
static PACKAGE_PIN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?i)Lantharos/Sabine#(v[\d.]+)").unwrap());
static CARRIED_INPUTS: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"(?m)^\s+(rust_toolchain|upgrade_from_sabine_version|linux_packages|platforms):\s*(.+)$",
    )
    .unwrap()
});

fn newest(versions: Vec<String>) -> String {
    versions
        .into_iter()
        .reduce(|left, right| {
            if compare_versions(&left, &right).is_ge() {
                left
            } else {
                right
            }
        })
        .unwrap_or_else(|| SCHELF_SABINE_VERSION.to_owned())
}

struct Workflow {
    path: String,
    text: String,
}

fn sabine_workflows(root: &Path) -> Vec<Workflow> {
    let folder = root.join(".github").join("workflows");
    let Ok(entries) = std::fs::read_dir(&folder) else {
        return Vec::new();
    };
    let mut workflows: Vec<Workflow> = entries
        .flatten()
        .map(|entry| {
            let name = entry.file_name().to_string_lossy().into_owned();
            Workflow {
                text: std::fs::read_to_string(entry.path()).unwrap_or_default(),
                path: format!(".github/workflows/{name}"),
            }
        })
        .filter(|workflow| RELEASE_APP.is_match(&workflow.text))
        .collect();
    workflows.sort_by(|left, right| left.path.cmp(&right.path));
    workflows
}

fn pinned_versions(root: &Path) -> Result<Vec<String>> {
    let mut versions: Vec<String> = sabine_workflows(root)
        .iter()
        .filter_map(|workflow| {
            Some(
                RELEASE_APP
                    .captures(&workflow.text)?
                    .get(1)?
                    .as_str()
                    .to_owned(),
            )
        })
        .collect();
    for path in find_files(root, |name| name == "Cargo.toml") {
        if let Some(found) = read_optional(&root.join(path))?
            .and_then(|text| CARGO_PIN.captures(&text).map(|found| found[1].to_owned()))
        {
            versions.push(found);
        }
    }
    if let Some(found) = read_optional(&root.join("package.json"))?
        .and_then(|text| PACKAGE_PIN.captures(&text).map(|found| found[1].to_owned()))
    {
        versions.push(found);
    }
    Ok(versions)
}

#[derive(Deserialize)]
struct SabineRelease {
    tag_name: String,
    draft: bool,
    prerelease: bool,
}

/// The Sabine the project builds with, or the newest published one.
pub fn sabine_version(root: &Path) -> Result<String> {
    let mut pinned = pinned_versions(root)?;
    if !pinned.is_empty() {
        pinned.push(SCHELF_SABINE_VERSION.to_owned());
        return Ok(newest(pinned));
    }
    let releases: Vec<SabineRelease> = request(
        "GET",
        &format!("https://api.github.com/repos/{SABINE_REPOSITORY}/releases?per_page=100"),
        None,
        Body::Empty,
    )?;
    let mut published: Vec<String> = releases
        .into_iter()
        .filter(|release| !release.draft && !release.prerelease)
        .map(|release| release.tag_name)
        .collect();
    published.push(SCHELF_SABINE_VERSION.to_owned());
    Ok(newest(published))
}

/// The build settings of the Sabine workflows the new one replaces.
pub fn sabine_inputs(root: &Path) -> Option<Vec<(String, String)>> {
    let mut inputs: Vec<(String, String)> = Vec::new();
    for workflow in sabine_workflows(root) {
        for found in CARRIED_INPUTS.captures_iter(&workflow.text) {
            let (name, value) = (found[1].to_owned(), found[2].to_owned());
            match inputs.iter_mut().find(|(known, _)| *known == name) {
                Some(known) => known.1 = value,
                None => inputs.push((name, value)),
            }
        }
    }
    (!inputs.is_empty()).then_some(inputs)
}

pub fn replaced_workflows(root: &Path) -> Vec<String> {
    sabine_workflows(root)
        .into_iter()
        .map(|workflow| workflow.path)
        .filter(|path| path != SCHELF_WORKFLOW)
        .collect()
}

/// A file `schelf init` writes, with what's there now.
pub struct PlannedFile {
    pub path: String,
    pub contents: Vec<u8>,
    pub existing: Option<String>,
}

pub fn planned_files(root: &Path, input: &SetupInput) -> Result<Vec<PlannedFile>> {
    let plan = |path: &str, contents: String| -> Result<PlannedFile> {
        Ok(PlannedFile {
            path: path.to_owned(),
            existing: read_optional(&root.join(path))?,
            contents: contents.into_bytes(),
        })
    };
    let mut files = vec![
        plan("schelf.toml", schelf_toml_for(input))?,
        plan(SCHELF_WORKFLOW, workflow_for(input))?,
    ];
    if input.format == "sabine"
        && let Some(sabine) = read_optional(&root.join("Sabine.toml"))?
    {
        files.push(PlannedFile {
            path: "Sabine.toml".into(),
            contents: follow_schelf_updates(&sabine).into_bytes(),
            existing: Some(sabine),
        });
    }
    Ok(files
        .into_iter()
        .filter(|file| {
            file.existing.as_deref().map(str::as_bytes) != Some(file.contents.as_slice())
        })
        .collect())
}

pub fn write_planned(root: &Path, files: &[PlannedFile]) -> Result<()> {
    for file in files {
        let path = root.join(&file.path);
        if let Some(folder) = path.parent() {
            std::fs::create_dir_all(folder)?;
        }
        std::fs::write(path, &file.contents)?;
    }
    Ok(())
}

/// The command that builds an extension's helper the way its project builds.
pub fn helper_build(root: &Path, path: &str) -> Result<String> {
    let program = Path::new(path)
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .unwrap_or_default();
    if read_optional(&root.join("Cargo.toml"))?.is_some() {
        return Ok(format!(
            "cargo build --release --bin {program} && cp target/release/{program} {path}"
        ));
    }
    if read_optional(&root.join("meson.build"))?.is_some() {
        return Ok(format!(
            "sudo apt-get install -y meson ninja-build && meson setup build && meson compile -C build {program} && cp build/{program} {path}"
        ));
    }
    Ok(format!("make {path}"))
}
