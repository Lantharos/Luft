use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
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
