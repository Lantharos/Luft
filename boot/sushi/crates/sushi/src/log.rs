//! Structured and human-readable Sushi boot logs.

use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use crate::core::{SushiEvent, SushiEventKind, SushiStage};
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

pub fn log_event(event: &SushiEvent) {
    let human = human_message(event);
    let machine = machine_entry(event);

    if !logging_to_file() {
        eprintln!("{human}");
    }

    if let Ok(json) = serde_json::to_string(&machine) {
        append_line(&json);
    }
}

pub fn log_info(stage: SushiStage, message: impl AsRef<str>) {
    if !logging_to_file() {
        eprintln!("{}: {}", stage_name(stage), message.as_ref());
    }
    let entry = MachineLogEntry {
        stage: stage_name(stage).to_string(),
        event: message.as_ref().to_string(),
        target: None,
        severity: "info".to_string(),
        timestamp_ns: crate::core::now_ns(),
    };
    if let Ok(json) = serde_json::to_string(&entry) {
        append_line(&json);
    }
}

pub fn tail_human_lines(path: impl AsRef<Path>, max_lines: usize) -> Vec<String> {
    let Ok(data) = fs::read_to_string(path.as_ref()) else {
        return Vec::new();
    };
    let mut lines = Vec::new();
    for line in data.lines() {
        if let Ok(entry) = serde_json::from_str::<MachineLogEntry>(line) {
            let stage = entry.stage;
            let event = if let Some(target) = entry.target.filter(|t| !t.is_empty()) {
                format!("{} ({target})", entry.event)
            } else {
                entry.event
            };
            lines.push(format!("{stage}: {event}"));
        } else if !line.trim().is_empty() {
            lines.push(line.trim().to_string());
        }
    }
    if lines.len() > max_lines {
        lines.split_off(lines.len() - max_lines)
    } else {
        lines
    }
}

pub fn boot_log_path(run_dir: &str) -> PathBuf {
    PathBuf::from(run_dir).join("boot.log")
}

