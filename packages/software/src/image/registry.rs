use std::process::Command;

use serde::Deserialize;
use serde::de::DeserializeOwned;

use super::config::Config;

const UNVERIFIED_REGISTRY: &str = "ostree-unverified-registry:";
const REMOTE_IMAGE: &str = "ostree-remote-image:";
const REGISTRY: &str = "docker://";
const UNREACHABLE: &str = "Couldn't reach the update server. Check your connection and try again.";

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

pub fn location(reference: &str) -> Option<String> {
    if let Some(name) = reference.strip_prefix(UNVERIFIED_REGISTRY) {
        return Some(format!("{REGISTRY}{name}"));
    }
    let image = match reference.strip_prefix(REMOTE_IMAGE) {
        Some(remote) => remote.split_once(':')?.1,
        None => reference.split_once(':')?.1,
    };
    image.contains(':').then(|| image.to_owned())
}

fn inspect<T: DeserializeOwned>(location: &str, options: &[&str]) -> Result<T, String> {
    let output = Command::new("skopeo")
        .arg("inspect")
        .args(options)
        .arg(location)
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        eprintln!("{}", String::from_utf8_lossy(&output.stderr).trim());
        return Err(UNREACHABLE.into());
    }
    serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())
}

pub fn fetch(location: &str) -> Result<Image, String> {
    std::thread::scope(|scope| {
        let config = scope.spawn(|| inspect::<Config>(location, &["--config"]));
        let blobs = inspect::<Inspected>(location, &["--no-tags"]).map(|image| image.layers_data);
        Ok(Image {
            config: config.join().map_err(|_| UNREACHABLE)??,
            blobs: blobs?,
        })
    })
}

#[cfg(test)]
mod tests {
    use super::location;

    #[test]
    fn finds_where_images_come_from() {
        assert_eq!(
            location("ostree-unverified-registry:ghcr.io/lantharos/luft:45").as_deref(),
            Some("docker://ghcr.io/lantharos/luft:45")
        );
        assert_eq!(
            location("ostree-image-signed:docker://ghcr.io/lantharos/luft:45-nvidia").as_deref(),
            Some("docker://ghcr.io/lantharos/luft:45-nvidia")
        );
        assert_eq!(
            location("ostree-remote-image:luft:docker://ghcr.io/lantharos/luft:45").as_deref(),
            Some("docker://ghcr.io/lantharos/luft:45")
        );
    }
}
