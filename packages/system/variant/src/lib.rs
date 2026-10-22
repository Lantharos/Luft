mod graphics;

use serde::{Deserialize, Serialize};

pub use graphics::nvidia_cards;

const NVIDIA_TAG: &str = "-nvidia";
pub const NVIDIA_VENDOR: u16 = 0x10de;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Variant {
    Standard,
    Nvidia,
}

impl Variant {
    pub fn named(name: &str) -> Self {
        match name {
            "nvidia" => Self::Nvidia,
            _ => Self::Standard,
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Standard => "standard",
            Self::Nvidia => "nvidia",
        }
    }

    pub fn for_this_computer() -> Self {
        Self::with_nvidia(!nvidia_cards().is_empty())
    }

    pub fn for_vendors(graphics: impl IntoIterator<Item = u16>) -> Self {
        Self::with_nvidia(graphics.into_iter().any(|vendor| vendor == NVIDIA_VENDOR))
    }

    fn with_nvidia(nvidia: bool) -> Self {
        if nvidia { Self::Nvidia } else { Self::Standard }
    }

    pub fn of(reference: &str) -> Self {
        if reference.ends_with(NVIDIA_TAG) {
            Self::Nvidia
        } else {
            Self::Standard
        }
    }

    pub fn reference(self, reference: &str) -> Option<String> {
        let (_, tag) = reference.rsplit_once(':')?;
        if reference.contains('@') || tag.contains('/') {
            return None;
        }
        let base = reference.strip_suffix(NVIDIA_TAG).unwrap_or(reference);
        Some(match self {
            Self::Standard => base.to_owned(),
            Self::Nvidia => format!("{base}{NVIDIA_TAG}"),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::Variant;

    #[test]
    fn each_channel_keeps_its_tag_and_changes_only_the_variant() {
        for (standard, nvidia) in [
            (
                "ghcr.io/lantharos/luft:1",
                "ghcr.io/lantharos/luft:1-nvidia",
            ),
            (
                "ghcr.io/lantharos/luft:1-nightly",
                "ghcr.io/lantharos/luft:1-nightly-nvidia",
            ),
            (
                "ghcr.io/lantharos/luft:1.20261014",
                "ghcr.io/lantharos/luft:1.20261014-nvidia",
            ),
            (
                "10.0.2.2:5000/lantharos/luft:1",
                "10.0.2.2:5000/lantharos/luft:1-nvidia",
            ),
        ] {
            assert_eq!(Variant::Nvidia.reference(standard).as_deref(), Some(nvidia));
            assert_eq!(Variant::Nvidia.reference(nvidia).as_deref(), Some(nvidia));
            assert_eq!(
                Variant::Standard.reference(nvidia).as_deref(),
                Some(standard)
            );
            assert_eq!(
                Variant::Standard.reference(standard).as_deref(),
                Some(standard)
            );
            assert_eq!(Variant::of(nvidia), Variant::Nvidia);
            assert_eq!(Variant::of(standard), Variant::Standard);
        }
    }

    #[test]
    fn any_nvidia_card_picks_the_nvidia_image() {
        assert_eq!(Variant::for_vendors([0x10de]), Variant::Nvidia);
        assert_eq!(Variant::for_vendors([0x8086, 0x10de]), Variant::Nvidia);
        assert_eq!(Variant::for_vendors([0x1002]), Variant::Standard);
        assert_eq!(Variant::for_vendors([]), Variant::Standard);
    }

    #[test]
    fn an_image_without_a_tag_has_no_other_variant() {
        assert_eq!(
            Variant::Nvidia.reference("ghcr.io/lantharos/luft@sha256:21b3"),
            None
        );
        assert_eq!(
            Variant::Nvidia.reference("10.0.2.2:5000/lantharos/luft"),
            None
        );
    }
}
