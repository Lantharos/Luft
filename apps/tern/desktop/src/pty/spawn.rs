use std::io;
use std::os::fd::OwnedFd;
use std::os::unix::process::CommandExt;
use std::process::{Child, Command, Stdio};

use rustix::fs::{Mode, OFlags};
use rustix::pty::{OpenptFlags, grantpt, openpt, ptsname, unlockpt};
use rustix::termios::{Winsize, tcsetwinsize};
use serde::Deserialize;

#[derive(Clone, Copy, Deserialize)]
pub struct Size {
    pub cols: u16,
    pub rows: u16,
}

impl Size {
    pub fn apply(self, master: &OwnedFd) -> io::Result<()> {
        let size = Winsize {
            ws_row: self.rows,
            ws_col: self.cols,
            ws_xpixel: 0,
            ws_ypixel: 0,
        };
        Ok(tcsetwinsize(master, size)?)
    }
}

pub struct Spawned {
    pub master: OwnedFd,
    pub child: Child,
}

pub fn spawn(mut command: Command, size: Size) -> io::Result<Spawned> {
    let master = openpt(OpenptFlags::RDWR | OpenptFlags::NOCTTY | OpenptFlags::CLOEXEC)?;
    grantpt(&master)?;
    unlockpt(&master)?;
    size.apply(&master)?;
    let name = ptsname(&master, Vec::new())?;
    let replica = rustix::fs::open(
        name.as_c_str(),
        OFlags::RDWR | OFlags::NOCTTY | OFlags::CLOEXEC,
        Mode::empty(),
    )?;
    command
        .stdin(Stdio::from(replica.try_clone()?))
        .stdout(Stdio::from(replica.try_clone()?))
        .stderr(Stdio::from(replica));
    unsafe {
        command.pre_exec(|| {
            rustix::process::setsid()?;
            rustix::process::ioctl_tiocsctty(rustix::stdio::stdin())?;
            Ok(())
        });
    }
    let child = command.spawn()?;
    rustix::fs::fcntl_setfl(&master, OFlags::NONBLOCK)?;
    Ok(Spawned { master, child })
}
