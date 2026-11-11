//! Which version of Luft is running and the channel it came from, as the
//! updater reads them from bootc. A release is a nightly given a version of
//! its own, so only bootc knows which one this is.

use std::collections::HashMap;

use serde::Deserialize;
use zbus::Connection;

const UPDATER: &str = "com.lantharos.Updater1";
const UPDATER_PATH: &str = "/com/lantharos/Updater1";
const DEVELOPMENT: &str = "development";
const NVIDIA: &str = "-nvidia";
const VERSION_LABEL: &str = "org.opencontainers.image.version";

#[derive(Deserialize)]
struct Status {
    host: Host,
    #[serde(default)]
    configs: HashMap<String, Config>,
}

#[derive(Deserialize)]
struct Host {
    status: Deployments,
}

#[derive(Deserialize)]
struct Deployments {
    booted: Option<Deployment>,
}

#[derive(Deserialize)]
struct Deployment {
    image: Option<Booted>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Booted {
    image: Reference,
    version: Option<String>,
    image_digest: String,
}

#[derive(Deserialize)]
struct Reference {
    image: String,
}

#[derive(Deserialize)]
struct Config {
    config: Labels,
}

#[derive(Deserialize)]
struct Labels {
    #[serde(rename = "Labels", default)]
    labels: HashMap<String, String>,
}

pub struct Image {
    pub version: String,
    pub channel: String,
}

fn channel(reference: &str) -> &'static str {
    let tag = reference.rsplit_once(':').map_or("", |(_, tag)| tag);
    let tag = tag.strip_suffix(NVIDIA).unwrap_or(tag);
    if tag.contains("-nightly") {
        "nightly"
    } else if !tag.is_empty()
        && tag
            .chars()
            .all(|character| character.is_ascii_digit() || character == '.')
    {
        "stable"
    } else {
        DEVELOPMENT
    }
}

/// The booted image's version, from bootc or, when bootc doesn't know it,
/// from the version label of the image's configuration.
fn parse(status: &str) -> Option<Image> {
    let Status { host, configs } = serde_json::from_str(status).ok()?;
    let booted = host.status.booted?.image?;
    let version = booted.version.or_else(|| {
        configs
            .get(&booted.image_digest)?
            .config
            .labels
            .get(VERSION_LABEL)
            .cloned()
    })?;
    Some(Image {
        channel: channel(&booted.image.image).into(),
        version,
    })
}

pub async fn running(system: &Connection) -> Image {
    let status: Option<String> = system
        .call_method(Some(UPDATER), UPDATER_PATH, Some(UPDATER), "Status", &())
        .await
        .ok()
        .and_then(|reply| reply.body().deserialize().ok());
    status.as_deref().and_then(parse).unwrap_or_else(|| Image {
        version: DEVELOPMENT.into(),
        channel: DEVELOPMENT.into(),
    })
}

#[cfg(test)]
mod tests {
    use super::parse;

    #[test]
    fn reads_the_booted_release() {
        let image = parse(
            r#"{"host":{"status":{"booted":{"image":{"image":{"image":"ghcr.io/lantharos/luft:1","transport":"registry"},"imageDigest":"sha256:ab"}}}},"configs":{"sha256:ab":{"config":{"Labels":{"org.opencontainers.image.version":"1.4"}}}}}"#,
        )
        .unwrap();
        assert_eq!(
            (image.version.as_str(), image.channel.as_str()),
            ("1.4", "stable")
        );
    }
}
