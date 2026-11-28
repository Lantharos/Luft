use std::fs::{File, OpenOptions};
use std::io::{self, Write};
use std::os::fd::AsFd;
use std::time::Duration;

use rustix::event::{PollFd, PollFlags, Timespec, poll};

const PRESSURE: &str = "/proc/pressure/memory";
const STALLED: Duration = Duration::from_millis(100);
const WINDOW: Duration = Duration::from_secs(1);

pub struct Wake(File);

impl Wake {
    pub fn on_pressure() -> io::Result<Self> {
        let mut file = OpenOptions::new().read(true).write(true).open(PRESSURE)?;
        file.write_all(
            format!("some {} {}\0", STALLED.as_micros(), WINDOW.as_micros()).as_bytes(),
        )?;
        Ok(Self(file))
    }

    pub fn wait(&self, longest: Duration) {
        let mut fds = [PollFd::from_borrowed_fd(self.0.as_fd(), PollFlags::PRI)];
        let timeout = Timespec {
            tv_sec: longest.as_secs() as i64,
            tv_nsec: longest.subsec_nanos().into(),
        };
        if let Err(error) = poll(&mut fds, Some(&timeout)) {
            eprintln!("Couldn't wait for memory pressure: {error}");
            std::thread::sleep(longest);
        }
    }
}
