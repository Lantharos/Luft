use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::value::RawValue;

use super::bundle::{ApplyResponse, ConfigBundle, apply_config};
use super::collect::HashedArtifact;
use super::files::map_limit;
use crate::api::http::{Body, request};
use crate::api::{API_BASE, Reply, encode};
use crate::error::Result;

const CONCURRENCY: usize = 4;

#[derive(Serialize)]
pub struct PublishFile<'a> {
    pub name: &'a str,
    pub platform: &'a str,
    pub kind: &'a str,
    pub size: u64,
    pub sha256: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub executable: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub signature: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blockmap: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blockmap_size: Option<u64>,
}

impl<'a> PublishFile<'a> {
    pub fn of(hashed: &'a HashedArtifact) -> Self {
        let artifact = &hashed.artifact;
        Self {
            name: &artifact.name,
            platform: &artifact.platform,
            kind: &artifact.kind,
            size: hashed.size,
            sha256: &hashed.sha256,
            executable: artifact.executable.as_deref(),
            signature: artifact.signature.as_deref(),
            blockmap: artifact.blockmap.as_deref(),
            blockmap_size: artifact.blockmap_size,
        }
    }
}

#[derive(Deserialize, Clone)]
pub struct UploadTarget {
    pub name: String,
    pub url: String,
    pub parts: u64,
    pub part_size: u64,
}

#[derive(Deserialize)]
pub struct PublishResponse {
    pub release: String,
    pub app: String,
    pub version: String,
    pub upload_token: String,
    pub files: Vec<UploadTarget>,
}

#[derive(Deserialize)]
pub struct CheckResult {
    pub name: String,
    pub status: String,
    pub summary: String,
}

#[derive(Deserialize)]
pub struct CompleteResponse {
    pub status: String,
    pub checks: Vec<CheckResult>,
    pub dashboard: String,
    pub tools: Vec<serde_json::Value>,
}

/// What a release is made of, wherever it's published from.
pub struct ReleaseInput<'a> {
    pub version: &'a str,
    pub channel: Option<&'a str>,
    pub bridge: bool,
    pub notes: &'a str,
    pub config: &'a ConfigBundle,
    pub artifacts: &'a [HashedArtifact],
}

pub struct Published {
    pub applied: Reply<ApplyResponse>,
    pub release: Reply<PublishResponse>,
    pub completed: Reply<CompleteResponse>,
}

#[derive(Serialize)]
struct PublishRequest<'a> {
    version: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    commit: Option<&'a str>,
    schelf_toml: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    permissions_toml: Option<&'a str>,
    notes: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    channel: Option<&'a str>,
    bridge: bool,
    files: Vec<PublishFile<'a>>,
}

/// Where `url` points from the store at `api`, as `new URL(url, api)` reads it.
fn resolved(api: &str, url: &str) -> String {
    if url.starts_with("http://") || url.starts_with("https://") {
        return url.to_owned();
    }
    let origin_end = api
        .find("://")
        .and_then(|scheme| api[scheme + 3..].find('/').map(|path| scheme + 3 + path))
        .unwrap_or(api.len());
    if url.starts_with('/') {
        format!("{}{url}", &api[..origin_end])
    } else {
        format!("{}/{url}", &api[..origin_end])
    }
}

struct Part<'a> {
    target: &'a UploadTarget,
    path: &'a str,
    number: u64,
}

fn upload_part(api: &str, token: &str, part: &Part, size: u64) -> Result<()> {
    let mut url = resolved(api, &part.target.url);
    let (offset, length) = if part.target.parts > 1 {
        let separator = if url.contains('?') { '&' } else { '?' };
        url = format!(
            "{url}{separator}part={}&parts={}",
            part.number, part.target.parts
        );
        let offset = (part.number - 1) * part.target.part_size;
        (
            offset,
            part.target.part_size.min(size.saturating_sub(offset)),
        )
    } else {
        (0, size)
    };
    request::<Box<RawValue>>(
        "PUT",
        &url,
        Some(token),
        Body::File {
            path: part.path.into(),
            offset,
            length,
        },
    )?;
    Ok(())
}

/// Sends the files the store asked for, in parts where it said, and tells
/// it they're all there.
pub fn upload_release(
    api: &str,
    release: &PublishResponse,
    artifacts: &[HashedArtifact],
) -> Result<Reply<CompleteResponse>> {
    let files: HashMap<&str, &HashedArtifact> = artifacts
        .iter()
        .map(|hashed| (hashed.artifact.name.as_str(), hashed))
        .collect();
    let parts: Vec<Part> = release
        .files
        .iter()
        .flat_map(|target| {
            let path = files[target.name.as_str()].artifact.path.as_str();
            (1..=target.parts).map(move |number| Part {
                target,
                path,
                number,
            })
        })
        .collect();
    map_limit(&parts, CONCURRENCY, |part| {
        upload_part(
            api,
            &release.upload_token,
            part,
            files[part.target.name.as_str()].size,
        )
    })?;
    request(
        "POST",
        &format!(
            "{api}{API_BASE}/publish/{}/complete",
            encode(&release.release)
        ),
        Some(&release.upload_token),
        Body::Empty,
    )
}

/// Publishes a release from a workflow or with an upload token.
pub fn publish_release(
    api: &str,
    token: &str,
    input: &ReleaseInput,
    commit: Option<&str>,
    schelf_toml: &str,
    permissions_toml: Option<&str>,
) -> Result<Published> {
    let applied = apply_config(api, token, input.config, false, None)?;
    let body = PublishRequest {
        version: input.version,
        commit,
        schelf_toml,
        permissions_toml,
        notes: input.notes,
        channel: input.channel,
        bridge: input.bridge,
        files: input.artifacts.iter().map(PublishFile::of).collect(),
    };
    let release: Reply<PublishResponse> = request(
        "POST",
        &format!("{api}{API_BASE}/publish"),
        Some(token),
        Body::Json(serde_json::to_string(&body).expect("the request serialises")),
    )?;
    let completed = upload_release(api, &release.value, input.artifacts)?;
    Ok(Published {
        applied,
        release,
        completed,
    })
}
