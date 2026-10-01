use std::os::unix::net::UnixStream;
use std::time::Duration;

use luft_keyring_wire::{Grant, Reply, Request, SOCKET, read, write};

const TIMEOUT: Duration = Duration::from_secs(2);

pub fn grant(grant: Grant) {
    let Ok(mut stream) = UnixStream::connect(SOCKET) else {
        return;
    };
    let _ = stream.set_read_timeout(Some(TIMEOUT));
    let _ = stream.set_write_timeout(Some(TIMEOUT));
    if write(&mut stream, &Request::Grant(grant)).is_ok() {
        let _ = read::<Reply>(&mut stream);
    }
}
