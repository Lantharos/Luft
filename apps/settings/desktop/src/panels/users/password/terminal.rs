use std::fs::File;
use std::io::{self, Read, Write};
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::os::unix::process::CommandExt;
use std::process::{Child, Command, Stdio};
use std::ptr;
use std::time::Duration;

const READ_LIMIT: Duration = Duration::from_secs(30);

pub struct Terminal {
    child: Child,
    master: File,
}

fn check(result: libc::c_int) -> io::Result<libc::c_int> {
    if result < 0 {
        Err(io::Error::last_os_error())
    } else {
        Ok(result)
    }
}

fn without_echo(slave: &OwnedFd) -> io::Result<()> {
    let mut settings = unsafe { std::mem::zeroed::<libc::termios>() };
    unsafe {
        check(libc::tcgetattr(slave.as_raw_fd(), &mut settings))?;
        settings.c_lflag &= !libc::ECHO;
        check(libc::tcsetattr(slave.as_raw_fd(), libc::TCSANOW, &settings))?;
    }
    Ok(())
}

impl Terminal {
    pub fn spawn(program: &str) -> io::Result<Self> {
        let (mut master, mut slave) = (-1, -1);
        unsafe {
            check(libc::openpty(
                &mut master,
                &mut slave,
                ptr::null_mut(),
                ptr::null(),
                ptr::null(),
            ))?;
            check(libc::fcntl(master, libc::F_SETFD, libc::FD_CLOEXEC))?;
        }
        let (master, slave) =
            unsafe { (OwnedFd::from_raw_fd(master), OwnedFd::from_raw_fd(slave)) };
        without_echo(&slave)?;
        let mut command = Command::new(program);
        command
            .env("LC_ALL", "C")
            .env_remove("LANGUAGE")
            .stdin(Stdio::from(slave.try_clone()?))
            .stdout(Stdio::from(slave.try_clone()?))
            .stderr(Stdio::from(slave));
        unsafe {
            command.pre_exec(|| {
                check(libc::setsid())?;
                check(libc::ioctl(0, libc::TIOCSCTTY, 0))?;
                Ok(())
            });
        }
        Ok(Self {
            child: command.spawn()?,
            master: File::from(master),
        })
    }

    pub fn read(&mut self) -> io::Result<Option<String>> {
        let mut poll = libc::pollfd {
            fd: self.master.as_raw_fd(),
            events: libc::POLLIN,
            revents: 0,
        };
        let ready =
            check(unsafe { libc::poll(&mut poll, 1, READ_LIMIT.as_millis() as libc::c_int) })?;
        if ready == 0 {
            return Err(io::Error::new(
                io::ErrorKind::TimedOut,
                "passwd stopped responding",
            ));
        }
        let mut buffer = [0; 1024];
        match self.master.read(&mut buffer) {
            Ok(0) => Ok(None),
            Ok(count) => Ok(Some(String::from_utf8_lossy(&buffer[..count]).into_owned())),
            Err(error) if error.raw_os_error() == Some(libc::EIO) => Ok(None),
            Err(error) => Err(error),
        }
    }

    pub fn answer(&mut self, text: &str) -> io::Result<()> {
        self.master.write_all(format!("{text}\n").as_bytes())
    }
}

impl Drop for Terminal {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}
