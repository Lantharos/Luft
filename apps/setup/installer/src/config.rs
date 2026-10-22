use std::collections::HashMap;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use luft_i18n::t;
use serde::Deserialize;

use crate::L10N;

const GIB: u64 = 1 << 30;
const SETUP_APP: &str = "/usr/lib/sabine/com.lantharos.setup/setup";

#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct Config {
    #[serde(default)]
    images: HashMap<String, Source>,
    #[serde(default = "smallest_system")]
    pub smallest_system: u64,
    #[serde(default = "setup_app")]
    pub setup_app: PathBuf,
}

#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
struct Source {
    source: String,
    target: String,
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

fn setup_app() -> PathBuf {
    PathBuf::from(SETUP_APP)
}

impl Config {
    pub fn read(path: &Path) -> Result<Self> {
        let text = std::fs::read_to_string(path)
            .with_context(|| format!("Couldn't read {}", path.display()))?;
        toml::from_str(&text).with_context(|| format!("Couldn't parse {}", path.display()))
    }

    fn chosen(&self, wanted: &str) -> Option<(&str, &Source)> {
        if let Some((name, source)) = self.images.get_key_value(wanted) {
            return Some((name, source));
        }
        match self.images.iter().collect::<Vec<_>>().as_slice() {
            [(name, source)] => Some((name.as_str(), *source)),
            _ => None,
        }
    }

    pub fn image(&self, wanted: &str) -> Result<Image> {
        let (_, source) = self
            .chosen(wanted)
            .with_context(|| t!(L10N, "installer-no-image", variant = wanted))?;
        Ok(Image {
            source: source.source.clone(),
            target: source.target.clone(),
            size: source.size,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn stick(images: &str) -> Config {
        toml::from_str(images).unwrap()
    }

    const NVIDIA_ONLY: &str = "[images.nvidia]\nsource = \"containers-storage:ghcr.io/lantharos/luft:1-nvidia\"\ntarget = \"ghcr.io/lantharos/luft:1-nvidia\"\nsize = 2\n";
    const UNIVERSAL: &str = "[images.default]\nsource = \"containers-storage:ghcr.io/lantharos/luft:1\"\ntarget = \"ghcr.io/lantharos/luft:1\"\nsize = 1\n[images.nvidia]\nsource = \"containers-storage:ghcr.io/lantharos/luft:1-nvidia\"\ntarget = \"ghcr.io/lantharos/luft:1-nvidia\"\nsize = 2\n";

    #[test]
    fn a_stick_with_one_image_installs_that_one() {
        let config = stick(NVIDIA_ONLY);
        assert_eq!(
            config.chosen("default").map(|(name, _)| name),
            Some("nvidia")
        );
    }

    #[test]
    fn a_stick_with_both_installs_the_one_asked_for() {
        let config = stick(UNIVERSAL);
        assert_eq!(
            config.chosen("default").map(|(name, _)| name),
            Some("default")
        );
        assert_eq!(
            config.chosen("nvidia").map(|(name, _)| name),
            Some("nvidia")
        );
        assert!(config.chosen("other").is_none());
    }
}
