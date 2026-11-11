use std::path::Path;

use crate::report::{Frame, Kind, Report};
use crate::scrub::Scrubber;
use crate::signature::{self, Failure};
use crate::system;

const APPS: &str = "/usr/lib/sabine/";
const LONGEST_MESSAGE: usize = 1000;
const LONGEST_LINE: usize = 300;
const LONGEST_SUMMARY: usize = 120;
const MOST_FRAMES: usize = 32;
const MOST_SCRIPT_FRAMES: usize = 20;

/// What the collector found out about one crash, before it is scrubbed.
pub struct Details {
    pub program: String,
    pub build: Option<String>,
    pub kind: Kind,
    pub signal: Option<String>,
    pub message: Option<String>,
    pub location: Option<String>,
    pub frames: Vec<Frame>,
    pub script: Vec<String>,
}

/// The name a report gives a program: the app ID of one of Luft's apps, the
/// file name of anything else.
pub fn program_name(program: &Path) -> String {
    match program.strip_prefix(APPS) {
        Ok(app) => app
            .iter()
            .next()
            .map(|id| id.to_string_lossy().into_owned()),
        Err(_) => program
            .file_name()
            .map(|name| name.to_string_lossy().into_owned()),
    }
    .unwrap_or_default()
}

fn summary(report: &Report) -> String {
    let summary = match report.kind {
        Kind::Script => report
            .message
            .as_deref()
            .and_then(|message| message.lines().next())
            .unwrap_or("")
            .to_owned(),
        Kind::Panic => format!(
            "Panicked at {}",
            report.location.as_deref().unwrap_or("an unknown place")
        ),
        Kind::Signal => {
            let signal = report.signal.as_deref().unwrap_or("A signal");
            match signature::meaningful(&report.frames, report.signal.as_deref()).first() {
                Some(Frame {
                    module,
                    function: Some(function),
                    ..
                }) => format!("{signal} in {module} ({function})"),
                Some(Frame { module, .. }) => format!("{signal} in {module}"),
                None => signal.to_owned(),
            }
        }
    };
    summary.chars().take(LONGEST_SUMMARY).collect()
}

pub fn report(details: Details, scrubber: &Scrubber) -> Report {
    let mut frames = details.frames;
    frames.truncate(MOST_FRAMES);
    let script: Vec<String> = details
        .script
        .iter()
        .take(MOST_SCRIPT_FRAMES)
        .map(|frame| scrubber.text(frame, LONGEST_LINE))
        .collect();
    let message = details
        .message
        .map(|message| scrubber.text(&message, LONGEST_MESSAGE));
    let location = details
        .location
        .map(|location| scrubber.text(&location, LONGEST_LINE));
    let signature = signature::of(&Failure {
        program: &details.program,
        kind: details.kind,
        signal: details.signal.as_deref(),
        message: message.as_deref(),
        location: location.as_deref(),
        frames: &frames,
        script: &script,
    });
    let mut report = Report {
        signature,
        program: details.program,
        build: details.build,
        summary: String::new(),
        kind: details.kind,
        signal: details.signal,
        message,
        location,
        frames,
        script,
        image: String::new(),
        channel: String::new(),
        graphics: system::graphics(),
        nvidia_driver: system::nvidia_driver(),
    };
    report.summary = summary(&report);
    report
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::program_name;

    #[test]
    fn apps_go_by_their_app_id() {
        assert_eq!(
            program_name(Path::new("/usr/lib/sabine/com.lantharos.settings/settings")),
            "com.lantharos.settings"
        );
        assert_eq!(
            program_name(Path::new("/usr/libexec/luft-firewall")),
            "luft-firewall"
        );
    }
}
