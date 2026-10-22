use std::collections::HashMap;

use luft_variant::Variant;
use serde::Deserialize;

use super::config::{Config, Release};
use super::registry;

#[derive(Deserialize)]
struct Reply {
    host: Document,
    #[serde(default)]
    configs: HashMap<String, Config>,
}

#[derive(Deserialize)]
struct Document {
    spec: Spec,
    status: Slots,
}

#[derive(Deserialize)]
struct Spec {
    image: Option<Reference>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Slots {
    booted: Option<Entry>,
    staged: Option<Entry>,
    rollback: Option<Entry>,
    #[serde(default)]
    rollback_queued: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Entry {
    image: Option<Image>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Image {
    image: Reference,
    version: Option<String>,
    image_digest: String,
}

#[derive(Deserialize)]
pub struct Reference {
    image: String,
    transport: String,
}

impl Reference {
    pub fn location(&self) -> Option<String> {
        registry::location(&self.transport, &self.image)
    }

    pub fn variant(&self) -> Variant {
        Variant::of(&self.image)
    }

    pub fn channel(&self) -> Option<&'static str> {
        let standard = Variant::Standard.reference(&self.image)?;
        match standard.rsplit_once(':')?.1 {
            "1-nightly" => Some("nightly"),
            "1" => Some("1"),
            _ => None,
        }
    }

    pub fn as_variant(&self, variant: Variant) -> Option<Self> {
        Some(Self {
            image: variant.reference(&self.image)?,
            transport: self.transport.clone(),
        })
    }
}

pub struct Deployment {
    image: Option<Image>,
    config: Config,
}

pub struct Host {
    pub followed: Option<Reference>,
    pub booted: Deployment,
    pub staged: Option<Deployment>,
    pub rollback: Option<Deployment>,
    pub rollback_queued: bool,
}

impl Host {
    pub fn parse(json: &str) -> Result<Self, String> {
        let Reply {
            host: Document { spec, status },
            mut configs,
        } = serde_json::from_str(json).map_err(|error| error.to_string())?;
        let mut deployment = |entry: Entry| Deployment {
            config: entry
                .image
                .as_ref()
                .and_then(|image| configs.remove(&image.image_digest))
                .unwrap_or_default(),
            image: entry.image,
        };
        let booted = status
            .booted
            .ok_or("This computer didn't start from a system image.")?;
        Ok(Self {
            followed: spec.image,
            booted: deployment(booted),
            staged: status.staged.map(&mut deployment),
            rollback: status.rollback.map(&mut deployment),
            rollback_queued: status.rollback_queued,
        })
    }
}

impl Deployment {
    pub fn layers(&self) -> &[String] {
        self.config.layers()
    }

    pub fn release(&self) -> Release {
        let release = self.config.release();
        Release {
            version: release
                .version
                .or_else(|| self.image.as_ref()?.version.clone()),
            ..release
        }
    }

    pub fn variant(&self) -> Option<Variant> {
        Some(self.image.as_ref()?.image.variant())
    }
}
