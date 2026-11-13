use std::path::Path;

use chrono::{DateTime, Utc};
use serde_json::Value;

use crate::schema::versions::{NIGHTLY, channel_from_version, nightly_version, version_from_tag};

fn manifests(format: &str) -> &'static [&'static str] {
    match format {
        "sabine" => &["Sabine.toml"],
        "luft-extension" => &["extension.toml"],
        _ => &[
            "src-tauri/tauri.conf.json",
            "tauri.conf.json",
            "package.json",
        ],
    }
}

fn version_in(name: &str, text: &str) -> Option<String> {
    let manifest: Value = if name.ends_with(".toml") {
        serde_json::to_value(text.parse::<toml::Table>().ok()?).ok()?
    } else {
        serde_json::from_str(text).ok()?
    };
    [
        &manifest["app"]["version"],
        &manifest["version"],
        &manifest["package"]["version"],
    ]
    .into_iter()
    .find_map(|version| version.as_str().filter(|version| !version.is_empty()))
    .map(str::to_owned)
}

pub fn manifest_version(folder: &Path, format: &str) -> Result<String, String> {
    manifests(format)
        .iter()
        .find_map(|name| version_in(name, &std::fs::read_to_string(folder.join(name)).ok()?))
        .ok_or_else(|| {
            format!(
                "No version in {}; set one there or pass the version",
                manifests(format).join(" or ")
            )
        })
}

/// Where a release's version can come from, most explicit first.
pub struct VersionSource<'a> {
    pub version: Option<&'a str>,
    pub folder: &'a Path,
    pub format: &'a str,
    pub tag: Option<&'a str>,
    pub commit: Option<&'a str>,
    pub channel: Option<&'a str>,
}

pub fn release_version(source: &VersionSource, now: DateTime<Utc>) -> Result<String, String> {
    if let Some(version) = source.version {
        return Ok(version.strip_prefix('v').unwrap_or(version).to_owned());
    }
    let base = match source.tag.and_then(version_from_tag) {
        Some(version) => version,
        None => manifest_version(source.folder, source.format)?,
    };
    if source.channel != Some(NIGHTLY) || channel_from_version(&base) == NIGHTLY {
        return Ok(base);
    }
    let commit = source
        .commit
        .ok_or("A nightly version names its commit; run this in a git checkout")?;
    nightly_version(&base, commit, now)
}

#[cfg(test)]
mod tests {
    use std::cmp::Ordering;

    use super::*;
    use crate::schema::versions::compare_versions;

    const COMMIT: &str = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b";

    fn at(text: &str) -> DateTime<Utc> {
        text.parse().unwrap()
    }

    fn source<'a>(folder: &'a Path, format: &'a str) -> VersionSource<'a> {
        VersionSource {
            version: None,
            folder,
            format,
            tag: None,
            commit: None,
            channel: None,
        }
    }

    #[test]
    fn the_version_comes_from_the_apps_own_manifest() {
        let folder = tempfile::tempdir().unwrap();
        let root = folder.path();
        let now = at("2026-11-03T04:15:30Z");
        std::fs::write(
            root.join("Sabine.toml"),
            "[app]\nid = \"io.github.alice.Notes\"\nname = \"Notes\"\nversion = \"1.4.0\"\n",
        )
        .unwrap();
        assert_eq!(
            release_version(&source(root, "sabine"), now).unwrap(),
            "1.4.0"
        );
        std::fs::write(
            root.join("extension.toml"),
            "id = \"com.lantharos.Rain\"\nversion = \"2.0.0-beta.1\"\napi = 1\n",
        )
        .unwrap();
        assert_eq!(
            release_version(&source(root, "luft-extension"), now).unwrap(),
            "2.0.0-beta.1"
        );
        std::fs::write(root.join("package.json"), "{ \"version\": \"0.3.0\" }").unwrap();
        assert_eq!(
            release_version(&source(root, "appimage"), now).unwrap(),
            "0.3.0"
        );
        std::fs::create_dir(root.join("src-tauri")).unwrap();
        std::fs::write(
            root.join("src-tauri/tauri.conf.json"),
            "{ \"version\": \"0.4.0\" }",
        )
        .unwrap();
        assert_eq!(
            release_version(&source(root, "appimage"), now).unwrap(),
            "0.4.0"
        );
    }

    #[test]
    fn a_tag_or_an_explicit_version_wins_over_the_manifest() {
        let folder = tempfile::tempdir().unwrap();
        let root = folder.path();
        let now = at("2026-11-03T04:15:30Z");
        std::fs::write(root.join("Sabine.toml"), "[app]\nversion = \"1.4.0\"\n").unwrap();
        let tagged = VersionSource {
            tag: Some("notes/v1.5.0"),
            ..source(root, "sabine")
        };
        assert_eq!(release_version(&tagged, now).unwrap(), "1.5.0");
        let given = VersionSource {
            version: Some("v1.6.0"),
            ..tagged
        };
        assert_eq!(release_version(&given, now).unwrap(), "1.6.0");
    }

    #[test]
    fn a_manifest_without_a_version_is_explained() {
        let folder = tempfile::tempdir().unwrap();
        std::fs::write(
            folder.path().join("Sabine.toml"),
            "[app]\nid = \"io.github.alice.Notes\"\n",
        )
        .unwrap();
        let error = release_version(&source(folder.path(), "sabine"), Utc::now()).unwrap_err();
        assert!(error.contains("No version in Sabine.toml"));
    }

    #[test]
    fn nightlies_get_a_version_of_their_own_newer_than_the_release_they_follow() {
        let folder = tempfile::tempdir().unwrap();
        let root = folder.path();
        std::fs::write(root.join("Sabine.toml"), "[app]\nversion = \"0.1.0\"\n").unwrap();
        let nightly = VersionSource {
            channel: Some(NIGHTLY),
            commit: Some(COMMIT),
            ..source(root, "sabine")
        };
        let first = release_version(&nightly, at("2026-11-03T04:15:30Z")).unwrap();
        assert_eq!(first, "0.2.0-nightly.202611030415.g1a2b3c4");
        assert_eq!(compare_versions(&first, "0.1.0"), Ordering::Greater);
        let zeros = "0".repeat(40);
        let later_source = VersionSource {
            commit: Some(&zeros),
            ..nightly
        };
        let later = release_version(&later_source, at("2026-11-03T09:00:00Z")).unwrap();
        assert_eq!(compare_versions(&later, &first), Ordering::Greater);
        assert_eq!(compare_versions(&later, "0.2.0"), Ordering::Less);
        let beta = VersionSource {
            channel: Some("beta"),
            commit: Some(COMMIT),
            ..source(root, "sabine")
        };
        assert_eq!(
            release_version(&beta, at("2026-11-03T04:15:30Z")).unwrap(),
            "0.1.0"
        );
    }
}
