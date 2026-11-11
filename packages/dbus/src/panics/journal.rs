//! Structured entries for the systemd journal, in its native protocol.

use std::os::unix::net::UnixDatagram;

const SOCKET: &str = "/run/systemd/journal/socket";

fn entry(fields: &[(&str, &str)]) -> Vec<u8> {
    let mut datagram = Vec::new();
    for (name, value) in fields {
        datagram.extend_from_slice(name.as_bytes());
        datagram.push(b'\n');
        datagram.extend_from_slice(&(value.len() as u64).to_le_bytes());
        datagram.extend_from_slice(value.as_bytes());
        datagram.push(b'\n');
    }
    datagram
}

pub fn send(fields: &[(&str, &str)]) {
    if let Ok(socket) = UnixDatagram::unbound() {
        let _ = socket.send_to(&entry(fields), SOCKET);
    }
}

#[cfg(test)]
mod tests {
    use super::entry;

    #[test]
    fn values_carry_their_length() {
        assert_eq!(
            entry(&[("MESSAGE", "two\nlines")]),
            b"MESSAGE\n\x09\0\0\0\0\0\0\0two\nlines\n"
        );
    }
}
