use std::fs::{self, File, OpenOptions};
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::time::Duration;

use tokio::io::Interest;
use tokio::io::unix::AsyncFd;

const SYSTEM_PRESSURE: &str = "/proc/pressure/memory";

pub struct Trigger {
    file: AsyncFd<File>,
    path: PathBuf,
}

impl Trigger {
    pub fn system(stalled: Duration, window: Duration) -> io::Result<Self> {
        Self::new(Path::new(SYSTEM_PRESSURE), stalled, window)
    }

    pub fn new(path: &Path, stalled: Duration, window: Duration) -> io::Result<Self> {
        let mut file = OpenOptions::new().read(true).write(true).open(path)?;
        file.write_all(
            format!("some {} {}\0", stalled.as_micros(), window.as_micros()).as_bytes(),
        )?;
        // SAFETY: the AsyncFd owns the file, so its descriptor stays open for its whole life.
        let file = unsafe { AsyncFd::register_with_interest(file, Interest::PRIORITY)? };
        Ok(Self {
            file,
            path: path.to_owned(),
        })
    }

    pub async fn fired(&self) -> io::Result<()> {
        self.file.ready(Interest::PRIORITY).await?.clear_ready();
        if !self.path.exists() {
            return Err(io::ErrorKind::NotFound.into());
        }
        Ok(())
    }
}

pub fn running_low() -> bool {
    let Ok(meminfo) = fs::read_to_string("/proc/meminfo") else {
        return false;
    };
    let field = |name: &str| -> u64 {
        meminfo
            .lines()
            .find_map(|line| line.strip_prefix(name)?.strip_prefix(':'))
            .and_then(|value| value.split_whitespace().next()?.parse().ok())
            .unwrap_or(0)
    };
    let left = field("MemAvailable") + field("SwapFree");
    let total = field("MemTotal") + field("SwapTotal");
    left * 10 < total
}
