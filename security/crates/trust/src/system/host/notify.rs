use std::os::linux::net::SocketAddrExt;
use std::os::unix::net::{SocketAddr, UnixDatagram};

use anyhow::{Context, Result};

pub fn ready() -> Result<()> {
    let Some(socket) = std::env::var_os("NOTIFY_SOCKET") else {
        return Ok(());
    };
    let socket = socket
        .to_str()
        .context("systemd's notify socket has no readable name")?;
    let address = match socket.strip_prefix('@') {
        Some(name) => SocketAddr::from_abstract_name(name)?,
        None => SocketAddr::from_pathname(socket)?,
    };
    UnixDatagram::unbound()?
        .send_to_addr(b"READY=1", &address)
        .context("systemd didn't hear that Luft is ready")?;
    Ok(())
}
