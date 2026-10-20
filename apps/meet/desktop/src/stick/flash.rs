use std::io::{self, Read, Write};

use luft_i18n::t;
use sha2::{Digest, Sha256};

use crate::L10N;

const CHUNK: usize = 4 << 20;
const ALIGNMENT: usize = 4096;

pub struct Aligned {
    storage: Vec<u8>,
    start: usize,
}

impl Aligned {
    pub fn new() -> Self {
        let storage = vec![0; CHUNK + ALIGNMENT];
        let start = storage.as_ptr().align_offset(ALIGNMENT);
        Self { storage, start }
    }

    pub fn bytes(&mut self) -> &mut [u8] {
        &mut self.storage[self.start..self.start + CHUNK]
    }
}

fn fill(source: &mut impl Read, buffer: &mut [u8]) -> io::Result<()> {
    source.read_exact(buffer).map_err(|error| {
        if error.kind() == io::ErrorKind::UnexpectedEof {
            io::Error::new(
                io::ErrorKind::UnexpectedEof,
                t!(L10N, "stick-iso-ended-early"),
            )
        } else {
            error
        }
    })
}

fn padded(length: usize, sector: u64) -> usize {
    length.div_ceil(sector as usize) * sector as usize
}

pub fn write(
    image: &mut impl Read,
    length: u64,
    sector: u64,
    device: &mut impl Write,
    mut progress: impl FnMut(u64),
) -> io::Result<[u8; 32]> {
    let mut buffer = Aligned::new();
    let mut hasher = Sha256::new();
    let mut done = 0u64;
    while done < length {
        let wanted = (length - done).min(CHUNK as u64) as usize;
        let chunk = buffer.bytes();
        fill(image, &mut chunk[..wanted])?;
        hasher.update(&chunk[..wanted]);
        let whole = padded(wanted, sector);
        chunk[wanted..whole].fill(0);
        device.write_all(&chunk[..whole])?;
        done += wanted as u64;
        progress(done);
    }
    device.flush()?;
    Ok(hasher.finalize().into())
}

pub fn read_back(
    device: &mut impl Read,
    length: u64,
    sector: u64,
    mut progress: impl FnMut(u64),
) -> io::Result<[u8; 32]> {
    let mut buffer = Aligned::new();
    let mut hasher = Sha256::new();
    let mut done = 0u64;
    while done < length {
        let wanted = (length - done).min(CHUNK as u64) as usize;
        let chunk = buffer.bytes();
        let whole = padded(wanted, sector);
        let mut read = 0;
        while read < wanted {
            match device.read(&mut chunk[read..whole])? {
                0 => return Err(io::ErrorKind::UnexpectedEof.into()),
                count => read += count,
            }
        }
        hasher.update(&chunk[..wanted]);
        done += wanted as u64;
        progress(done);
    }
    Ok(hasher.finalize().into())
}

#[cfg(test)]
mod tests {
    use std::io::Cursor;

    use super::*;

    fn image(length: usize) -> Vec<u8> {
        (0..length).map(|index| (index % 251) as u8).collect()
    }

    #[test]
    fn what_is_written_reads_back_with_the_same_digest() {
        let iso = image(CHUNK * 2 + 2048);
        let mut stick = Cursor::new(vec![0xff; CHUNK * 3]);
        let mut seen = Vec::new();
        let written = write(&mut &iso[..], iso.len() as u64, 512, &mut stick, |done| {
            seen.push(done)
        })
        .unwrap();
        assert_eq!(written, <[u8; 32]>::from(Sha256::digest(&iso)));
        assert_eq!(seen.last(), Some(&(iso.len() as u64)));
        stick.set_position(0);
        let read = read_back(&mut stick, iso.len() as u64, 512, |_| {}).unwrap();
        assert_eq!(read, written);
        assert_eq!(&stick.get_ref()[..iso.len()], &iso[..]);
    }

    #[test]
    fn the_last_chunk_fills_a_whole_sector() {
        let iso = image(4096 + 2048);
        let mut stick = Cursor::new(vec![0xff; 16384]);
        write(&mut &iso[..], iso.len() as u64, 4096, &mut stick, |_| {}).unwrap();
        assert_eq!(stick.position(), 8192);
        assert!(
            stick.get_ref()[iso.len()..8192]
                .iter()
                .all(|byte| *byte == 0)
        );
    }

    #[test]
    fn a_damaged_stick_reads_back_differently() {
        let iso = image(CHUNK + 4096);
        let mut stick = Cursor::new(vec![0; CHUNK * 2]);
        let written = write(&mut &iso[..], iso.len() as u64, 512, &mut stick, |_| {}).unwrap();
        stick.get_mut()[CHUNK + 7] ^= 1;
        stick.set_position(0);
        assert_ne!(
            read_back(&mut stick, iso.len() as u64, 512, |_| {}).unwrap(),
            written
        );
    }

    #[test]
    fn a_short_iso_is_an_error() {
        let iso = image(1000);
        let mut stick = Cursor::new(vec![0; 4096]);
        assert!(write(&mut &iso[..], 2048, 512, &mut stick, |_| {}).is_err());
    }
}
