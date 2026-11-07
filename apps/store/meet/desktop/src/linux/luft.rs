use std::fs;
use std::process::Command;

use serde::Deserialize;
use specta::Type;

use crate::app::job::Failed;

const RELEASES: [&str; 2] = ["/etc/os-release", "/usr/lib/os-release"];

#[derive(Deserialize, Clone, Copy, Type)]
#[serde(rename = "LuftPage", rename_all = "camelCase")]
pub enum Page {
    Space,
    Updates,
}

impl Page {
    fn uri(self) -> &'static str {
        match self {
            Page::Space => "disks-luft:",
            Page::Updates => "kestrel-settings:system",
        }
    }
}

pub fn running() -> bool {
    RELEASES
        .iter()
        .find_map(|path| fs::read_to_string(path).ok())
        .is_some_and(|release| release.lines().any(|line| line.trim() == "ID=luft"))
}

pub fn open(page: Page) -> Result<(), Failed> {
    Command::new("xdg-open")
        .arg(page.uri())
        .spawn()
        .map(drop)
        .map_err(|error| Failed::from(error.to_string()))
}
