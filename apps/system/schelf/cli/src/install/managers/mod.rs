mod arguments;
mod changes;

use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::Command as Process;

use luft_i18n::t;

use super::Exit;
use super::arguments::{Arguments, Command};
use super::sources::Origin;
use super::terminal::Ink;
use crate::l10n::L10N;
use arguments::Asked;

pub use arguments::Manager;

const DNF: &str = "/usr/bin/dnf5";

const DNF_ITSELF: [&str; 18] = [
    "info",
    "list",
    "provides",
    "whatprovides",
    "repoquery",
    "rq",
    "repolist",
    "repoinfo",
    "history",
    "check-update",
    "check-upgrade",
    "download",
    "makecache",
    "advisory",
    "updateinfo",
    "leaves",
    "help",
    "",
];

const DNF_UPDATES: [&str; 6] = [
    "upgrade",
    "update",
    "up",
    "distro-sync",
    "dsync",
    "upgrade-minimal",
];

fn real_dnf(given: &[String]) -> Exit {
    let error = Process::new(DNF).args(given).exec();
    eprintln!("{DNF}: {error}");
    Exit::Failed
}

pub(super) fn hint(program: &str, manager: Manager) -> Exit {
    let ink = Ink::stderr();
    if manager != Manager::Dnf {
        eprintln!("{}", t!(L10N, "cli-manager-not-dnf", manager = program));
    }
    eprintln!("{}", t!(L10N, "cli-manager-read-only"));
    eprintln!(
        "  {}",
        t!(
            L10N,
            "cli-manager-schelf",
            command = ink.bold("schelf install …")
        )
    );
    eprintln!(
        "  {}",
        t!(L10N, "cli-manager-dnf", command = ink.bold("dnf install …"))
    );
    Exit::Failed
}

fn updates() -> Exit {
    eprintln!("{}", t!(L10N, "cli-manager-updates"));
    eprintln!(
        "{}",
        t!(
            L10N,
            "cli-manager-updates-schelf",
            command = Ink::stderr().bold("schelf update")
        )
    );
    Exit::Done
}

/// Runs again as the account `sudo` or `pkexec` was asked from, since Schelf works in an account.
fn as_you(given: &[String]) -> Result<(), Exit> {
    if unsafe { libc::geteuid() } != 0 {
        return Ok(());
    }
    let uid = ["SUDO_UID", "PKEXEC_UID"]
        .into_iter()
        .find_map(|variable| std::env::var(variable).ok()?.parse::<u32>().ok())
        .filter(|uid| *uid != 0);
    let Some((uid, name)) = uid.and_then(|uid| Some((uid, user_name(uid)?))) else {
        eprintln!("{}", t!(L10N, "cli-usage-no-sudo"));
        return Err(Exit::Usage);
    };
    let program = std::env::args().next().unwrap_or_default();
    let error = Process::new("runuser")
        .args(["-u", &name, "--", "env"])
        .arg(format!("XDG_RUNTIME_DIR=/run/user/{uid}"))
        .arg(format!(
            "DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/{uid}/bus"
        ))
        .arg(program)
        .args(given)
        .exec();
    eprintln!("runuser: {error}");
    Err(Exit::Failed)
}

fn user_name(uid: u32) -> Option<String> {
    let entry = unsafe { libc::getpwuid(uid) };
    if entry.is_null() {
        return None;
    }
    let name = unsafe { std::ffi::CStr::from_ptr((*entry).pw_name) };
    Some(name.to_string_lossy().into_owned())
}

pub(super) fn schelf(
    command: Command,
    words: Vec<String>,
    only: Option<Origin>,
    yes: bool,
) -> Exit {
    super::perform::interrupt::watch();
    super::commands::run(&Arguments {
        command,
        words,
        only,
        yes,
        read_only: false,
    })
}

fn dnf(program: &str, given: &[String], asked: Asked) -> Exit {
    let action = asked.action.as_deref().unwrap_or_default();
    if asked.installroot || DNF_ITSELF.contains(&action) {
        return real_dnf(given);
    }
    if DNF_UPDATES.contains(&action) {
        return updates();
    }
    if let Err(exit) = as_you(given) {
        return exit;
    }
    let source = match (action, asked.words.first().map(String::as_str)) {
        ("copr", Some("enable")) => asked.words.get(1).map(|name| format!("copr:{name}")),
        ("config-manager", Some("addrepo")) => asked.repo_file.clone(),
        _ => None,
    };
    match (action, source) {
        ("install" | "in", _) => changes::install(program, Manager::Dnf, asked),
        ("remove" | "erase" | "rm", _) => changes::remove(program, Manager::Dnf, asked),
        ("search" | "se", _) => changes::search(program, Manager::Dnf, asked),
        (_, Some(source)) => add_source(source, asked.yes),
        _ => hint(program, Manager::Dnf),
    }
}

fn add_source(source: String, yes: bool) -> Exit {
    eprintln!("{}", t!(L10N, "cli-manager-sources"));
    schelf(Command::Repo, vec!["add".to_owned(), source], None, yes)
}

fn other(program: &str, manager: Manager, given: &[String], asked: Asked) -> Exit {
    if let Err(exit) = as_you(given) {
        return exit;
    }
    let action = asked.action.clone().unwrap_or_default();
    match (manager, action.as_str()) {
        (Manager::Apt, "install") | (Manager::Zypper, "in" | "install") => {
            changes::install(program, manager, asked)
        }
        (Manager::Apt, "remove" | "purge") | (Manager::Zypper, "rm" | "remove") => {
            changes::remove(program, manager, asked)
        }
        (Manager::Apt, "search") | (Manager::Zypper, "se" | "search") => {
            changes::search(program, manager, asked)
        }
        (Manager::Apt, "update" | "upgrade" | "full-upgrade" | "dist-upgrade")
        | (Manager::Zypper, "up" | "update" | "dup" | "dist-upgrade" | "patch") => updates(),
        (Manager::Pacman, action) if action.starts_with("-S") && action.contains('u') => updates(),
        (Manager::Pacman, action) if action.starts_with("-S") && action.contains('s') => {
            changes::search(program, manager, asked)
        }
        (Manager::Pacman, "-S" | "-Sy") if !asked.words.is_empty() => {
            changes::install(program, manager, asked)
        }
        (Manager::Pacman, "-S" | "-Sy") => updates(),
        (Manager::Pacman, action) if action.starts_with("-R") => {
            changes::remove(program, manager, asked)
        }
        _ => hint(program, manager),
    }
}

/// Answers as dnf, apt, pacman or zypper: what would change the system goes to Schelf, and dnf's
/// queries and container builds, where systemd isn't running, to dnf5 itself.
pub fn run(program: &str, manager: Manager, given: &[String]) -> i32 {
    let in_container = !Path::new("/run/systemd/system").is_dir();
    if manager == Manager::Dnf && in_container {
        return real_dnf(given) as i32;
    }
    let asked = arguments::read(manager, given);
    (if manager == Manager::Dnf {
        dnf(program, given, asked)
    } else {
        other(program, manager, given, asked)
    }) as i32
}
