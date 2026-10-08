use std::fs;

use luft_app::dbus;
use serde::{Deserialize, Serialize};
use zbus::blocking::Proxy;

const INCIDENTS: &str = "/var/lib/kestrel-watchdog/incidents";

#[derive(Deserialize, Serialize)]
pub struct Suggestion {
    step: String,
    detail: String,
    action: Option<String>,
}

#[derive(Deserialize)]
struct Gpu {
    name: String,
}

#[derive(Deserialize)]
struct Incident {
    id: String,
    time: i64,
    restart: String,
    gpus: Vec<Gpu>,
    evidence: Vec<String>,
    suggestions: Vec<Suggestion>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Problem {
    id: String,
    time: i64,
    restart: String,
    graphics: Vec<String>,
    evidence: Vec<String>,
    suggestions: Vec<Suggestion>,
}

pub fn problems() -> Result<Vec<Problem>, String> {
    let Ok(entries) = fs::read_dir(INCIDENTS) else {
        return Ok(Vec::new());
    };
    let mut problems: Vec<Problem> = entries
        .flatten()
        .filter(|entry| {
            entry
                .path()
                .extension()
                .is_some_and(|extension| extension == "json")
        })
        .filter_map(|entry| serde_json::from_slice::<Incident>(&fs::read(entry.path()).ok()?).ok())
        .map(|incident| Problem {
            id: incident.id,
            time: incident.time,
            restart: incident.restart,
            graphics: incident.gpus.into_iter().map(|gpu| gpu.name).collect(),
            evidence: incident.evidence,
            suggestions: incident.suggestions,
        })
        .collect();
    problems.sort_by_key(|problem| std::cmp::Reverse(problem.time));
    Ok(problems)
}

pub fn restart_to_firmware() -> Result<(), String> {
    let login = Proxy::new(
        dbus::system()?,
        "org.freedesktop.login1",
        "/org/freedesktop/login1",
        "org.freedesktop.login1.Manager",
    )
    .map_err(|error| error.to_string())?;
    login
        .call_method("SetRebootToFirmwareSetup", &(true,))
        .and_then(|_| login.call_method("Reboot", &(true,)))
        .map(|_| ())
        .map_err(|error| error.to_string())
}
