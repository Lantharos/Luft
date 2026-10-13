use serde::{Deserialize, Deserializer};

use super::config::{Config, Release};

#[derive(Deserialize, Debug)]
#[serde(rename_all = "kebab-case")]
pub struct Deployment {
    pub booted: bool,
    #[serde(default)]
    pub staged: bool,
    version: Option<String>,
    pub container_image_reference: Option<String>,
    #[serde(default)]
    pub requested_packages: Vec<String>,
    #[serde(default)]
    base_commit_meta: Meta,
}

#[derive(Deserialize, Default, Debug)]
struct Meta {
    #[serde(
        rename = "ostree.container.image-config",
        default,
        deserialize_with = "embedded"
    )]
    config: Config,
}

fn embedded<'de, D: Deserializer<'de>>(deserializer: D) -> Result<Config, D::Error> {
    let text = String::deserialize(deserializer)?;
    serde_json::from_str(&text).map_err(serde::de::Error::custom)
}

impl Deployment {
    pub fn parse(deployments: serde_json::Value) -> Result<Vec<Self>, String> {
        serde_json::from_value(deployments).map_err(|error| error.to_string())
    }

    pub fn layers(&self) -> &[String] {
        self.base_commit_meta.config.layers()
    }

    pub fn release(&self) -> Release {
        let release = self.base_commit_meta.config.release();
        Release {
            version: release.version.or_else(|| self.version.clone()),
            ..release
        }
    }
}
