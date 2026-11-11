mod boot;
mod disk;
mod keys;
mod refused;
mod shell;
mod situation;
mod splash;
mod text;
mod tpm;

use std::path::Path;
use std::process::{Command, ExitCode};
use std::time::Duration;

use situation::{Action, Situation};

const RETRY_WAIT: Duration = Duration::from_secs(2);

struct Place {
    in_initrd: bool,
    returns_to_caller: bool,
}

impl Place {
    fn here() -> Self {
        let unit = std::fs::read_to_string("/proc/self/cgroup").unwrap_or_default();
        Self {
            in_initrd: Path::new("/etc/initrd-release").exists(),
            returns_to_caller: unit.trim_end().ends_with("/dracut-emergency.service"),
        }
    }
}

fn systemctl(arguments: &[&str]) -> bool {
    Command::new("systemctl")
        .args(arguments)
        .status()
        .is_ok_and(|status| status.success())
}

fn restart() -> ! {
    if !systemctl(&["reboot"]) {
        systemctl(&["reboot", "--force", "--force"]);
    }
    loop {
        std::thread::park();
    }
}

fn try_again(place: &Place) -> ExitCode {
    keys::forget_typed();
    if !place.returns_to_caller {
        systemctl(&["reset-failed"]);
        systemctl(&["--no-block", "isolate", "default.target"]);
    }
    ExitCode::SUCCESS
}

pub fn check_files() -> ExitCode {
    let refused = refused::system_files();
    refused.iter().for_each(|message| eprintln!("{message}"));
    if refused.is_empty() {
        ExitCode::SUCCESS
    } else {
        ExitCode::FAILURE
    }
}

pub fn run() -> ExitCode {
    let place = Place::here();
    loop {
        let screen = Situation::read(place.in_initrd).screen();
        let (chosen, on_splash) = match splash::ask(&screen) {
            Some(chosen) => (Some(chosen), true),
            None => (text::ask(&screen), false),
        };
        let Some(action) = chosen.as_deref().and_then(Action::from_id) else {
            std::thread::sleep(RETRY_WAIT);
            continue;
        };
        match action {
            Action::Restart => restart(),
            Action::Previous => match boot::go_back() {
                Ok(()) => restart(),
                Err(error) => eprintln!("Couldn't choose the previous version: {error}"),
            },
            Action::Shell => shell::open(on_splash, place.in_initrd),
            Action::Unlock => return try_again(&place),
        }
    }
}
