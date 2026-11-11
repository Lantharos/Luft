use serde::{Deserialize, Serialize};
use specta::Type;

use crate::Variant;

const NIGHTLY_TAG: &str = "-nightly";

/// Which of Luft's releases a computer follows: the stable versions, tagged with the major
/// version alone such as `:1`, or the nightly builds, tagged `:1-nightly`.
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum Channel {
    Stable,
    Nightly,
}

impl Channel {
    pub fn named(name: &str) -> Option<Self> {
        match name {
            "stable" => Some(Self::Stable),
            "nightly" => Some(Self::Nightly),
            _ => None,
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Stable => "stable",
            Self::Nightly => "nightly",
        }
    }

    /// The reference with the major version alone as its tag, and the channel its tag names.
    fn split(reference: &str) -> Option<(String, Self)> {
        let standard = Variant::Standard.reference(reference)?;
        let (image, tag) = standard.rsplit_once(':')?;
        let (major, channel) = match tag.strip_suffix(NIGHTLY_TAG) {
            Some(major) => (major, Self::Nightly),
            None => (tag, Self::Stable),
        };
        (!major.is_empty() && major.bytes().all(|byte| byte.is_ascii_digit()))
            .then(|| (format!("{image}:{major}"), channel))
    }

    /// The channel an image reference follows, or none for one that names a fixed version.
    pub fn of(reference: &str) -> Option<Self> {
        Self::split(reference).map(|(_, channel)| channel)
    }

    /// The same image and variant on this channel, for a reference that follows a channel.
    pub fn reference(self, reference: &str) -> Option<String> {
        let (major, _) = Self::split(reference)?;
        let tag = match self {
            Self::Stable => major,
            Self::Nightly => format!("{major}{NIGHTLY_TAG}"),
        };
        Variant::of(reference).reference(&tag)
    }
}

#[cfg(test)]
mod tests {
    use super::Channel;

    #[test]
    fn switching_channels_keeps_the_registry_major_and_variant() {
        for (stable, nightly) in [
            (
                "ghcr.io/lantharos/luft:1",
                "ghcr.io/lantharos/luft:1-nightly",
            ),
            (
                "ghcr.io/lantharos/luft:1-nvidia",
                "ghcr.io/lantharos/luft:1-nightly-nvidia",
            ),
            (
                "10.0.2.2:5000/lantharos/luft:2",
                "10.0.2.2:5000/lantharos/luft:2-nightly",
            ),
        ] {
            assert_eq!(Channel::of(stable), Some(Channel::Stable));
            assert_eq!(Channel::of(nightly), Some(Channel::Nightly));
            assert_eq!(Channel::Nightly.reference(stable).as_deref(), Some(nightly));
            assert_eq!(Channel::Stable.reference(nightly).as_deref(), Some(stable));
            assert_eq!(Channel::Stable.reference(stable).as_deref(), Some(stable));
        }
    }

    #[test]
    fn a_fixed_version_follows_no_channel() {
        for fixed in [
            "ghcr.io/lantharos/luft:1.2-nightly.21",
            "ghcr.io/lantharos/luft:1.1",
            "ghcr.io/lantharos/luft@sha256:21b3",
        ] {
            assert_eq!(Channel::of(fixed), None, "{fixed}");
            assert_eq!(Channel::Stable.reference(fixed), None, "{fixed}");
        }
    }
}
