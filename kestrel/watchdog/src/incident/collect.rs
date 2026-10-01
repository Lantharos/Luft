use std::path::Path;
use std::time::Duration;

use tokio::process::Command;

use super::{Incident, Restart};
use crate::system::{gpu, output_within, read_trimmed};

const NVIDIA_SMI: &str = "/usr/bin/nvidia-smi";
const NVIDIA_SMI_LIMIT: Duration = Duration::from_secs(5);

pub fn build(
    stalled_seconds: u64,
    evidence: Vec<String>,
    kernel_messages: Vec<String>,
) -> Incident {
    let time = jiff::Timestamp::now();
    Incident {
        id: time.strftime("%Y%m%dT%H%M%SZ").to_string(),
        time: time.as_second(),
        boot_id: read_trimmed("/proc/sys/kernel/random/boot_id"),
        stalled_seconds,
        evidence,
        gpus: gpu::describe(),
        kernel: read_trimmed("/proc/sys/kernel/osrelease"),
        kernel_messages,
        nvidia_smi: None,
        restart: Restart::Graceful,
        suggestions: Vec::new(),
        boot_notice_done: false,
    }
}

pub async fn nvidia_smi() -> Option<String> {
    if !Path::new(NVIDIA_SMI).exists() {
        return None;
    }
    output_within(Command::new(NVIDIA_SMI).arg("-q"), NVIDIA_SMI_LIMIT).await
}
