//! Reading the journal through `journalctl`, asking only for the fields a
//! report is made from: never a crashed program's environment, command
//! line, open files or memory.

use std::collections::HashMap;
use std::process::Command;

use anyhow::{Context, bail};
use serde_json::Value;

pub const COREDUMP: &str = "fc2e22bc6ee647b6b90729ab34a250b1";
pub const CURSOR: &str = "__CURSOR";
pub const TIME: &str = "__REALTIME_TIMESTAMP";

const CRASH_FIELDS: &str = "MESSAGE,MESSAGE_ID,_BOOT_ID,_PID,_UID,_EXE,_SYSTEMD_CGROUP,\
COREDUMP_EXE,COREDUMP_PID,COREDUMP_UID,COREDUMP_SIGNAL_NAME,COREDUMP_TIMESTAMP,COREDUMP_CGROUP,\
COREDUMP_CONTAINER_CMDLINE,COREDUMP_PACKAGE_JSON,COREDUMP_PROC_MAPS,\
LUFT_PANIC_MESSAGE,LUFT_PANIC_LOCATION,LUFT_PANIC_PROGRAM,LUFT_PANIC_BUILD_ID,LUFT_PANIC_FRAMES";

pub struct Entry(HashMap<String, String>);

impl Entry {
    pub fn get(&self, field: &str) -> Option<&str> {
        self.0.get(field).map(String::as_str)
    }

    pub fn number(&self, field: &str) -> Option<u64> {
        self.get(field)?.parse().ok()
    }
}

fn text(value: &Value) -> Option<String> {
    match value {
        Value::String(text) => Some(text.clone()),
        Value::Array(items) if items.iter().all(Value::is_u64) => {
            let bytes: Vec<u8> = items
                .iter()
                .filter_map(Value::as_u64)
                .filter_map(|byte| u8::try_from(byte).ok())
                .collect();
            Some(String::from_utf8_lossy(&bytes).into_owned())
        }
        Value::Array(items) => items.first().and_then(text),
        _ => None,
    }
}

fn entry(line: &str) -> Option<Entry> {
    let Value::Object(fields) = serde_json::from_str(line).ok()? else {
        return None;
    };
    Some(Entry(
        fields
            .iter()
            .filter_map(|(name, value)| Some((name.clone(), text(value)?)))
            .collect(),
    ))
}

fn read(arguments: &[String]) -> anyhow::Result<Vec<Entry>> {
    let output = Command::new("journalctl")
        .args(["--all", "--quiet", "--no-pager", "--output=json"])
        .args(arguments)
        .output()
        .context("journalctl couldn't start")?;
    if !output.status.success() {
        bail!(
            "journalctl failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        );
    }
    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter_map(entry)
        .collect())
}

/// Core dumps and panics after `cursor`, or since this start of the
/// computer when nothing was read before.
pub fn crashes(cursor: Option<&str>) -> anyhow::Result<Vec<Entry>> {
    let mut arguments = vec![format!("--output-fields={CRASH_FIELDS}")];
    arguments.push(cursor.map_or_else(
        || "--boot".into(),
        |cursor| format!("--after-cursor={cursor}"),
    ));
    arguments.push(format!("MESSAGE_ID={COREDUMP}"));
    arguments.push(format!("MESSAGE_ID={}", luft_dbus::panics::MESSAGE_ID));
    read(&arguments)
}

/// Where the journal ends now, for a first look that found nothing.
pub fn end() -> anyhow::Result<Option<String>> {
    Ok(
        read(&["--lines=1".into(), "--output-fields=MESSAGE_ID".into()])?
            .first()
            .and_then(|entry| entry.get(CURSOR))
            .map(str::to_owned),
    )
}

/// The uncaught errors and unhandled promise rejections Kestrel marked in
/// the journal for one of its processes.
pub fn script_errors(boot: &str, pid: u64) -> anyhow::Result<Vec<Entry>> {
    read(&[
        "--output-fields=MESSAGE".into(),
        format!("_BOOT_ID={boot}"),
        format!("_PID={pid}"),
        "KESTREL_SCRIPT_ERROR=1".into(),
    ])
}
