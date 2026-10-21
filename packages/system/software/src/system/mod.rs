#[cfg(feature = "system")]
pub mod image;
#[cfg(feature = "system")]
pub mod packagekit;
#[cfg(feature = "system")]
pub mod packages;
pub mod repositories;
#[cfg(feature = "system")]
pub mod system_packages;
#[cfg(feature = "system")]
pub mod updates;

use std::sync::LazyLock;

use serde::Serialize;

const KERNEL_COMMAND_LINE: &str = "/proc/cmdline";
const KERNEL_COMMAND_LINE_OVERRIDE: &str = "LUFT_KERNEL_COMMAND_LINE";
const COMPOSEFS_ROOT: [&str; 2] = ["composefs=", "composefs.digest="];

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum System {
    Packages,
    Image,
}

fn started_from_image(command_line: &str) -> bool {
    command_line
        .split_whitespace()
        .any(|argument| COMPOSEFS_ROOT.iter().any(|key| argument.starts_with(key)))
}

static CURRENT: LazyLock<System> = LazyLock::new(|| {
    let path = std::env::var_os(KERNEL_COMMAND_LINE_OVERRIDE)
        .unwrap_or_else(|| KERNEL_COMMAND_LINE.into());
    let command_line = std::fs::read_to_string(path).unwrap_or_default();
    if started_from_image(&command_line) {
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
