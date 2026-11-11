//! The socket programs tell the collector on that something new is in the
//! journal: the one systemd hands over, or, for a development build, one at
//! the path a test session names.

use std::os::fd::{FromRawFd, OwnedFd};

use luft_identity::program;
use tokio::net::UnixDatagram;

const FIRST_HANDED_OVER: i32 = 3;
const DEVELOPMENT_SOCKET: &str = "LUFT_CRASH_COLLECTOR_POKE";

fn handed_over() -> Option<OwnedFd> {
    let ours = std::env::var("LISTEN_PID").ok()?.parse::<u32>().ok()? == std::process::id();
    let count: i32 = std::env::var("LISTEN_FDS").ok()?.parse().ok()?;
    (ours && count >= 1).then(|| unsafe { OwnedFd::from_raw_fd(FIRST_HANDED_OVER) })
}

pub fn socket() -> anyhow::Result<Option<UnixDatagram>> {
    if let Some(fd) = handed_over() {
        let socket = std::os::unix::net::UnixDatagram::from(fd);
        socket.set_nonblocking(true)?;
        return Ok(Some(UnixDatagram::from_std(socket)?));
    }
    let Some(path) =
        std::env::var_os(DEVELOPMENT_SOCKET).filter(|_| program::is_development_build())
    else {
        return Ok(None);
    };
    let _ = std::fs::remove_file(&path);
    Ok(Some(UnixDatagram::bind(path)?))
}

/// Waits for a poke, then takes every other one that came with it.
pub async fn next(socket: &UnixDatagram) {
    let mut buffer = [0u8; 16];
    if socket.recv(&mut buffer).await.is_ok() {
        while socket.try_recv(&mut buffer).is_ok() {}
    }
}
