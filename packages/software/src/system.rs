use std::sync::LazyLock;

use serde::Serialize;

const KERNEL_COMMAND_LINE: &str = "/proc/cmdline";
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
    let command_line = std::fs::read_to_string(KERNEL_COMMAND_LINE).unwrap_or_default();
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
