use std::fs::{self, File};
use std::io;

use rustix::fs::{IFlags, ioctl_getflags, ioctl_setflags};
use serde::{Deserialize, Serialize};

use super::{Gpu, Incident, Restart};

const VARIABLE: &str =
    "/sys/firmware/efi/efivars/KestrelIncident-7c76aa96-2f21-43b3-bab7-9df34b8d3c49";
const NON_VOLATILE_BOOT_AND_RUNTIME: u32 = 0x7;
const EVIDENCE_KEPT: usize = 3;
const EVIDENCE_LENGTH: usize = 160;

#[derive(Serialize, Deserialize)]
struct Summary {
    id: String,
    time: i64,
    boot_id: String,
    stalled_seconds: u64,
    evidence: Vec<String>,
    gpus: Vec<Gpu>,
    kernel: String,
}

fn make_mutable() {
    if let Ok(file) = File::open(VARIABLE)
        && let Ok(flags) = ioctl_getflags(&file)
    {
        let _ = ioctl_setflags(&file, flags - IFlags::IMMUTABLE);
    }
}

pub fn save(incident: &Incident) -> io::Result<()> {
    let summary = Summary {
        id: incident.id.clone(),
        time: incident.time,
        boot_id: incident.boot_id.clone(),
        stalled_seconds: incident.stalled_seconds,
        evidence: incident
            .evidence
            .iter()
            .take(EVIDENCE_KEPT)
            .map(|line| line.chars().take(EVIDENCE_LENGTH).collect())
            .collect(),
        gpus: incident.gpus.clone(),
        kernel: incident.kernel.clone(),
    };
    let mut contents = NON_VOLATILE_BOOT_AND_RUNTIME.to_le_bytes().to_vec();
    contents.extend(serde_json::to_vec(&summary)?);
    make_mutable();
    fs::write(VARIABLE, contents)
}

pub fn forget() {
    make_mutable();
    if let Err(error) = fs::remove_file(VARIABLE) {
        eprintln!("Couldn't clear the saved incident from the firmware: {error}");
    }
}

pub fn load() -> Option<Incident> {
    let contents = fs::read(VARIABLE).ok()?;
    let summary: Summary = serde_json::from_slice(contents.get(4..)?).ok()?;
    Some(Incident {
        id: summary.id,
        time: summary.time,
        boot_id: summary.boot_id,
        stalled_seconds: summary.stalled_seconds,
        evidence: summary.evidence,
        gpus: summary.gpus,
        kernel: summary.kernel,
        kernel_messages: Vec::new(),
        nvidia_smi: None,
        restart: Restart::Graceful,
        suggestions: Vec::new(),
        boot_notice_done: false,
    })
}
