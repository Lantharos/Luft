use std::collections::HashMap;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use serde_json::value::RawValue;

use super::files::{digest, map_limit};
use crate::api::http::{Body, request};
use crate::api::{API_BASE, Reply, encode};
use crate::error::{Error, Result};
use crate::project::config::relative;
use crate::schema::{ConfigIssue, LISTING_TOML, folder_of, join_config_path, listing, schelf};

const CONCURRENCY: usize = 4;

#[derive(Serialize, Clone)]
pub struct ConfigMedia {
    pub path: String,
    pub sha256: String,
    pub size: u64,
}

#[derive(Serialize, Clone)]
pub struct ApplyRequest {
    pub schelf_toml: String,
    pub schelf_toml_path: String,
    pub media: Vec<ConfigMedia>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub listing_toml: Option<String>,
}

/// schelf.toml and the listing with its pictures, as `apply` sends them.
pub struct ConfigBundle {
    pub request: ApplyRequest,
    pub files: HashMap<String, PathBuf>,
}

#[derive(Deserialize)]
pub struct ConfigChange {
    pub file: String,
    pub key: String,
    pub change: String,
}

#[derive(Deserialize)]
pub struct ApprovalRequest {
    pub id: String,
    pub url: String,
}

#[derive(Deserialize)]
pub struct ApplyResponse {
    pub app: String,
    pub applied: bool,
    pub changes: Vec<ConfigChange>,
    pub missing_media: Vec<String>,
    pub review: Vec<String>,
    pub notes: Vec<String>,
    pub request: Option<ApprovalRequest>,
}

fn missing(file: &str) -> ConfigIssue {
    ConfigIssue {
        file: file.to_owned(),
        key: None,
        message: "doesn't exist".into(),
        allowed: None,
    }
}

pub fn config_bundle(root: &Path, schelf_toml: &Path) -> Result<ConfigBundle> {
    let schelf_path = relative(root, schelf_toml);
    let text = std::fs::read_to_string(schelf_toml)
        .map_err(|_| Error::Config(vec![missing(&schelf_path)]))?;
    let manifest = schelf::parse(&schelf_path, &text).map_err(Error::Config)?;
    let mut bundle = ConfigBundle {
        request: ApplyRequest {
            schelf_toml: text,
            schelf_toml_path: schelf_path.clone(),
            media: Vec::new(),
            listing_toml: None,
        },
        files: HashMap::new(),
    };
    let Some(folder) = &manifest.listing else {
        return Ok(bundle);
    };
    let folder = join_config_path(&[folder_of(&schelf_path), folder]);
    let listing_path = join_config_path(&[&folder, LISTING_TOML]);
    let listing_text = std::fs::read_to_string(root.join(&listing_path))
        .map_err(|_| Error::Config(vec![missing(&listing_path)]))?;
    let page = listing::parse(&listing_path, &listing_text).map_err(Error::Config)?;
    bundle.request.listing_toml = Some(listing_text);
    let entries: Vec<(String, String)> = page
        .icon
        .iter()
        .map(|icon| (icon.clone(), "icon".to_owned()))
        .chain(
            page.screenshots
                .iter()
                .flatten()
                .enumerate()
                .map(|(index, shot)| (shot.file().to_owned(), format!("screenshots.{index}"))),
        )
        .collect();
    let read: Vec<std::result::Result<(ConfigMedia, PathBuf), ConfigIssue>> =
        map_limit(&entries, CONCURRENCY, |(file, key)| {
            let path = join_config_path(&[&folder, file]);
            let full = root.join(&path);
            Ok::<_, ()>(match digest(&full.to_string_lossy()) {
                Ok((sha256, size)) => Ok((ConfigMedia { path, sha256, size }, full)),
                Err(_) => Err(ConfigIssue {
                    file: listing_path.clone(),
                    key: Some(key.clone()),
                    message: format!("{file} doesn't exist in {folder}"),
                    allowed: None,
                }),
            })
        })
        .unwrap_or_default();
    let mut issues = Vec::new();
    for entry in read {
        match entry {
            Ok((media, full)) => {
                bundle.files.insert(media.sha256.clone(), full);
                bundle.request.media.push(media);
            }
            Err(issue) => issues.push(issue),
        }
    }
    if !issues.is_empty() {
        return Err(Error::Config(issues));
    }
    Ok(bundle)
}

#[derive(Serialize)]
struct ApplyBody<'a> {
    #[serde(flatten)]
    request: &'a ApplyRequest,
    dry_run: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    host: Option<&'a str>,
}

/// Makes the store match the files, sending the pictures it doesn't have yet.
pub fn apply_config(
    api: &str,
    token: &str,
    bundle: &ConfigBundle,
    dry_run: bool,
    host: Option<&str>,
) -> Result<Reply<ApplyResponse>> {
    let body = serde_json::to_string(&ApplyBody {
        request: &bundle.request,
        dry_run,
        host,
    })
    .expect("the request serialises");
    let send = || -> Result<Reply<ApplyResponse>> {
        request(
            "POST",
            &format!("{api}{API_BASE}/apply"),
            Some(token),
            Body::Json(body.clone()),
        )
    };
    let first = send()?;
    if first.value.missing_media.is_empty() || dry_run {
        return Ok(first);
    }
    let app = encode(&first.value.app);
    map_limit(&first.value.missing_media, CONCURRENCY, |sha256| {
        let bytes = std::fs::read(&bundle.files[sha256])?;
        request::<Box<RawValue>>(
            "PUT",
            &format!("{api}{API_BASE}/apply/media/{sha256}?app={app}"),
            Some(token),
            Body::Bytes(bytes),
        )
        .map(|_| ())
    })?;
    send()
}
