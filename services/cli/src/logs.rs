//! The logs of Luft's parts, by the names people know them by, read from the
//! journal with journalctl.

use std::io::{BufRead, BufReader};
use std::os::unix::process::CommandExt;
use std::process::{Command, Stdio};

use clap::ValueEnum;
use serde::Serialize;
use serde_json::Value as Json;

use crate::cli::LogsArgs;
use crate::failure::{Failure, Outcome};
use crate::output::Output;

#[derive(Clone, Copy, ValueEnum)]
pub enum Part {
    /// The desktop: the shell, the lock screen and the extensions in it
    Kestrel,
    /// Kestrel's settings service: night light, power, printers found nearby
    DesktopSettings,
    /// The login screen
    LoginScreen,
    /// Updates of Luft itself
    Updater,
    /// System packages and store extensions
    Packages,
    /// Luft Keyring and its unlock service
    Keyring,
    /// Luft Passkeys
    Passkeys,
    /// The firewall
    Firewall,
    /// Secure Boot, the TPM and disk encryption
    Trust,
    /// USB protection while locked
    Usb,
    /// Online accounts and cloud drives
    Accounts,
    /// Crash reports
    Crashes,
    /// Changes reviewed on the screen
    Changes,
}

pub struct Units {
    pub system: Vec<String>,
    pub user: Vec<String>,
}

impl Part {
    pub fn units(self) -> Units {
        let (system, user): (&[&str], &[&str]) = match self {
            Self::Kestrel => (&[], &["kestrel.service"]),
            Self::DesktopSettings => (&[], &["kestrel-settings.service"]),
            Self::LoginScreen => (&["greetd.service", "kestrel-greeter.service"], &[]),
            Self::Updater => (&["luft-updater.service", "luft-updater-check.service"], &[]),
            Self::Packages => (
                &[
                    "luft-packages.service",
                    "luft-system-packages-rebuild.service",
                ],
                &[],
            ),
            Self::Keyring => (&["luft-keyring-unlock.service"], &["luft-keyring.service"]),
            Self::Passkeys => (
                &["luft-passkeys-relay@*.service"],
                &["luft-passkeys.service"],
            ),
            Self::Firewall => (
                &["luft-firewall.service", "luft-firewall-base.service"],
                &[],
            ),
            Self::Trust => (
                &[
                    "trustd.service",
                    "trustd-follow-up.service",
                    "trustd-startup-check.service",
                ],
                &[],
            ),
            Self::Usb => (&["luft-usb-protection.service"], &[]),
            Self::Accounts => (&[], &["luft-accounts.service"]),
            Self::Crashes => (
                &["luft-crash-collector.service"],
                &["luft-crash-reports.service"],
            ),
            Self::Changes => (&["luft-changes.service"], &[]),
        };
        Units {
            system: system.iter().map(|unit| (*unit).to_owned()).collect(),
            user: user.iter().map(|unit| (*unit).to_owned()).collect(),
        }
    }
}

#[derive(Serialize)]
pub struct Line {
    pub time: Option<String>,
    pub unit: Option<String>,
    pub priority: Option<u8>,
    pub message: String,
}

pub fn journalctl(
    units: &Units,
    since: Option<&str>,
    lines: u32,
    follow: bool,
    json: bool,
) -> Command {
    let mut command = Command::new("journalctl");
    command
        .arg("--no-pager")
        .arg("--lines")
        .arg(lines.to_string());
    for unit in &units.system {
        command.arg("--unit").arg(unit);
    }
    for unit in &units.user {
        command.arg("--user-unit").arg(unit);
    }
    if let Some(since) = since {
        command.arg("--since").arg(since);
    }
    if follow {
        command.arg("--follow");
    }
    command
        .arg("--output")
        .arg(if json { "json" } else { "short-iso" });
    command
}

pub fn line(entry: &Json) -> Line {
    let field = |name: &str| entry[name].as_str().map(str::to_owned);
    let message = match &entry["MESSAGE"] {
        Json::String(text) => text.clone(),
        Json::Array(bytes) => String::from_utf8_lossy(
            &bytes
                .iter()
                .filter_map(|byte| byte.as_u64().map(|byte| byte as u8))
                .collect::<Vec<_>>(),
        )
        .into_owned(),
        _ => String::new(),
    };
    let time = field("__REALTIME_TIMESTAMP")
        .and_then(|micros| micros.parse::<i64>().ok())
        .and_then(|micros| glib::DateTime::from_unix_utc(micros / 1_000_000).ok())
        .and_then(|time| time.to_local().ok()?.format("%Y-%m-%dT%H:%M:%S%:z").ok())
        .map(|time| time.to_string());
    Line {
        time,
        unit: field("_SYSTEMD_USER_UNIT").or_else(|| field("_SYSTEMD_UNIT")),
        priority: field("PRIORITY").and_then(|priority| priority.parse().ok()),
        message,
    }
}

/// The lines journalctl prints as JSON, read into [`Line`]s.
pub fn read(mut command: Command, keep: impl Fn(&Line) -> bool, each: impl FnMut(Line)) -> Outcome {
    let mut child = command
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|error| Failure::unavailable(format!("journalctl: {error}")))?;
    let stdout = child.stdout.take().expect("journalctl's output is piped");
    BufReader::new(stdout)
        .lines()
        .map_while(Result::ok)
        .filter_map(|text| serde_json::from_str::<Json>(&text).ok())
        .map(|entry| line(&entry))
        .filter(|line| keep(line))
        .for_each(each);
    child.wait()?;
    Ok(())
}

pub fn run(arguments: LogsArgs, output: Output) -> Outcome {
    let units = arguments.part.units();
    let command = journalctl(
        &units,
        arguments.since.as_deref(),
        arguments.lines,
        arguments.follow,
        output.json,
    );
    show(command, arguments.follow, output, |_| true)
}

/// Prints a journal command's lines: as JSON, one object a line while
/// following and as one array otherwise, or as journalctl prints them.
pub fn show(
    mut command: Command,
    follow: bool,
    output: Output,
    keep: impl Fn(&Line) -> bool,
) -> Outcome {
    if !output.json {
        return Err(Failure::unavailable(format!(
            "journalctl: {}",
            command.exec()
        )));
    }
    if follow {
        return stream(command, true, keep);
    }
    let mut lines = Vec::new();
    read(command, keep, |line| lines.push(line))?;
    output.show(&lines, String::new)
}

/// Prints each line as it comes: as a JSON object, or as time, part and message.
pub fn stream(command: Command, json: bool, keep: impl Fn(&Line) -> bool) -> Outcome {
    read(command, keep, |line| {
        if json {
            println!("{}", serde_json::to_string(&line).unwrap_or_default());
        } else {
            println!(
                "{} {}: {}",
                line.time.as_deref().unwrap_or_default(),
                line.unit.as_deref().unwrap_or_default(),
                line.message
            );
        }
    })
}
