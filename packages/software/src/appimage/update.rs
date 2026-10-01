use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Read;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::SystemTime;

use serde::{Deserialize, Serialize};
use sha1::{Digest, Sha1};

use super::bundle;
use super::elf;
use super::integrate;
use super::library::{self, AppImage};
use crate::http::{self, OFFLINE};
use crate::progress::Stage;
use crate::task::Task;

const GITHUB_API: &str = "https://api.github.com/repos";
const HEADER_BYTES: usize = 64 * 1024;

type HashKey = (PathBuf, u64, Option<SystemTime>);

static HASHES: Mutex<Option<HashMap<HashKey, String>>> = Mutex::new(None);

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Available {
    pub version: Option<String>,
    pub file_name: Option<String>,
    pub size: u64,
    #[serde(skip)]
    url: String,
    #[serde(skip)]
    sha1: String,
}

enum Source {
    Zsync(String),
    Github {
        owner: String,
        repo: String,
        tag: String,
        pattern: String,
    },
}

#[derive(Deserialize)]
struct Release {
    tag_name: String,
    draft: bool,
    assets: Vec<Asset>,
}

#[derive(Deserialize)]
struct Asset {
    name: String,
    browser_download_url: String,
}

fn source(path: &Path) -> Option<Source> {
    let info = elf::section(path, ".upd_info")?;
    let parts: Vec<&str> = info.split('|').collect();
    match parts[..] {
        ["zsync", url] => Some(Source::Zsync(url.to_owned())),
        ["gh-releases-zsync", owner, repo, tag, pattern] => Some(Source::Github {
            owner: owner.to_owned(),
            repo: repo.to_owned(),
            tag: tag.to_owned(),
            pattern: pattern.to_owned(),
        }),
        _ => None,
    }
}

fn release(owner: &str, repo: &str, tag: &str) -> Result<Release, String> {
    let url = match tag {
        "latest" => format!("{GITHUB_API}/{owner}/{repo}/releases/latest"),
        "latest-pre" | "latest-all" => format!("{GITHUB_API}/{owner}/{repo}/releases?per_page=20"),
        tag => format!("{GITHUB_API}/{owner}/{repo}/releases/tags/{tag}"),
    };
    let body = http::text(&url)?;
    if url.ends_with("per_page=20") {
        let releases: Vec<Release> =
            serde_json::from_str(&body).map_err(|_| OFFLINE.to_string())?;
        releases
            .into_iter()
            .find(|release| !release.draft)
            .ok_or_else(|| "No releases were found.".into())
    } else {
        serde_json::from_str(&body).map_err(|_| OFFLINE.to_string())
    }
}

fn control_file(source: &Source) -> Result<(String, Option<String>), String> {
    match source {
        Source::Zsync(url) => Ok((url.clone(), None)),
        Source::Github {
            owner,
            repo,
            tag,
            pattern,
        } => {
            let release = release(owner, repo, tag)?;
            let pattern = glob::Pattern::new(pattern).map_err(|error| error.to_string())?;
            let asset = release
                .assets
                .iter()
                .find(|asset| pattern.matches(&asset.name))
                .ok_or("The latest release doesn't include this AppImage.")?;
            let tag = release.tag_name.trim_start_matches('v');
            let version = if tag.chars().any(|character| character.is_ascii_digit()) {
                Some(tag.to_owned())
            } else {
                version_in(&asset.name)
            };
            Ok((asset.browser_download_url.clone(), version))
        }
    }
}

fn version_in(file_name: &str) -> Option<String> {
    file_name
        .trim_end_matches(".zsync")
        .trim_end_matches(".AppImage")
        .split(['-', '_'])
        .skip(1)
        .find(|part| {
            part.starts_with(|character: char| character.is_ascii_digit())
                && !matches!(*part, "64" | "86")
        })
        .map(str::to_owned)
}

fn header(url: &str) -> Result<HashMap<String, String>, String> {
    let response = http::agent()
        .get(url)
        .header("Range", format!("bytes=0-{}", HEADER_BYTES - 1))
        .call()
        .map_err(|_| OFFLINE.to_string())?;
    let mut bytes = Vec::new();
    response
        .into_body()
        .into_reader()
        .take(HEADER_BYTES as u64)
        .read_to_end(&mut bytes)
        .map_err(|_| OFFLINE.to_string())?;
    let text = String::from_utf8_lossy(&bytes);
    Ok(text
        .lines()
        .take_while(|line| !line.is_empty())
        .filter_map(|line| line.split_once(':'))
        .map(|(key, value)| (key.trim().to_owned(), value.trim().to_owned()))
        .collect())
}

fn resolve(base: &str, target: &str) -> String {
    if target.contains("://") {
        return target.to_owned();
    }
    let folder = base
        .rsplit_once('/')
        .map(|(folder, _)| folder)
        .unwrap_or(base);
    format!("{folder}/{target}")
}

fn sha1_of(path: &Path) -> Result<String, String> {
    let metadata = path.metadata().map_err(|error| error.to_string())?;
    let key = (path.to_path_buf(), metadata.len(), metadata.modified().ok());
    if let Some(hash) = HASHES
        .lock()
        .ok()
        .and_then(|hashes| hashes.as_ref()?.get(&key).cloned())
    {
        return Ok(hash);
    }
    let mut file = File::open(path).map_err(|error| error.to_string())?;
    let mut hasher = Sha1::new();
    let mut buffer = vec![0u8; 1 << 20];
    loop {
        let read = file.read(&mut buffer).map_err(|error| error.to_string())?;
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
    }
    let hash: String = hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect();
    if let Ok(mut hashes) = HASHES.lock() {
        hashes.get_or_insert_default().insert(key, hash.clone());
    }
    Ok(hash)
}

pub fn check(app: &AppImage) -> Result<Option<Available>, String> {
    let Some(source) = source(&app.path) else {
        return Ok(None);
    };
    let (control, version) = control_file(&source)?;
    let header = header(&control)?;
    let sha1 = header
        .get("SHA-1")
        .cloned()
        .ok_or("This app's update information is incomplete.")?
        .to_lowercase();
    if sha1 == sha1_of(&app.path)? {
        return Ok(None);
    }
    let target = header
        .get("URL")
        .ok_or("This app's update information is incomplete.")?;
    Ok(Some(Available {
        version,
        file_name: header.get("Filename").cloned(),
        size: header
            .get("Length")
            .and_then(|length| length.parse().ok())
            .unwrap_or(0),
        url: resolve(&control, target),
        sha1,
    }))
}

pub fn apply(app: &AppImage, task: Task) -> Result<AppImage, String> {
    task.progress(Stage::Preparing, None);
    let available = check(app)?.ok_or("This app is already up to date.")?;
    let staging = app.path.with_extension("AppImage.part");
    http::download(&available.url, &staging, task)?;
    task.progress(Stage::Installing, None);
    if sha1_of(&staging)? != available.sha1 {
        let _ = fs::remove_file(&staging);
        return Err("The download was damaged. Try again.".into());
    }
    fs::set_permissions(&staging, fs::Permissions::from_mode(0o755))
        .map_err(|error| error.to_string())?;
    let bundle = match bundle::read(&staging) {
        Ok(bundle) => bundle,
        Err(error) => {
            let _ = fs::remove_file(&staging);
            return Err(error);
        }
    };
    fs::rename(&staging, &app.path).map_err(|error| error.to_string())?;
    integrate::integrate(&app.id, &app.path, &bundle)?;
    library::find(&app.id)
}
