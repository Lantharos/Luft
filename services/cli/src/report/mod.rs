//! A bug report bundle: everything that helps find a problem, in one text
//! file, with the names of the people here, the computer's name, email
//! addresses and paths in home folders taken out. Nothing is sent anywhere.

mod crashes;
mod hardware;

use std::fmt::Write;
use std::path::PathBuf;
use std::process::Stdio;

use luft_crash_report::Scrubber;

use crate::bus;
use crate::failure::{Failure, Outcome};
use crate::logs::{self, Part};
use crate::output::Output;
use crate::status;

const LINES: u32 = 300;
const PARTS: [(Part, &str); 9] = [
    (Part::Kestrel, "Kestrel"),
    (Part::DesktopSettings, "Kestrel's settings service"),
    (Part::Updater, "Updates"),
    (Part::Packages, "System packages"),
    (Part::Keyring, "Luft Keyring"),
    (Part::Firewall, "Firewall"),
    (Part::Trust, "Secure Boot, the TPM and encryption"),
    (Part::Crashes, "Crash reports"),
    (Part::Changes, "Reviewed changes"),
];

fn logs_of(part: Part) -> String {
    let mut command = logs::journalctl(&part.units(), None, LINES, false, false);
    command.arg("--boot").stderr(Stdio::null());
    command
        .output()
        .ok()
        .map(|output| String::from_utf8_lossy(&output.stdout).into_owned())
        .filter(|text| !text.trim().is_empty())
        .unwrap_or_else(|| {
            "Nothing logged since the computer started, or no permission to read it.\n".to_owned()
        })
}

fn bundle(status: &status::Status) -> String {
    let mut text = String::new();
    let now = glib::DateTime::now_local()
        .ok()
        .and_then(|now| now.format("%Y-%m-%d %H:%M").ok())
        .map(|now| now.to_string())
        .unwrap_or_default();
    let _ = writeln!(text, "Luft report, made {now}\n");
    let _ = writeln!(text, "## Luft\n{}", status::words(status));
    let _ = writeln!(text, "## Hardware\n{}", hardware::summary());
    let _ = writeln!(text, "## Crashes\n{}", crashes::summary());
    for (part, title) in PARTS {
        let _ = writeln!(text, "## {title}\n{}", logs_of(part));
    }
    Scrubber::for_this_computer().text(&text, usize::MAX)
}

fn destination(output: Option<PathBuf>) -> Outcome<PathBuf> {
    if let Some(output) = output {
        return Ok(output);
    }
    let stamp = glib::DateTime::now_local()
        .ok()
        .and_then(|now| now.format("%Y%m%d-%H%M").ok())
        .map(|stamp| stamp.to_string())
        .unwrap_or_default();
    dirs::home_dir()
        .map(|home| home.join(format!("luft-report-{stamp}.txt")))
        .ok_or_else(|| Failure::failed("There's no home folder to save the report in."))
}

/// Writes the bundle to `path`, or a new file in the home folder.
pub fn save(path: Option<PathBuf>, status: &status::Status) -> Outcome<PathBuf> {
    let path = destination(path)?;
    std::fs::write(&path, bundle(status))
        .map_err(|error| Failure::failed(format!("{}: {error}", path.display())))?;
    Ok(path)
}

pub fn run(output_path: Option<PathBuf>, output: Output) -> Outcome {
    let status = bus::block_on(status::gather())?;
    let path = save(output_path, &status)?;
    output.show(&serde_json::json!({ "report": path }), || {
        format!("Saved the report to {}. Look it over, then attach it to your bug report; nothing was sent.", path.display())
    })
}
