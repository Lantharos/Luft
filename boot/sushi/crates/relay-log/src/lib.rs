//! Structured and human-readable Relay boot logs.

use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use relay_core::{RelayEvent, RelayEventKind, RelayStage};
use serde::{Deserialize, Serialize};

static LOG_PATH: Mutex<Option<PathBuf>> = Mutex::new(None);

#[derive(Debug, Clone, Serialize, Deserialize)]
struct MachineLogEntry {
    stage: String,
    event: String,
    target: Option<String>,
    severity: String,
    timestamp_ns: u64,
}

pub fn init(path: impl AsRef<Path>) -> std::io::Result<()> {
    let path = path.as_ref().to_path_buf();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    *LOG_PATH.lock().unwrap() = Some(path);
    Ok(())
}

pub fn log_event(event: &RelayEvent) {
    let human = human_message(event);
    let machine = machine_entry(event);

    eprintln!("{human}");

    if let Ok(json) = serde_json::to_string(&machine) {
        append_line(&json);
    }
}

pub fn log_info(stage: RelayStage, message: impl AsRef<str>) {
    eprintln!("{}: {}", stage_name(stage), message.as_ref());
    let entry = MachineLogEntry {
        stage: stage_name(stage).to_string(),
        event: message.as_ref().to_string(),
        target: None,
        severity: "info".to_string(),
        timestamp_ns: relay_core::now_ns(),
    };
    if let Ok(json) = serde_json::to_string(&entry) {
        append_line(&json);
    }
}

pub fn load_events(path: impl AsRef<Path>) -> Vec<RelayEvent> {
    let Ok(data) = fs::read_to_string(path) else {
        return Vec::new();
    };
    data.lines()
        .filter_map(|line| {
            let entry: MachineLogEntry = serde_json::from_str(line).ok()?;
            parse_machine_entry(&entry)
        })
        .collect()
}

fn append_line(line: &str) {
    let guard = LOG_PATH.lock().unwrap();
    let Some(path) = guard.as_ref() else {
        return;
    };
    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
        let _ = writeln!(file, "{line}");
    }
}

fn stage_name(stage: RelayStage) -> &'static str {
    match stage {
        RelayStage::Bootloader => "RelayBoot",
        RelayStage::Initramfs => "Relay",
        RelayStage::DriverHandoff => "RelayDisplay",
        RelayStage::System => "RelaySystem",
        RelayStage::Greeter => "RelayGreeter",
    }
}

fn human_message(event: &RelayEvent) -> String {
    let prefix = stage_name(event.stage);
    let msg = match &event.kind {
        RelayEventKind::BootFirstFrame => "first frame drawn".to_string(),
        RelayEventKind::HandoffPrepare { target } => format!("preparing handoff to {target}"),
        RelayEventKind::HandoffBegin { target } => format!("handing off to {target}"),
        RelayEventKind::HandoffComplete { target } => format!("handoff complete ({target})"),
        RelayEventKind::UnlockTpmTry => "checking trust".to_string(),
        RelayEventKind::UnlockTpmSuccess => "TPM unlock succeeded".to_string(),
        RelayEventKind::UnlockManualRequired => "password needed".to_string(),
        RelayEventKind::UnlockManualFailed => "wrong key, try again".to_string(),
        RelayEventKind::DisplayBackendChanged { backend } => format!("display backend: {backend}"),
        RelayEventKind::DisplayDriverReady { device } => format!("native driver ready ({device})"),
        RelayEventKind::GreeterWaiting => "waiting for greeter".to_string(),
        RelayEventKind::GreeterReady => "greeter ready".to_string(),
        RelayEventKind::BootComplete => "boot complete".to_string(),
        RelayEventKind::BootDegraded { reason } => format!("boot degraded ({reason})"),
        RelayEventKind::BlackScreenDetected { duration_ms } => {
            format!("black screen detected ({duration_ms}ms)")
        }
        RelayEventKind::BlackScreenRestored { duration_ms } => {
            format!("scene restored ({duration_ms}ms)")
        }
        RelayEventKind::RecoveryEntered { reason } => format!("recovery needed ({reason})"),
    };
    format!("{prefix}: {msg}")
}

