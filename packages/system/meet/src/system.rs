use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Layout {
    Subvolumes,
    SeparateHome,
    Single,
    Encrypted,
    Unknown,
}

impl Layout {
    pub fn replaceable(self) -> bool {
        matches!(self, Self::Subvolumes | Self::SeparateHome)
    }
}
