use std::fs::{self, File};
use std::io;

use tokio::io::Interest;
use tokio::io::unix::AsyncFd;

const KERNEL_HOSTNAME: &str = "/proc/sys/kernel/hostname";

pub struct HostnameWatch(AsyncFd<File>);

impl HostnameWatch {
    pub fn new() -> io::Result<Self> {
        let file = File::open(KERNEL_HOSTNAME)?;
        // SAFETY: the AsyncFd owns the file, so it stays open for its whole life.
        Ok(Self(unsafe {
            AsyncFd::register_with_interest(file, Interest::PRIORITY)?
        }))
    }

    pub async fn changed(&self) -> io::Result<()> {
        self.0.ready(Interest::PRIORITY).await?.clear_ready();
        Ok(())
    }
}

pub fn current() -> io::Result<String> {
    Ok(fs::read_to_string(KERNEL_HOSTNAME)?.trim_end().to_owned())
}
