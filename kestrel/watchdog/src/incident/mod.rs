pub mod collect;
pub mod efi;

use std::fs::{self, File};
use std::io::{self, Write};
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

pub const DIRECTORY: &str = "/var/lib/kestrel-watchdog/incidents";
const KEPT: usize = 10;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Restart {
    Graceful,
    Forced,
    Emergency,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Gpu {
    pub name: String,
    pub pci: String,
    pub driver: Option<String>,
    pub bar1_mib: Option<u64>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Action {
    FirmwareSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Suggestion {
    pub step: String,
    pub detail: String,
    pub action: Option<Action>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Incident {
    pub id: String,
    pub time: i64,
    pub boot_id: String,
    pub stalled_seconds: u64,
    pub evidence: Vec<String>,
    pub gpus: Vec<Gpu>,
    pub kernel: String,
    pub kernel_messages: Vec<String>,
    pub nvidia_smi: Option<String>,
    pub restart: Restart,
    pub suggestions: Vec<Suggestion>,
    pub boot_notice_done: bool,
}

impl Incident {
    pub fn path(&self) -> PathBuf {
        Path::new(DIRECTORY).join(format!("{}.json", self.id))
    }

    pub fn save(&self) -> io::Result<()> {
        fs::create_dir_all(DIRECTORY)?;
        let path = self.path();
        let partial = path.with_extension("json.new");
        let mut file = File::create(&partial)?;
        file.write_all(&serde_json::to_vec_pretty(self)?)?;
        file.sync_all()?;
        fs::rename(&partial, &path)?;
        File::open(DIRECTORY)?.sync_all()
    }
}

pub fn all() -> Vec<Incident> {
    let Ok(entries) = fs::read_dir(DIRECTORY) else {
        return Vec::new();
    };
    let mut incidents: Vec<Incident> = entries
        .flatten()
        .filter(|entry| {
            entry
                .path()
                .extension()
                .is_some_and(|extension| extension == "json")
        })
        .filter_map(|entry| serde_json::from_slice(&fs::read(entry.path()).ok()?).ok())
        .collect();
    incidents.sort_by_key(|incident| std::cmp::Reverse(incident.time));
    incidents
}

pub fn forget_old() {
    for incident in all().into_iter().skip(KEPT) {
        let _ = fs::remove_file(incident.path());
    }
}
