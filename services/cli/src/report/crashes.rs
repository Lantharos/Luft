//! What crashed lately: the crash reports waiting for an answer or to be
//! sent, which were scrubbed when they were made, and the programs the
//! journal saw crash.

use std::fmt::Write;

use serde::Deserialize;

use crate::logs::{self, Units};

const STATE: &str = "luft-crash-reports/state.json";
const COREDUMP: &str = "MESSAGE_ID=fc2e22bc6ee647b6b90729ab34a250b1";

#[derive(Deserialize, Default)]
struct Saved {
    #[serde(default)]
    waiting: Vec<Crash>,
    #[serde(default)]
    queue: Vec<Crash>,
}

#[derive(Deserialize)]
struct Crash {
    at: u64,
    report: Report,
}

#[derive(Deserialize)]
struct Report {
    program: String,
    summary: String,
    signature: String,
}

fn reports() -> Vec<Crash> {
    let saved: Saved = dirs::state_dir()
        .and_then(|state| std::fs::read_to_string(state.join(STATE)).ok())
        .and_then(|text| serde_json::from_str(&text).ok())
        .unwrap_or_default();
    saved.waiting.into_iter().chain(saved.queue).collect()
}

fn dumped() -> Vec<String> {
    let mut command = logs::journalctl(
        &Units {
            system: Vec::new(),
            user: Vec::new(),
        },
        Some("-7d"),
        50,
        false,
        true,
    );
    command.arg(COREDUMP);
    let mut found = Vec::new();
    let _ = logs::read(
        command,
        |_| true,
        |line| {
            found.push(format!(
                "{} {}",
                line.time.unwrap_or_default(),
                line.message
            ))
        },
    );
    found
}

pub fn summary() -> String {
    let mut text = String::new();
    for crash in reports() {
        let _ = writeln!(
            text,
            "{} {}: {} [{}]",
            crash.at, crash.report.program, crash.report.summary, crash.report.signature
        );
    }
    for line in dumped() {
        let _ = writeln!(text, "{line}");
    }
    if text.is_empty() {
        text.push_str("No crashes in the last week.\n");
    }
    text
}
