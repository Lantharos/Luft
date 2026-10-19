use serde::Deserialize;

use super::super::elf;
use crate::http::{self, OFFLINE};

const GITHUB_API: &str = "https://api.github.com/repos";
const SECURE_SCHEME: &str = "https://";
const SHA256_PREFIX: &str = "sha256:";

pub enum Source {
    Zsync(String),
    Github {
        owner: String,
        repo: String,
        tag: String,
        pattern: String,
    },
}

pub struct Control {
    pub url: String,
    pub version: Option<String>,
    pub published: Vec<Published>,
}

pub struct Published {
    pub name: String,
    pub sha256: String,
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
    digest: Option<String>,
}

pub fn secure(url: &str) -> Result<&str, String> {
    url.get(..SECURE_SCHEME.len())
        .is_some_and(|scheme| scheme.eq_ignore_ascii_case(SECURE_SCHEME))
        .then_some(url)
        .ok_or_else(|| "This app's updates aren't offered over a secure connection.".into())
}

pub fn source(path: &std::path::Path) -> Option<Source> {
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

fn published(assets: Vec<Asset>) -> Vec<Published> {
    assets
        .into_iter()
        .filter_map(|asset| {
            let sha256 = asset.digest?.strip_prefix(SHA256_PREFIX)?.to_lowercase();
            Some(Published {
                name: asset.name,
                sha256,
            })
        })
        .collect()
}

pub fn control_file(source: Source) -> Result<Control, String> {
    match source {
        Source::Zsync(url) => Ok(Control {
            url,
            version: None,
            published: Vec::new(),
        }),
        Source::Github {
            owner,
            repo,
            tag,
            pattern,
        } => {
            let release = release(&owner, &repo, &tag)?;
            let pattern = glob::Pattern::new(&pattern).map_err(|error| error.to_string())?;
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
            Ok(Control {
                url: asset.browser_download_url.clone(),
                version,
                published: published(release.assets),
            })
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

pub fn resolve(base: &str, target: &str) -> String {
    if target.contains("://") {
        return target.to_owned();
    }
    let folder = base
        .rsplit_once('/')
        .map(|(folder, _)| folder)
        .unwrap_or(base);
    format!("{folder}/{target}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_secure_addresses_are_used() {
        assert!(secure("https://example.com/app.zsync").is_ok());
        assert!(secure("HTTPS://example.com/app.zsync").is_ok());
        assert!(secure("http://example.com/app.zsync").is_err());
        assert!(secure("ftp://example.com/app.zsync").is_err());
        assert!(secure("").is_err());
    }

    #[test]
    fn relative_targets_stay_beside_the_control_file() {
        let base = "https://example.com/releases/app.AppImage.zsync";
        assert_eq!(
            resolve(base, "app.AppImage"),
            "https://example.com/releases/app.AppImage"
        );
    }

    #[test]
    fn keeps_published_sha256_digests() {
        let assets = vec![
            Asset {
                name: "app.AppImage".into(),
                browser_download_url: String::new(),
                digest: Some("sha256:ABCDEF".into()),
            },
            Asset {
                name: "app.AppImage.zsync".into(),
                browser_download_url: String::new(),
                digest: None,
            },
        ];
        let published = published(assets);
        assert_eq!(published.len(), 1);
        assert_eq!(published[0].sha256, "abcdef");
    }
}
