use std::fs::File;
use std::io::Read;
use std::os::fd::OwnedFd;

use crate::error::Error;

const MAX_BYTES: u64 = 256 << 10;

pub fn prepare(source: OwnedFd) -> Result<Vec<u8>, Error> {
    let unreadable = || Error::invalid("The display arrangement can't be read");
    let mut file = File::from(source);
    if !file.metadata().map_err(|_| unreadable())?.is_file() {
        return Err(unreadable());
    }
    let mut contents = Vec::new();
    (&mut file)
        .take(MAX_BYTES + 1)
        .read_to_end(&mut contents)
        .map_err(|_| unreadable())?;
    let text = std::str::from_utf8(&contents).map_err(|_| unreadable())?;
    if contents.len() as u64 > MAX_BYTES || !text.contains("<monitors") {
        return Err(unreadable());
    }
    Ok(contents)
}
