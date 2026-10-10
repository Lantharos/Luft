use std::fs::File;
use std::io::{self, Read};
use std::path::PathBuf;

const LETTERS: &[u8] = b"abcdefghijkmnpqrstuvwxyz";
const ALPHABET: &[u8] = b"abcdefghijkmnpqrstuvwxyz23456789";
const HANDLE_LENGTH: usize = 10;

pub fn runtime() -> io::Result<PathBuf> {
    std::env::var_os("XDG_RUNTIME_DIR")
        .map(PathBuf::from)
        .ok_or_else(|| {
            io::Error::other(
                "XDG_RUNTIME_DIR isn't set, so there is no private place for the display",
            )
        })
}

pub fn root() -> io::Result<PathBuf> {
    Ok(runtime()?.join("peek"))
}

pub fn display(handle: &str) -> io::Result<PathBuf> {
    Ok(root()?.join(handle))
}

pub fn bus(handle: &str) -> io::Result<PathBuf> {
    Ok(display(handle)?.join("bus"))
}

pub fn wayland_socket(handle: &str) -> String {
    format!("peek-{handle}")
}

pub fn is_running(handle: &str) -> bool {
    bus(handle).is_ok_and(|bus| bus.exists())
}

pub fn new_handle() -> io::Result<String> {
    let mut bytes = [0; HANDLE_LENGTH];
    File::open("/dev/urandom")?.read_exact(&mut bytes)?;
    Ok(bytes
        .iter()
        .enumerate()
        .map(|(index, byte)| {
            let characters = if index == 0 { LETTERS } else { ALPHABET };
            char::from(characters[usize::from(*byte) % characters.len()])
        })
        .collect())
}