fn machine_entry(event: &RelayEvent) -> MachineLogEntry {
    let (event_name, target) = match &event.kind {
        RelayEventKind::BootFirstFrame => ("boot.first_frame".to_string(), None),
        RelayEventKind::HandoffPrepare { target } => ("handoff.prepare".to_string(), Some(target.clone())),
        RelayEventKind::HandoffBegin { target } => ("handoff.begin".to_string(), Some(target.clone())),
        RelayEventKind::HandoffComplete { target } => ("handoff.complete".to_string(), Some(target.clone())),
        RelayEventKind::UnlockTpmTry => ("unlock.tpm.try".to_string(), None),
        RelayEventKind::UnlockTpmSuccess => ("unlock.tpm.success".to_string(), None),
        RelayEventKind::UnlockManualRequired => ("unlock.manual.required".to_string(), None),
        RelayEventKind::UnlockManualFailed => ("unlock.manual.failed".to_string(), None),
        RelayEventKind::DisplayBackendChanged { backend } => {
            ("display.backend.changed".to_string(), Some(backend.clone()))
        }
        RelayEventKind::DisplayDriverReady { device } => {
            ("display.driver.ready".to_string(), Some(device.clone()))
        }
        RelayEventKind::GreeterWaiting => ("greeter.waiting".to_string(), None),
        RelayEventKind::GreeterReady => ("greeter.ready".to_string(), None),
        RelayEventKind::BootComplete => ("boot.complete".to_string(), None),
        RelayEventKind::BootDegraded { reason } => ("boot.degraded".to_string(), Some(reason.clone())),
        RelayEventKind::BlackScreenDetected { duration_ms } => {
            ("display.black_screen".to_string(), Some(duration_ms.to_string()))
        }
        RelayEventKind::BlackScreenRestored { duration_ms } => {
            ("display.black_screen.restored".to_string(), Some(duration_ms.to_string()))
        }
        RelayEventKind::RecoveryEntered { reason } => {
            ("recovery.entered".to_string(), Some(reason.clone()))
        }
    };

    let severity = match event.severity {
        relay_core::EventSeverity::Info => "info",
        relay_core::EventSeverity::Warning => "warning",
        relay_core::EventSeverity::Error => "error",
    };

    MachineLogEntry {
        stage: stage_name(event.stage).to_string(),
        event: event_name,
        target,
        severity: severity.to_string(),
        timestamp_ns: event.timestamp_ns,
    }
}

fn parse_machine_entry(entry: &MachineLogEntry) -> Option<RelayEvent> {
    let stage = match entry.stage.as_str() {
        "RelayBoot" => RelayStage::Bootloader,
        "Relay" | "RelayInitramfs" => RelayStage::Initramfs,
        "RelayDisplay" => RelayStage::DriverHandoff,
        "RelaySystem" => RelayStage::System,
        "RelayGreeter" => RelayStage::Greeter,
        _ => RelayStage::Initramfs,
    };

    let kind = match entry.event.as_str() {
        "boot.first_frame" => RelayEventKind::BootFirstFrame,
        "handoff.prepare" => RelayEventKind::HandoffPrepare {
            target: entry.target.clone().unwrap_or_default(),
        },
        "handoff.begin" => RelayEventKind::HandoffBegin {
            target: entry.target.clone().unwrap_or_default(),
        },
        "handoff.complete" => RelayEventKind::HandoffComplete {
            target: entry.target.clone().unwrap_or_default(),
        },
        "unlock.tpm.try" => RelayEventKind::UnlockTpmTry,
        "unlock.tpm.success" => RelayEventKind::UnlockTpmSuccess,
        "unlock.manual.required" => RelayEventKind::UnlockManualRequired,
        "unlock.manual.failed" => RelayEventKind::UnlockManualFailed,
        "display.backend.changed" => RelayEventKind::DisplayBackendChanged {
            backend: entry.target.clone().unwrap_or_default(),
        },
        "display.driver.ready" => RelayEventKind::DisplayDriverReady {
            device: entry.target.clone().unwrap_or_default(),
        },
        "boot.complete" => RelayEventKind::BootComplete,
        "boot.degraded" => RelayEventKind::BootDegraded {
            reason: entry.target.clone().unwrap_or_default(),
        },
        "display.black_screen" => RelayEventKind::BlackScreenDetected {
            duration_ms: entry.target.as_ref().and_then(|s| s.parse().ok()).unwrap_or(0),
        },
        "display.black_screen.restored" => RelayEventKind::BlackScreenRestored {
            duration_ms: entry.target.as_ref().and_then(|s| s.parse().ok()).unwrap_or(0),
        },
        "recovery.entered" => RelayEventKind::RecoveryEntered {
            reason: entry.target.clone().unwrap_or_default(),
        },
        other => RelayEventKind::BootDegraded {
            reason: other.to_string(),
        },
    };

    let severity = match entry.severity.as_str() {
        "warning" => relay_core::EventSeverity::Warning,
        "error" => relay_core::EventSeverity::Error,
        _ => relay_core::EventSeverity::Info,
    };

    Some(RelayEvent {
        stage,
        kind,
        severity,
        timestamp_ns: entry.timestamp_ns,
    })
}