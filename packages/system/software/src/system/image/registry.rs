use std::process::Command;

use serde::Deserialize;
use serde::de::DeserializeOwned;

use super::config::Config;

const REGISTRY_TRANSPORT: &str = "registry";
const REGISTRY: &str = "docker://";
const UNREACHABLE: &str = "Couldn't reach the update server. Check your connection and try again.";
const NOT_PUBLISHED: [&str; 2] = ["manifest unknown", "name unknown"];

enum Failure {
    NotPublished,
    Unreachable,
    Unreadable(String),
}

impl From<Failure> for String {
    fn from(failure: Failure) -> Self {
        match failure {
            Failure::NotPublished | Failure::Unreachable => UNREACHABLE.into(),
            Failure::Unreadable(error) => error,
        }
    }
}

pub struct Image {
    pub config: Config,
    pub blobs: Vec<Blob>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Blob {
    pub size: u64,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Inspected {
    #[serde(default)]
    layers_data: Vec<Blob>,
}

pub fn location(transport: &str, image: &str) -> Option<String> {
    (transport == REGISTRY_TRANSPORT).then(|| format!("{REGISTRY}{image}"))
}

fn inspect<T: DeserializeOwned>(location: &str, options: &[&str]) -> Result<T, Failure> {
    let output = Command::new("skopeo")
        .arg("inspect")
        .args(options)
        .arg(location)
        .output()
        .map_err(|error| Failure::Unreadable(error.to_string()))?;
    if !output.status.success() {
        let errors = String::from_utf8_lossy(&output.stderr);
        eprintln!("{}", errors.trim());
        return Err(
            if NOT_PUBLISHED.iter().any(|missing| errors.contains(missing)) {
                Failure::NotPublished
            } else {
                Failure::Unreachable
            },
        );
    }
    serde_json::from_slice(&output.stdout).map_err(|error| Failure::Unreadable(error.to_string()))
}

fn image(location: &str) -> Result<Image, Failure> {
    std::thread::scope(|scope| {
        let config = scope.spawn(|| inspect::<Config>(location, &["--config"]));
        let blobs = inspect::<Inspected>(location, &["--no-tags"]).map(|image| image.layers_data);
        Ok(Image {
            config: config.join().map_err(|_| Failure::Unreachable)??,
            blobs: blobs?,
        })
    })
}

pub fn fetch(location: &str) -> Result<Image, String> {
    image(location).map_err(String::from)
}

/// The image, or `None` while nothing is published under its tag.
pub fn fetch_published(location: &str) -> Result<Option<Image>, String> {
    match image(location) {
        Ok(image) => Ok(Some(image)),
        Err(Failure::NotPublished) => Ok(None),
        Err(failure) => Err(failure.into()),
    }
}
