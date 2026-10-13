use std::collections::HashMap;
use std::path::Path;

use anyhow::{Context, Result};
use serde::Deserialize;

const GIB: u64 = 1 << 30;
const IMAGE_REFERENCE: &str = "/usr/share/luft/image-reference";
const NVIDIA: &str = "nvidia";

#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct Config {
    images: HashMap<String, Source>,
    #[serde(default)]
    pub bootloader: Option<String>,
    #[serde(default)]
    pub kernel_arguments: Vec<String>,
    pub first_boot_session: String,
    #[serde(default = "smallest_system")]
    pub smallest_system: u64,
}

#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
struct Source {
    source: String,
    size: u64,
}

#[derive(Clone)]
pub struct Image {
    pub source: String,
    pub target: String,
    pub size: u64,
}

fn smallest_system() -> u64 {
    32 * GIB
}

fn reference_for(running: &str, variant: &str) -> String {
    let base = running.strip_suffix("-nvidia").unwrap_or(running);
    if variant == NVIDIA {
        format!("{base}-nvidia")
    } else {
        base.to_owned()
    }
}

impl Config {
    pub fn read(path: &Path) -> Result<Self> {
        let text = std::fs::read_to_string(path)
            .with_context(|| format!("Couldn't read {}", path.display()))?;
        toml::from_str(&text).with_context(|| format!("Couldn't parse {}", path.display()))
    }

    pub fn image(&self, variant: &str) -> Result<Image> {
        let source = self
            .images
            .get(variant)
            .with_context(|| format!("There's no {variant} image to install."))?;
        let running = std::fs::read_to_string(IMAGE_REFERENCE)
            .with_context(|| format!("Couldn't read {IMAGE_REFERENCE}"))?;
        Ok(Image {
            source: source.source.clone(),
            target: reference_for(running.trim(), variant),
            size: source.size,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::reference_for;

    #[test]
    fn updates_come_from_the_variant_that_was_installed() {
        assert_eq!(
            reference_for("ghcr.io/lantharos/luft:45", "nvidia"),
            "ghcr.io/lantharos/luft:45-nvidia"
        );
        assert_eq!(
            reference_for("ghcr.io/lantharos/luft:45-nvidia", "default"),
            "ghcr.io/lantharos/luft:45"
        );
        assert_eq!(
            reference_for("ghcr.io/lantharos/luft:45", "default"),
            "ghcr.io/lantharos/luft:45"
        );
    }
}
