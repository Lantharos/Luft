//! Relay boot diagnostics CLI.

use std::fs;
use std::path::PathBuf;

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use relay_core::{RELAY_LOG_DIR, RELAY_RUN_DIR};
use relay_log;
use relay_protocol::{load_state, BootDiagnostics, ContinuityStatus};

#[derive(Parser)]
#[command(name = "relayctl", version, about = "Relay boot continuity diagnostics")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Status,
    Log,
    Diagnose,
    Handoffs,
    ExportDiagnostics {
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Status => cmd_status(),
        Commands::Log => cmd_log(),
        Commands::Diagnose => cmd_diagnose(),
        Commands::Handoffs => cmd_handoffs(),
        Commands::ExportDiagnostics { output } => cmd_export(output),
    }
}

fn cmd_status() -> Result<()> {
    let state = load_state();
    let log_path = boot_log_path();
    let events = relay_log::load_events(&log_path);
    let boot_id = state
        .as_ref()
        .map(|s| s.boot_id.to_string())
        .unwrap_or_else(|| "unknown".to_string());
    let diag = BootDiagnostics::from_events(events, boot_id);

    println!("Relay status");
    println!("  continuity: {:?}", diag.continuity);
    println!("  boot id: {}", diag.boot_id);
    if let Some(state) = state {
        println!("  stage: {:?}", state.stage);
        println!("  mode: {:?}", state.mode);
        println!("  display: {}x{}", state.width, state.height);
        println!("  backend flags: {:?}", state.flags);
    } else {
        println!("  state: not available");
    }
    Ok(())
}

fn cmd_log() -> Result<()> {
    let events = relay_log::load_events(boot_log_path());
    if events.is_empty() {
        println!("No relay boot log found.");
        return Ok(());
    }
    for event in events {
        println!("{}", human_line(&event));
    }
    Ok(())
}

fn cmd_diagnose() -> Result<()> {
    let log_path = boot_log_path();
    let events = relay_log::load_events(&log_path);
    let boot_id = load_state()
        .map(|s| s.boot_id.to_string())
        .unwrap_or_else(|| "unknown".to_string());
    let diag = BootDiagnostics::from_events(events.clone(), boot_id);

    println!("Relay diagnosis\n");
    println!(
        "Boot continuity: {}",
        match diag.continuity {
            ContinuityStatus::Good => "good",
            ContinuityStatus::Degraded => "degraded",
            ContinuityStatus::Failed => "failed",
        }
    );
    if let Some(ms) = diag.first_frame_ms {
        println!("First frame: {ms}ms");
    }
    println!("Visual handoffs: {}", diag.visual_handoffs);
    println!("Failed handoffs: {}", diag.failed_handoffs);
    println!("Black-screen events: {}", diag.black_screen_events);

    if let Some(problem) = find_primary_problem(&events) {
        println!("\nProblem:\n{problem}");
    }
    if let Some(recovery) = find_recovery(&events) {
        println!("\nRecovery:\n{recovery}");
    }
    if let Some(suggestion) = suggest(&diag) {
        println!("\nSuggestion:\n{suggestion}");
    }
    Ok(())
}

fn cmd_handoffs() -> Result<()> {
    let events = relay_log::load_events(boot_log_path());
    for event in events {
        if matches!(
            event.kind,
            relay_core::RelayEventKind::HandoffBegin { .. }
                | relay_core::RelayEventKind::HandoffComplete { .. }
                | relay_core::RelayEventKind::HandoffPrepare { .. }
                | relay_core::RelayEventKind::DisplayBackendChanged { .. }
        ) {
            println!("{}", human_line(&event));
        }
    }
    Ok(())
}

fn cmd_export(output: Option<PathBuf>) -> Result<()> {
    let log_path = boot_log_path();
    let events = relay_log::load_events(&log_path);
    let boot_id = load_state()
        .map(|s| s.boot_id.to_string())
        .unwrap_or_else(|| "unknown".to_string());
    let diag = BootDiagnostics::from_events(events, boot_id);
    let json = serde_json::to_string_pretty(&diag).context("serialize diagnostics")?;
    match output {
        Some(path) => {
            fs::write(&path, json).with_context(|| format!("write {}", path.display()))?;
            println!("Exported diagnostics to {}", path.display());
        }
        None => println!("{json}"),
    }
    Ok(())
}

fn boot_log_path() -> PathBuf {
    let run_log = format!("{RELAY_RUN_DIR}/boot.log");
    if PathBuf::from(&run_log).exists() {
        return PathBuf::from(run_log);
    }
    PathBuf::from(format!("{RELAY_LOG_DIR}/boot.log"))
}

fn human_line(event: &relay_core::RelayEvent) -> String {
    match &event.kind {
        relay_core::RelayEventKind::BootFirstFrame => "Relay: first frame drawn".to_string(),
        relay_core::RelayEventKind::HandoffPrepare { target } => {
            format!("RelayDisplay: preparing handoff to {target}")
        }
        relay_core::RelayEventKind::HandoffBegin { target } => {
            format!("RelayDisplay: handing off to {target}")
        }
        relay_core::RelayEventKind::HandoffComplete { target } => {
            format!("RelayDisplay: handoff complete ({target})")
        }
        relay_core::RelayEventKind::DisplayBackendChanged { backend } => {
            format!("RelayDisplay: display backend {backend}")
        }
        relay_core::RelayEventKind::BlackScreenDetected { duration_ms } => {
            format!("RelayDisplay: black screen detected ({duration_ms}ms)")
        }
        relay_core::RelayEventKind::BlackScreenRestored { duration_ms } => {
            format!("RelayDisplay: scene restored ({duration_ms}ms)")
        }
        relay_core::RelayEventKind::BootDegraded { reason } => {
            format!("Relay: boot degraded ({reason})")
        }
        relay_core::RelayEventKind::RecoveryEntered { reason } => {
            format!("Relay: recovery needed ({reason})")
        }
        other => format!("{other:?}"),
    }
}

fn find_primary_problem(events: &[relay_core::RelayEvent]) -> Option<String> {
    events.iter().rev().find_map(|e| match &e.kind {
        relay_core::RelayEventKind::BootDegraded { reason } => Some(reason.clone()),
        relay_core::RelayEventKind::BlackScreenDetected { .. } => {
            Some("Native GPU driver reset the display during handoff.".to_string())
        }
        relay_core::RelayEventKind::RecoveryEntered { reason } => Some(reason.clone()),
        _ => None,
    })
}

fn find_recovery(events: &[relay_core::RelayEvent]) -> Option<String> {
    events.iter().rev().find_map(|e| match &e.kind {
        relay_core::RelayEventKind::BlackScreenRestored { duration_ms } => {
            Some(format!("Relay restored the scene after {duration_ms}ms."))
        }
        _ => None,
    })
}

fn suggest(diag: &BootDiagnostics) -> Option<String> {
    if diag.black_screen_events > 0 {
        return Some(
            "Load the native graphics driver earlier in initramfs.".to_string(),
        );
    }
    if diag.continuity == ContinuityStatus::Degraded {
        return Some("Review relayctl handoffs and verify relayd started before cryptsetup.".to_string());
    }
    None
}