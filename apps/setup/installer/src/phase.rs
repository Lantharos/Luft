use std::path::{Path, PathBuf};

const LIVE_ARGUMENT: &str = "rd.live.image";
const PENDING: &str = "first-boot";
pub const SETUP_GROUP: &str = "luft-setup";

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Phase {
    Live,
    FirstBoot,
    Installed,
}

impl Phase {
    pub fn name(self) -> &'static str {
        match self {
            Self::Live => "live",
            Self::FirstBoot => "first-boot",
            Self::Installed => "installed",
        }
    }
}

pub fn marker(state_dir: &Path) -> PathBuf {
    state_dir.join(PENDING)
}

pub fn pending_user(state_dir: &Path) -> Option<String> {
    std::fs::read_to_string(marker(state_dir))
        .ok()
        .map(|user| user.trim().to_owned())
        .filter(|user| !user.is_empty())
}

pub fn detect(state_dir: &Path) -> Phase {
    let command_line = std::fs::read_to_string("/proc/cmdline").unwrap_or_default();
    if command_line
        .split_whitespace()
        .any(|argument| argument == LIVE_ARGUMENT)
    {
        Phase::Live
    } else if pending_user(state_dir).is_some() {
        Phase::FirstBoot
    } else {
        Phase::Installed
    }
}
