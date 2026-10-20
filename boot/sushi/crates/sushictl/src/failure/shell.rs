use std::fs::OpenOptions;
use std::io::Write;
use std::os::fd::AsRawFd;
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use sushi::luks;
use sushi::password::{SHELL, Secret};

use super::splash;

const GREETING: &[u8] =
    b"\x1b[H\x1b[2JThis shell can change anything on this computer.\nType exit to go back to the Luft screen.\n\n";
const VT_ACTIVATE: libc::c_ulong = 0x5606;
const VT_WAITACTIVE: libc::c_ulong = 0x5607;
const FIRST_CONSOLE: libc::c_int = 1;
const SKIPPED_DEVICES: [&str; 5] = ["dm-", "loop", "ram", "zram", "sr"];

enum Gate {
    Password,
    Key(Vec<PathBuf>),
    Open,
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

fn encrypted_disks() -> Vec<PathBuf> {
    std::fs::read_dir("/sys/class/block")
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.file_name().to_string_lossy().into_owned())
        .filter(|name| {
            !SKIPPED_DEVICES
                .iter()
                .any(|skipped| name.starts_with(skipped))
        })
        .map(|name| Path::new("/dev").join(name))
        .filter(|device| luks::unlocking(device).is_some())
        .collect()
}

impl Gate {
    fn for_this_system(in_initrd: bool) -> Self {
        if !in_initrd && root_has_password() {
            return Self::Password;
        }
        let disks = encrypted_disks();
        if presence_proven() || disks.is_empty() {
            Self::Open
        } else {
            Self::Key(disks)
        }
    }
}

fn ask_for_key(on_splash: bool) -> Option<Secret> {
    let mut asking = Command::new("systemd-ask-password");
    asking.args([&format!("--id={SHELL}"), "--timeout=0", "--echo=masked"]);
    if on_splash {
        asking.arg("--no-tty");
    }
    let answer = asking
        .arg("Enter the recovery key or the disk's passphrase to open a shell:")
        .stderr(Stdio::null())
        .output()
        .ok()
        .filter(|output| output.status.success())?;
    let mut key = Secret::default();
    String::from_utf8_lossy(&answer.stdout)
        .trim_end_matches('\n')
        .chars()
        .for_each(|character| key.push(character));
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

fn unlocked_by_person(disks: &[PathBuf], on_splash: bool) -> bool {
    loop {
        let Some(key) = ask_for_key(on_splash) else {
            return false;
        };
        if disks.iter().any(|disk| opens(disk, &key)) {
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

fn greet(console: &Path) -> std::io::Result<()> {
    OpenOptions::new()
        .write(true)
        .open(console)?
        .write_all(GREETING)
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
    if let Gate::Key(disks) = &gate
        && !unlocked_by_person(disks, on_splash)
    {
        return;
    }
    let Some(console) = console(on_splash) else {
        eprintln!("There's no console to open the shell on");
        return;
    };
    let _ = greet(&console);
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
