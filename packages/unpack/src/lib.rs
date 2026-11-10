mod formats;
mod unpacker;

use std::io;

pub use formats::{unpack_tar, unpack_zip};

#[derive(Clone, Copy)]
pub struct Rules {
    pub max_bytes: u64,
    pub max_entries: u32,
    pub outward_links: bool,
    pub keep_metadata: bool,
}

#[derive(Debug)]
pub enum Error {
    TooLarge,
    Damaged(io::Error),
    Io(io::Error),
}

impl From<io::Error> for Error {
    fn from(error: io::Error) -> Self {
        Error::Io(error)
    }
}

impl From<Error> for io::Error {
    fn from(error: Error) -> Self {
        match error {
            Error::TooLarge => io::Error::new(
                io::ErrorKind::FileTooLarge,
                "The archive unpacks to more than is allowed",
            ),
            Error::Damaged(error) | Error::Io(error) => error,
        }
    }
}

#[cfg(test)]
mod tests;
