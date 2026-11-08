use std::io;
use std::os::unix::fs::symlink;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

use luft_remote_login::choices::Choices;

const SSHD: &str = "sshd.service";
const SSHD_UNIT: &str = "/usr/lib/systemd/system/sshd.service";
const SOCKET_ACTIVATED: [&str; 2] = ["sshd.socket", "sshd@.service"];
const STARTUP: &str = "multi-user.target.wants";
const MASKED: &str = "/dev/null";

fn link(target: &str, folder: &Path, name: &str) -> io::Result<()> {
    std::fs::create_dir_all(folder)?;
    symlink(target, folder.join(name))
}

fn generate(normal: &Path, early: &Path) -> io::Result<()> {
    for unit in SOCKET_ACTIVATED {
        link(MASKED, early, unit)?;
    }
    let choices = Choices::load();
    if choices.as_ref().is_ok_and(|choices| choices.enabled) {
        link(SSHD_UNIT, &normal.join(STARTUP), SSHD)?;
    } else {
        link(MASKED, early, SSHD)?;
    }
    choices.map(drop)
}

fn main() -> ExitCode {
    let folders: Vec<PathBuf> = std::env::args_os().skip(1).map(PathBuf::from).collect();
    let [normal, early, _late] = folders.as_slice() else {
        eprintln!("Usage: luft-remote-login-generator NORMAL-DIR EARLY-DIR LATE-DIR");
        return ExitCode::FAILURE;
    };
    match generate(normal, early) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error}");
            ExitCode::FAILURE
        }
    }
}
