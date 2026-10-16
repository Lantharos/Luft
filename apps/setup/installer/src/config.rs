use std::collections::HashMap;
use std::path::Path;

use anyhow::{Context, Result};
use luft_variant::Variant;
use serde::Deserialize;

const GIB: u64 = 1 << 30;
const IMAGE_REFERENCE: &str = "/usr/share/luft/image-reference";

#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct Config {
    #[serde(default)]
    images: HashMap<String, Source>,
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
        let target = Variant::named(variant)
            .reference(running.trim())
            .with_context(|| format!("{IMAGE_REFERENCE} names no image tag"))?;
        Ok(Image {
            source: source.source.clone(),
            target,
            size: source.size,
        })
    }
}
