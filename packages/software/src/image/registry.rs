use std::process::Command;

use serde::Deserialize;
use serde::de::DeserializeOwned;

use super::config::Config;

const REGISTRY_TRANSPORT: &str = "registry";
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

pub fn location(transport: &str, image: &str) -> Option<String> {
    (transport == REGISTRY_TRANSPORT).then(|| format!("{REGISTRY}{image}"))
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
