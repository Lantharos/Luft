use std::path::Path;
use std::sync::LazyLock;

use serde::Serialize;

const IMAGE_BOOTED: &str = "/run/ostree-booted";

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum System {
    Packages,
    Image,
}

static CURRENT: LazyLock<System> = LazyLock::new(|| {
    if Path::new(IMAGE_BOOTED).exists() {
        System::Image
    } else {
        System::Packages
    }
});

impl System {
    pub fn current() -> Self {
        *CURRENT
    }
}
