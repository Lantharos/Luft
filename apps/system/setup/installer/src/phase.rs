use std::path::{Path, PathBuf};

const LIVE_ARGUMENT: &str = "rd.live.image";
const PENDING: &str = "first-boot";
const UNCLAIMED: &str = "unclaimed";
pub const WITH_INSTALLER: &str = "installer";
pub const WAITING_FOR_OWNER: &str = "owner";

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Phase {
    Live,
    Handover,
    Unclaimed,
    FirstBoot,
    Installed,
}

impl Phase {
    pub fn name(self) -> &'static str {
        match self {
            Self::Live => "live",
            Self::Handover => "handover",
            Self::Unclaimed => "unclaimed",
            Self::FirstBoot => "first-boot",
            Self::Installed => "installed",
        }
    }
}

pub fn marker(state_dir: &Path) -> PathBuf {
    state_dir.join(PENDING)
}

pub fn unclaimed_marker(state_dir: &Path) -> PathBuf {
    state_dir.join(UNCLAIMED)
}

fn noted(marker: PathBuf) -> Option<String> {
    std::fs::read_to_string(marker)
        .ok()
        .map(|note| note.trim().to_owned())
        .filter(|note| !note.is_empty())
}

pub fn pending_user(state_dir: &Path) -> Option<String> {
    noted(marker(state_dir))
}

pub fn detect(state_dir: &Path) -> Phase {
    let command_line = std::fs::read_to_string("/proc/cmdline").unwrap_or_default();
    if command_line
        .split_whitespace()
        .any(|argument| argument == LIVE_ARGUMENT)
    {
        return Phase::Live;
    }
    match noted(unclaimed_marker(state_dir)).as_deref() {
        Some(WITH_INSTALLER) => Phase::Handover,
        Some(_) => Phase::Unclaimed,
        None if pending_user(state_dir).is_some() => Phase::FirstBoot,
        None => Phase::Installed,
    }
}
