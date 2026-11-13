use std::path::{Path, PathBuf};

use crate::error::Result;
use crate::schema::schelf::{self, SchelfToml};

/// What a release is made of, from schelf.toml and the GitHub run it's in.
pub struct ReleaseContext {
    pub folder: PathBuf,
    pub manifest: SchelfToml,
    pub schelf_toml: String,
    pub permissions_toml: Option<String>,
    pub tag: Option<String>,
    pub commit: Option<String>,
    pub notes: String,
}

fn github_event() -> Result<serde_json::Value> {
    let Some(path) = std::env::var_os("GITHUB_EVENT_PATH") else {
        return Ok(serde_json::Value::Null);
    };
    let text = std::fs::read_to_string(path)?;
    serde_json::from_str(&text).map_err(|error| crate::error::Error::Other(error.to_string()))
}

fn tag_from_ref() -> Option<String> {
    std::env::var("GITHUB_REF")
        .ok()?
        .strip_prefix("refs/tags/")
        .map(str::to_owned)
}

pub fn release_context(schelf_toml: &Path) -> Result<ReleaseContext> {
    let folder = schelf_toml
        .parent()
        .map(Path::to_path_buf)
        .unwrap_or_default();
    let text = std::fs::read_to_string(schelf_toml)?;
    let manifest = schelf::read(&text)?;
    let permissions_toml = manifest
        .permissions
        .as_ref()
        .map(|file| std::fs::read_to_string(folder.join(file)))
        .transpose()?;
    let event = github_event()?;
    let release = &event["release"];
    Ok(ReleaseContext {
        tag: release["tag_name"]
            .as_str()
            .map(str::to_owned)
            .or_else(tag_from_ref),
        commit: std::env::var("GITHUB_SHA")
            .ok()
            .filter(|sha| !sha.is_empty()),
        notes: release["body"].as_str().unwrap_or_default().to_owned(),
        folder,
        manifest,
        schelf_toml: text,
        permissions_toml,
    })
}
