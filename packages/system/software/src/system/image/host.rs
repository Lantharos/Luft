use std::collections::HashMap;

use luft_variant::{Channel, Variant};
use serde::Deserialize;

use super::Graphics;
use super::config::{Config, Release};
use super::registry;

#[derive(Deserialize)]
struct Reply {
    host: Document,
    #[serde(default)]
    configs: HashMap<String, Config>,
    #[serde(default)]
    waiting: Option<Channel>,
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

#[derive(Deserialize, Clone)]
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

    /// Which release channel the image's tag belongs to: `1-nightly` and
    /// versions such as `1.2-nightly.21` are nightlies, `1` and versions such
    /// as `1.1` are stable, and any other tag is on neither.
    pub fn release_channel(&self) -> Option<&'static str> {
        let standard = Variant::Standard.reference(&self.image)?;
        let tag = standard.rsplit_once(':')?.1;
        if tag.contains("-nightly") {
            Some("nightly")
        } else if tag.chars().all(|c| c.is_ascii_digit() || c == '.') {
            Some("stable")
        } else {
            None
        }
    }

    pub fn follows(&self) -> Option<Channel> {
        Channel::of(&self.image)
    }

    pub fn as_channel(&self, channel: Channel) -> Option<Self> {
        Some(Self {
            image: channel.reference(&self.image)?,
            transport: self.transport.clone(),
        })
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
    pub waiting: Option<Channel>,
}

impl Host {
    pub fn parse(json: &str) -> Result<Self, String> {
        let Reply {
            host: Document { spec, status },
            mut configs,
            waiting,
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
            waiting,
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

    pub fn channel(&self) -> Option<&'static str> {
        self.image.as_ref()?.image.release_channel()
    }

    pub fn digest(&self) -> Option<&str> {
        Some(&self.image.as_ref()?.image_digest)
    }

    pub fn graphics(&self) -> Graphics {
        match self.variant() {
            Some(Variant::Nvidia) => Graphics::Nvidia(self.config.nvidia_driver()),
            _ => Graphics::Standard,
        }
    }
}
