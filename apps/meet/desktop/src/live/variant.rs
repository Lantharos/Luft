use serde::{Deserialize, Serialize};

use crate::check::facts::{Device, NVIDIA};

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Variant {
    Standard,
    Nvidia,
}

impl Variant {
    pub fn for_graphics(graphics: &[Device]) -> Self {
        if graphics.iter().any(|device| device.vendor == NVIDIA) {
            Self::Nvidia
        } else {
            Self::Standard
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Standard => "standard",
            Self::Nvidia => "nvidia",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn device(vendor: u16) -> Device {
        Device {
            name: String::new(),
            vendor,
        }
    }

    #[test]
    fn any_nvidia_card_picks_the_nvidia_image() {
        assert_eq!(Variant::for_graphics(&[device(0x10de)]), Variant::Nvidia);
        assert_eq!(
            Variant::for_graphics(&[device(0x8086), device(0x10de)]),
            Variant::Nvidia
        );
    }

    #[test]
    fn everything_else_gets_the_standard_image() {
        assert_eq!(Variant::for_graphics(&[device(0x1002)]), Variant::Standard);
        assert_eq!(Variant::for_graphics(&[device(0x8086)]), Variant::Standard);
        assert_eq!(Variant::for_graphics(&[]), Variant::Standard);
    }
}
