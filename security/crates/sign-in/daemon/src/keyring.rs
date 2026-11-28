use std::os::unix::net::UnixStream;
use std::time::Duration;

use luft_keyring_wire::{Grant, GrantReason, Reply, Request, SOCKET, Secret, Token, read, write};

const TIMEOUT: Duration = Duration::from_secs(2);

/// Lets a keyring that is open now also open with the key or card just
/// added, without waiting for its first sign-in.
pub fn key_added(user: u32, id: &str, secret: &[u8], enrolled: Vec<String>) {
    let Ok(mut stream) = UnixStream::connect(SOCKET) else {
        return;
    };
    let _ = stream.set_read_timeout(Some(TIMEOUT));
    let _ = stream.set_write_timeout(Some(TIMEOUT));
    let grant = Grant {
        user,
        password: None,
        token: Some(Token {
            id: id.to_owned(),
            secret: Secret::copy_of(secret),
            enrolled,
        }),
        reason: GrantReason::KeyAdded,
    };
    if write(&mut stream, &Request::Grant(grant)).is_ok() {
        let _ = read::<Reply>(&mut stream);
    }
}