pub fn load_events(path: impl AsRef<Path>) -> Vec<SushiEvent> {
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

fn logging_to_file() -> bool {
    LOG_PATH.lock().unwrap().is_some()
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

fn stage_name(stage: SushiStage) -> &'static str {
    match stage {
        SushiStage::Bootloader => "SushiBoot",
        SushiStage::Initramfs => "Sushi",
        SushiStage::DriverHandoff => "SushiDisplay",
        SushiStage::System => "SushiSystem",
        SushiStage::Greeter => "SushiGreeter",
    }
}

fn human_message(event: &SushiEvent) -> String {
    let prefix = stage_name(event.stage);
    let msg = match &event.kind {
        SushiEventKind::BootFirstFrame => match event.stage {
            SushiStage::Bootloader => "first frame is up".to_string(),
            _ => "caught the frame".to_string(),
        },
        SushiEventKind::HandoffPrepare { target } => match event.stage {
            SushiStage::Bootloader | SushiStage::DriverHandoff => "handing off!".to_string(),
            _ => format!("preparing handoff to {target}"),
        },
        SushiEventKind::HandoffBegin { target } => match event.stage {
            SushiStage::Bootloader | SushiStage::DriverHandoff => "handing off!".to_string(),
            _ => format!("handing off to {target}"),
        },
        SushiEventKind::HandoffComplete { target } => format!("handoff complete ({target})"),
        SushiEventKind::UnlockTpmTry => "checking trust".to_string(),
        SushiEventKind::UnlockTpmSuccess => "TPM said yes".to_string(),
        SushiEventKind::UnlockManualRequired => "password needed".to_string(),
        SushiEventKind::UnlockManualFailed => "wrong key, try again".to_string(),
        SushiEventKind::DisplayBackendChanged { backend } => format!("display backend: {backend}"),
        SushiEventKind::DisplayDriverReady { .. } => "matching the frame".to_string(),
        SushiEventKind::GreeterWaiting => "waiting for greeter".to_string(),
        SushiEventKind::GreeterReady => "greeter ready".to_string(),
        SushiEventKind::BootComplete => "boot complete".to_string(),
        SushiEventKind::BootDegraded { reason } => format!("boot degraded ({reason})"),
        SushiEventKind::BlackScreenDetected { duration_ms } => {
            format!("black screen detected ({duration_ms}ms)")
        }
        SushiEventKind::BlackScreenRestored { duration_ms } => {
            format!("scene restored ({duration_ms}ms)")
        }
        SushiEventKind::RecoveryEntered { reason } => format!("recovery needed ({reason})"),
        SushiEventKind::UnlockTpmReseal => "resealing TPM secret".to_string(),
        SushiEventKind::UnlockTpmResealSuccess => "TPM reseal complete".to_string(),
        SushiEventKind::UnlockTpmResealFailed { reason } => format!("TPM reseal failed ({reason})"),
        SushiEventKind::DebugOverlayToggled { visible } => {
            if *visible {
                "debug log shown (F1)".to_string()
            } else {
                "debug log hidden (F1)".to_string()
            }
        }
    };
    format!("{prefix}: {msg}")
}

fn machine_entry(event: &SushiEvent) -> MachineLogEntry {
    let (event_name, target) = match &event.kind {
        SushiEventKind::BootFirstFrame => ("boot.first_frame".to_string(), None),
        SushiEventKind::HandoffPrepare { target } => ("handoff.prepare".to_string(), Some(target.clone())),
        SushiEventKind::HandoffBegin { target } => ("handoff.begin".to_string(), Some(target.clone())),
        SushiEventKind::HandoffComplete { target } => ("handoff.complete".to_string(), Some(target.clone())),
        SushiEventKind::UnlockTpmTry => ("unlock.tpm.try".to_string(), None),
        SushiEventKind::UnlockTpmSuccess => ("unlock.tpm.success".to_string(), None),
        SushiEventKind::UnlockManualRequired => ("unlock.manual.required".to_string(), None),
        SushiEventKind::UnlockManualFailed => ("unlock.manual.failed".to_string(), None),
        SushiEventKind::DisplayBackendChanged { backend } => {
            ("display.backend.changed".to_string(), Some(backend.clone()))
        }
        SushiEventKind::DisplayDriverReady { device } => {
            ("display.driver.ready".to_string(), Some(device.clone()))
        }
        SushiEventKind::GreeterWaiting => ("greeter.waiting".to_string(), None),
        SushiEventKind::GreeterReady => ("greeter.ready".to_string(), None),
        SushiEventKind::BootComplete => ("boot.complete".to_string(), None),
        SushiEventKind::BootDegraded { reason } => ("boot.degraded".to_string(), Some(reason.clone())),
        SushiEventKind::BlackScreenDetected { duration_ms } => {
            ("display.black_screen".to_string(), Some(duration_ms.to_string()))
        }
        SushiEventKind::BlackScreenRestored { duration_ms } => {
            ("display.black_screen.restored".to_string(), Some(duration_ms.to_string()))
        }
        SushiEventKind::RecoveryEntered { reason } => {
            ("recovery.entered".to_string(), Some(reason.clone()))
        }
        SushiEventKind::UnlockTpmReseal => ("unlock.tpm.reseal".to_string(), None),
        SushiEventKind::UnlockTpmResealSuccess => ("unlock.tpm.reseal.success".to_string(), None),
        SushiEventKind::UnlockTpmResealFailed { reason } => {
            ("unlock.tpm.reseal.failed".to_string(), Some(reason.clone()))
        }
        SushiEventKind::DebugOverlayToggled { visible } => {
            ("debug.overlay".to_string(), Some(visible.to_string()))
        }
    };

    let severity = match event.severity {
        crate::core::EventSeverity::Info => "info",
        crate::core::EventSeverity::Warning => "warning",
        crate::core::EventSeverity::Error => "error",
    };

    MachineLogEntry {
        stage: stage_name(event.stage).to_string(),
        event: event_name,
        target,
        severity: severity.to_string(),
        timestamp_ns: event.timestamp_ns,
    }
}

fn parse_machine_entry(entry: &MachineLogEntry) -> Option<SushiEvent> {
    let stage = match entry.stage.as_str() {
        "SushiBoot" => SushiStage::Bootloader,
        "Sushi" => SushiStage::Initramfs,
        "SushiDisplay" => SushiStage::DriverHandoff,
        "SushiSystem" => SushiStage::System,
        "SushiGreeter" => SushiStage::Greeter,
        _ => SushiStage::Initramfs,
    };

    let kind = match entry.event.as_str() {
        "boot.first_frame" => SushiEventKind::BootFirstFrame,
        "handoff.prepare" => SushiEventKind::HandoffPrepare {
            target: entry.target.clone().unwrap_or_default(),
        },
        "handoff.begin" => SushiEventKind::HandoffBegin {
            target: entry.target.clone().unwrap_or_default(),
        },
        "handoff.complete" => SushiEventKind::HandoffComplete {
            target: entry.target.clone().unwrap_or_default(),
        },
        "unlock.tpm.try" => SushiEventKind::UnlockTpmTry,
        "unlock.tpm.success" => SushiEventKind::UnlockTpmSuccess,
        "unlock.manual.required" => SushiEventKind::UnlockManualRequired,
        "unlock.manual.failed" => SushiEventKind::UnlockManualFailed,
        "display.backend.changed" => SushiEventKind::DisplayBackendChanged {
            backend: entry.target.clone().unwrap_or_default(),
        },
        "display.driver.ready" => SushiEventKind::DisplayDriverReady {
            device: entry.target.clone().unwrap_or_default(),
        },
        "boot.complete" => SushiEventKind::BootComplete,
        "boot.degraded" => SushiEventKind::BootDegraded {
            reason: entry.target.clone().unwrap_or_default(),
        },
        "display.black_screen" => SushiEventKind::BlackScreenDetected {
            duration_ms: entry.target.as_ref().and_then(|s| s.parse().ok()).unwrap_or(0),
        },
        "display.black_screen.restored" => SushiEventKind::BlackScreenRestored {
            duration_ms: entry.target.as_ref().and_then(|s| s.parse().ok()).unwrap_or(0),
        },
        "recovery.entered" => SushiEventKind::RecoveryEntered {
            reason: entry.target.clone().unwrap_or_default(),
        },
        "unlock.tpm.reseal" => SushiEventKind::UnlockTpmReseal,
        "unlock.tpm.reseal.success" => SushiEventKind::UnlockTpmResealSuccess,
        "unlock.tpm.reseal.failed" => SushiEventKind::UnlockTpmResealFailed {
            reason: entry.target.clone().unwrap_or_default(),
        },
        "debug.overlay" => SushiEventKind::DebugOverlayToggled {
            visible: entry.target.as_deref() == Some("true"),
        },
        other => SushiEventKind::BootDegraded {
            reason: other.to_string(),
        },
    };

    let severity = match entry.severity.as_str() {
        "warning" => crate::core::EventSeverity::Warning,
        "error" => crate::core::EventSeverity::Error,
        _ => crate::core::EventSeverity::Info,
    };

    Some(SushiEvent {
        stage,
        kind,
        severity,
        timestamp_ns: entry.timestamp_ns,
    })
}