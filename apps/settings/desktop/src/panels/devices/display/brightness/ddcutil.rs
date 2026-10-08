use std::ffi::CString;
use std::os::unix::ffi::OsStrExt;
use std::path::Path;
use std::process::Command;

use serde::Serialize;

const PROGRAM: &str = "ddcutil";
const BRIGHTNESS: &str = "10";

#[derive(Serialize, Clone, Copy, Default, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum Availability {
    #[default]
    Checking,
    Ready,
    MissingTool,
    NeedsRestart,
    NoAccess,
}

#[derive(Default)]
pub struct Found {
    pub bus: u32,
    pub connector: Option<String>,
    pub monitor: Option<(String, String, String)>,
    pub usable: bool,
}

fn installed() -> bool {
    std::env::var_os("PATH").is_some_and(|paths| {
        std::env::split_paths(&paths).any(|directory| directory.join(PROGRAM).is_file())
    })
}

fn accessible(path: &Path) -> bool {
    CString::new(path.as_os_str().as_bytes())
        .is_ok_and(|path| unsafe { libc::access(path.as_ptr(), libc::R_OK | libc::W_OK) } == 0)
}

pub fn availability() -> Availability {
    if !installed() {
        return Availability::MissingTool;
    }
    let buses: Vec<_> = std::fs::read_dir("/dev")
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| entry.file_name().as_bytes().starts_with(b"i2c-"))
        .map(|entry| entry.path())
        .collect();
    if buses.is_empty() {
        Availability::NeedsRestart
    } else if buses.iter().any(|bus| accessible(bus)) {
        Availability::Ready
    } else {
        Availability::NoAccess
    }
}

fn run(arguments: &[&str]) -> Result<String, String> {
    let output = Command::new(PROGRAM)
        .args(arguments)
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_owned());
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

fn connector(value: &str) -> String {
    value
        .split_once('-')
        .filter(|(card, _)| card.starts_with("card"))
        .map_or(value, |(_, connector)| connector)
        .to_owned()
}

fn monitor(value: &str) -> Option<(String, String, String)> {
    let mut parts = value.splitn(3, ':');
    Some((
        parts.next()?.to_owned(),
        parts.next()?.to_owned(),
        parts.next()?.to_owned(),
    ))
}

fn parse_detect(output: &str) -> Vec<Found> {
    let mut found = Vec::new();
    let mut current: Option<Found> = None;
    for line in output.lines() {
        if !line.starts_with(char::is_whitespace) {
            found.extend(current.take());
            let heading = line.trim();
            current =
                (heading.starts_with("Display ") || heading == "Invalid display").then(|| Found {
                    usable: heading != "Invalid display",
                    ..Found::default()
                });
            continue;
        }
        let (Some(display), Some((key, value))) = (current.as_mut(), line.trim().split_once(':'))
        else {
            continue;
        };
        let value = value.trim();
        match key {
            "I2C bus" => {
                display.bus = value
                    .rsplit_once('-')
                    .and_then(|(_, bus)| bus.parse().ok())
                    .unwrap_or_default();
            }
            "DRM connector" | "DRM_connector" => display.connector = Some(connector(value)),
            "Monitor" => display.monitor = monitor(value),
            _ => {}
        }
    }
    found.extend(current);
    found
}

pub fn detect() -> Result<Vec<Found>, String> {
    run(&["detect", "--terse"]).map(|output| parse_detect(&output))
}

fn parse_brightness(output: &str) -> Option<(u16, u16)> {
    output.lines().find_map(|line| {
        let mut words = line.split_whitespace();
        (words.next()? == "VCP" && words.next()? == BRIGHTNESS && words.next()? == "C")
            .then_some(())?;
        let current = words.next()?.parse().ok()?;
        let max = words.next()?.parse().ok()?;
        (max > 0).then_some((current, max))
    })
}

pub fn brightness(bus: u32) -> Result<(u16, u16), String> {
    let output = run(&["--bus", &bus.to_string(), "getvcp", BRIGHTNESS, "--terse"])?;
    parse_brightness(&output).ok_or(output)
}

pub fn set_brightness(bus: u32, value: u16) -> Result<(), String> {
    run(&[
        "--bus",
        &bus.to_string(),
        "setvcp",
        BRIGHTNESS,
        &value.to_string(),
    ])
    .map(|_| ())
}
