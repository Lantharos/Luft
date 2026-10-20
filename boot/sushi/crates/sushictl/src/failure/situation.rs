use std::process::{Command, Stdio};

use sushi::failure_file::{Choice, DETAILS, FailureFile};

use super::{boot, refused};

const JOURNAL_LINES: &str = "200";
const UNIT_LINES: &str = "6";
const REQUESTED: [&str; 11] = [
    "systemd.unit=emergency.target",
    "systemd.unit=rescue.target",
    "rd.systemd.unit=emergency.target",
    "rd.systemd.unit=rescue.target",
    "emergency",
    "rescue",
    "single",
    "s",
    "S",
    "1",
    "-b",
];

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Action {
    Unlock,
    Restart,
    Previous,
    Shell,
}

impl Action {
    const ALL: [Self; 4] = [Self::Unlock, Self::Restart, Self::Previous, Self::Shell];

    fn id(self) -> &'static str {
        match self {
            Self::Unlock => "unlock",
            Self::Restart => "restart",
            Self::Previous => "previous",
            Self::Shell => "shell",
        }
    }

    fn label(self) -> &'static str {
        match self {
            Self::Unlock => "Enter recovery key",
            Self::Restart => "Restart",
            Self::Previous => "Start the previous version",
            Self::Shell => "Open a shell",
        }
    }

    pub fn from_id(id: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|action| action.id() == id)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Reason {
    Locked,
    Missing,
    Unopened,
    Damaged,
    Update,
    Drive,
    Requested,
    Unknown,
}

impl Reason {
    fn text(self) -> &'static str {
        match self {
            Self::Locked => "The disk couldn't be unlocked.",
            Self::Missing => "The system disk couldn't be found.",
            Self::Unopened => "The system disk couldn't be opened.",
            Self::Damaged => "A system file is damaged.",
            Self::Update => "An update didn't finish starting.",
            Self::Drive => "A drive couldn't be mounted.",
            Self::Requested => "Rescue was chosen when the computer started.",
            Self::Unknown => "Part of the system didn't start.",
        }
    }
}

struct Unit {
    name: String,
    description: String,
}

pub struct Situation {
    reason: Option<Reason>,
    actions: Vec<Action>,
    details: Vec<String>,
}

