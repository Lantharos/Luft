use std::fs::OpenOptions;
use std::io::Write;
use std::os::fd::AsRawFd;
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use sushi::ipc::password::{SHELL, Secret};
use sushi::started;

use super::disk::SystemDisk;
use super::{splash, text, tpm};

const GREETING: &str = "\x1b[H\x1b[2JThis shell can change anything on this computer.\nType exit to go back to the Luft screen.\n";
const ASKS_FOR_KEY: &str = "Until the next restart, this computer asks for its recovery key or passphrase\nin place of unlocking by itself.\n";
const NO_SHELL: &str = "A shell can't open here";
const UNKNOWN_DISK: &str =
    "Luft can't tell which disk it started from, so it can't check who is asking.";
const SILENT_TPM: &str = "The TPM didn't answer, and it has to before a shell may open.";
const VT_ACTIVATE: libc::c_ulong = 0x5606;
const VT_WAITACTIVE: libc::c_ulong = 0x5607;
const FIRST_CONSOLE: libc::c_int = 1;

enum Gate {
    Password,
    Key(PathBuf),
    Open,
    Closed,
}

fn root_has_password() -> bool {
    std::fs::read_to_string("/etc/shadow")
        .unwrap_or_default()
        .lines()
        .find_map(|line| line.strip_prefix("root:"))
        .and_then(|rest| rest.split(':').next())
        .is_some_and(|hash| !hash.is_empty() && !hash.starts_with(['!', '*']))
}

fn presence_proven() -> bool {
    std::env::var("SYSTEMD_SULOGIN_FORCE")
        .is_ok_and(|value| matches!(value.as_str(), "1" | "yes" | "true" | "on"))
}

impl Gate {
    fn for_this_system(in_initrd: bool) -> Self {
        if !in_initrd && root_has_password() {
            return Self::Password;
        }
        if presence_proven() {
            return Self::Open;
        }
        match SystemDisk::find() {
            SystemDisk::Encrypted(partition) => Self::Key(partition),
            SystemDisk::Plain => Self::Open,
            SystemDisk::Unknown if in_initrd || started::from_stick() => Self::Open,
            SystemDisk::Unknown => Self::Closed,
        }
    }

    fn stop_the_tpm_unlocking(&self, in_initrd: bool) -> std::io::Result<bool> {
        if !in_initrd && matches!(self, Self::Password | Self::Key(_)) {
            Ok(false)
        } else {
            tpm::stop_unlocking()
        }
    }
}

fn ask_for_key(on_splash: bool) -> Option<Secret> {
    let mut asking = Command::new("systemd-ask-password");
    asking.args([&format!("--id={SHELL}"), "--timeout=0", "--echo=masked"]);
    if on_splash {
        asking.arg("--no-tty");
    }
    let mut asking = asking
        .arg("Enter the recovery key or the disk's passphrase to open a shell:")
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .ok()?;
    let answer = Secret::read_line(asking.stdout.take()?);
    let answered = asking.wait().is_ok_and(|status| status.success());
    let mut key = answer.ok().filter(|_| answered)?;
    key.tidy_recovery_key();
    Some(key)
}

fn opens(disk: &Path, key: &Secret) -> bool {
    let Ok(mut checking) = Command::new("cryptsetup")
        .args(["open", "--test-passphrase", "--key-file=-"])
        .arg(disk)
        .stdin(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
    else {
        return false;
    };
    if let Some(mut input) = checking.stdin.take() {
        let _ = input.write_all(key.bytes());
    }
    checking.wait().is_ok_and(|status| status.success())
}

fn unlocked_by_person(disk: &Path, on_splash: bool) -> bool {
    loop {
        let Some(key) = ask_for_key(on_splash) else {
            return false;
        };
        if opens(disk, &key) {
            return true;
        }
        if !on_splash {
            println!("That didn't unlock the disk. Try again.");
        }
    }
}

fn first_console() -> Option<PathBuf> {
    let consoles = OpenOptions::new().write(true).open("/dev/tty0").ok()?;
    unsafe {
        libc::ioctl(consoles.as_raw_fd(), VT_ACTIVATE, FIRST_CONSOLE);
        libc::ioctl(consoles.as_raw_fd(), VT_WAITACTIVE, FIRST_CONSOLE);
    }
    Some(PathBuf::from("/dev/tty1"))
}

fn login_shell() -> Command {
    let program = ["/bin/bash", "/bin/sh"]
        .into_iter()
        .find(|program| Path::new(program).exists())
        .unwrap_or("/bin/sh");
    let mut shell = Command::new(program);
    shell.arg0(format!("-{}", program.rsplit('/').next().unwrap_or("sh")));
    shell
}

fn greet(console: &Path, asks_for_key: bool) -> std::io::Result<()> {
    let mut console = OpenOptions::new().write(true).open(console)?;
    console.write_all(GREETING.as_bytes())?;
    if asks_for_key {
        console.write_all(ASKS_FOR_KEY.as_bytes())?;
    }
    console.write_all(b"\n")
}

fn refuse(on_splash: bool, why: &str) {
    if !on_splash || !splash::tell(NO_SHELL, why) {
        text::tell(NO_SHELL, why);
    }
}

fn attach(command: &mut Command, console: &Path) -> std::io::Result<()> {
    let open = || OpenOptions::new().read(true).write(true).open(console);
    command.stdin(open()?).stdout(open()?).stderr(open()?);
    unsafe {
        command.pre_exec(|| {
            libc::setsid();
            libc::ioctl(std::io::stdin().as_raw_fd(), libc::TIOCSCTTY, 1);
            Ok(())
        });
    }
    Ok(())
}

fn sulogin(console: &Path) -> Command {
    let name = console.file_name().unwrap_or_default().to_string_lossy();
    let mut start = Command::new("systemctl");
    start.args(["start", &format!("sushi-shell@{name}.service")]);
    start
}

fn console(on_splash: bool) -> Option<PathBuf> {
    if !on_splash {
        return Some(PathBuf::from("/dev/console"));
    }
    splash::leave();
    first_console()
}

pub fn open(on_splash: bool, in_initrd: bool) {
    let gate = Gate::for_this_system(in_initrd);
    match &gate {
        Gate::Closed => return refuse(on_splash, UNKNOWN_DISK),
        Gate::Key(disk) if !unlocked_by_person(disk, on_splash) => return,
        _ => {}
    }
    let asks_for_key = match gate.stop_the_tpm_unlocking(in_initrd) {
        Ok(stopped) => stopped,
        Err(error) => {
            eprintln!("Couldn't keep the TPM from unlocking for the shell: {error}");
            return refuse(on_splash, SILENT_TPM);
        }
    };
    let Some(console) = console(on_splash) else {
        eprintln!("There's no console to open the shell on");
        return;
    };
    let _ = greet(&console, asks_for_key);
    let mut shell = if in_initrd {
        login_shell()
    } else {
        sulogin(&console)
    };
    if in_initrd
        && on_splash
        && let Err(error) = attach(&mut shell, &console)
    {
        eprintln!("Couldn't open the console for the shell: {error}");
        return;
    }
    if let Err(error) = shell.status() {
        eprintln!("Couldn't start the shell: {error}");
    }
}