fn output(program: &str, arguments: &[&str]) -> Vec<String> {
    Command::new(program)
        .args(arguments)
        .stdin(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .map(|output| {
            String::from_utf8_lossy(&output.stdout)
                .lines()
                .map(str::to_owned)
                .collect()
        })
        .unwrap_or_default()
}

fn failed_units() -> Vec<Unit> {
    let listed = [
        "list-units",
        "--state=failed",
        "--plain",
        "--no-legend",
        "--full",
        "--no-pager",
    ];
    output("systemctl", &listed)
        .iter()
        .filter_map(|line| {
            let mut fields = line.split_whitespace();
            let name = fields.next()?.to_owned();
            let description = fields.skip(3).collect::<Vec<_>>().join(" ");
            Some(Unit { name, description })
        })
        .collect()
}

fn journal_errors() -> Vec<String> {
    let arguments = [
        "-b",
        "-q",
        "-r",
        "--no-pager",
        "--no-hostname",
        "-p",
        "err",
        "-o",
        "short-monotonic",
        "-n",
        JOURNAL_LINES,
    ];
    output("journalctl", &arguments)
}

fn system_name() -> String {
    ["/etc/os-release", "/usr/lib/os-release"]
        .iter()
        .find_map(|path| std::fs::read_to_string(path).ok())
        .unwrap_or_default()
        .lines()
        .find_map(|line| line.strip_prefix("NAME="))
        .map(|name| name.trim_matches('"').to_owned())
        .filter(|name| !name.is_empty())
        .unwrap_or_else(|| "This computer".to_owned())
}

fn requested() -> bool {
    std::fs::read_to_string("/proc/cmdline")
        .unwrap_or_default()
        .split_whitespace()
        .any(|argument| REQUESTED.contains(&argument))
}

fn reason(
    units: &[Unit],
    refused: &[String],
    journal: &[String],
    in_initrd: bool,
) -> Option<Reason> {
    let failed = |test: fn(&str) -> bool| units.iter().any(|unit| test(&unit.name));
    let timed_out = journal
        .iter()
        .any(|line| line.contains("Timed out waiting for device"));
    let found = if requested() {
        Some(Reason::Requested)
    } else if !refused.is_empty()
        || failed(|name| {
            name == "bootc-root-setup.service" || name == "ostree-prepare-root.service"
        })
    {
        Some(Reason::Damaged)
    } else if failed(|name| {
        name.starts_with("systemd-cryptsetup@") || name == "trustd-encrypt.service"
    }) {
        Some(Reason::Locked)
    } else if timed_out {
        Some(if in_initrd {
            Reason::Missing
        } else {
            Reason::Drive
        })
    } else if failed(|name| {
        name == "bootc-root-setup.service" || name == "ostree-prepare-root.service"
    }) {
        Some(Reason::Damaged)
    } else if failed(|name| name.starts_with("sysroot") || name.starts_with("initrd-root")) {
        Some(Reason::Unopened)
    } else if failed(|name| {
        name.ends_with(".mount") || name.starts_with("systemd-fsck") || name == "local-fs.target"
    }) {
        Some(Reason::Drive)
    } else if !units.is_empty() {
        Some(Reason::Unknown)
    } else {
        None
    };
    match found {
        Some(Reason::Locked | Reason::Missing | Reason::Requested | Reason::Damaged) => found,
        _ if boot::on_trial() => Some(Reason::Update),
        _ => found,
    }
}

fn details(units: &[Unit], refused: &[String], journal: &[String]) -> Vec<String> {
    let mut details = Vec::new();
    if !refused.is_empty() {
        details.push("These system files don't match the version that started:".to_owned());
        details.extend(refused.iter().map(|message| format!("    {message}")));
        details.push(String::new());
    }
    if !units.is_empty() {
        details.push("These parts of the system didn't start:".to_owned());
        for unit in units {
            details.push(format!("{} ({})", unit.description, unit.name));
            let log = [
                "-b",
                "-q",
                "--no-pager",
                "-o",
                "cat",
                "-n",
                UNIT_LINES,
                "-u",
                &unit.name,
            ];
            details.extend(
                output("journalctl", &log)
                    .into_iter()
                    .map(|line| format!("    {line}")),
            );
        }
    }
    if !journal.is_empty() {
        if !details.is_empty() {
            details.push(String::new());
        }
        details.push("Errors since the computer started, newest first:".to_owned());
        details.extend(journal.iter().cloned());
    }
    details
}

impl Situation {
    pub fn read(in_initrd: bool) -> Self {
        let units = failed_units();
        let refused = refused::system_files();
        let journal = journal_errors();
        let reason = reason(&units, &refused, &journal, in_initrd);
        let mut actions = Vec::new();
        if in_initrd && reason == Some(Reason::Locked) {
            actions.push(Action::Unlock);
        }
        actions.push(Action::Restart);
        if boot::previous_version().is_some() {
            let at = if reason == Some(Reason::Update) {
                actions.len() - 1
            } else {
                actions.len()
            };
            actions.insert(at, Action::Previous);
        }
        actions.push(Action::Shell);
        Self {
            reason,
            actions,
            details: details(&units, &refused, &journal),
        }
    }

    pub fn screen(&self) -> FailureFile {
        let mut choices: Vec<Choice> = self
            .actions
            .iter()
            .map(|action| Choice {
                id: action.id().to_owned(),
                label: action.label().to_owned(),
            })
            .collect();
        if !self.details.is_empty() {
            choices.insert(
                choices.len() - 1,
                Choice {
                    id: DETAILS.to_owned(),
                    label: "Show details".to_owned(),
                },
            );
        }
        FailureFile {
            title: if self.reason == Some(Reason::Requested) {
                format!("{} is in Rescue", system_name())
            } else {
                format!("{} couldn't start", system_name())
            },
            reason: self.reason.map(|reason| reason.text().to_owned()),
            choices,
            details: self.details.clone(),
        }
    }
}
