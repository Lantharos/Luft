use std::collections::HashMap;
use std::fs::File;
use std::io::Read;
use std::ops::Range;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::SystemTime;

use sha1::Sha1;
use sha2::{Digest, Sha256};

const CHUNK: usize = 1 << 20;

type HashKey = (PathBuf, u64, Option<SystemTime>);

static SHA1: Mutex<Option<HashMap<HashKey, String>>> = Mutex::new(None);

#[derive(Clone, Debug)]
pub enum Expected {
    Sha1(String),
    Sha256(String),
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn each_chunk(path: &Path, mut take: impl FnMut(u64, &mut [u8])) -> Result<(), String> {
    let mut file = File::open(path).map_err(|error| error.to_string())?;
    let mut buffer = vec![0u8; CHUNK];
    let mut offset = 0u64;
    loop {
        let read = file.read(&mut buffer).map_err(|error| error.to_string())?;
        if read == 0 {
            return Ok(());
        }
        take(offset, &mut buffer[..read]);
        offset += read as u64;
    }
}

pub fn sha1_of(path: &Path) -> Result<String, String> {
    let metadata = path.metadata().map_err(|error| error.to_string())?;
    let key = (path.to_path_buf(), metadata.len(), metadata.modified().ok());
    if let Some(hash) = SHA1
        .lock()
        .ok()
        .and_then(|hashes| hashes.as_ref()?.get(&key).cloned())
    {
        return Ok(hash);
    }
    let mut hasher = Sha1::new();
    each_chunk(path, |_, chunk| hasher.update(chunk))?;
    let hash = hex(&hasher.finalize());
    if let Ok(mut hashes) = SHA1.lock() {
        hashes.get_or_insert_default().insert(key, hash.clone());
    }
    Ok(hash)
}

fn zero(chunk: &mut [u8], start: u64, ranges: &[Range<u64>]) {
    let end = start + chunk.len() as u64;
    for range in ranges {
        let from = range.start.max(start);
        let to = range.end.min(end);
        if from < to {
            chunk[(from - start) as usize..(to - start) as usize].fill(0);
        }
    }
}

pub struct Checked {
    pub matches: bool,
    pub signed: Option<String>,
}

pub fn check(
    path: &Path,
    expected: &Expected,
    unsigned: Option<&[Range<u64>]>,
) -> Result<Checked, String> {
    let mut sha1 = Sha1::new();
    let mut sha256 = Sha256::new();
    let mut signed = unsigned.map(|_| Sha256::new());
    each_chunk(path, |offset, chunk| {
        match expected {
            Expected::Sha1(_) => sha1.update(&*chunk),
            Expected::Sha256(_) => sha256.update(&*chunk),
        }
        if let (Some(signed), Some(ranges)) = (signed.as_mut(), unsigned) {
            zero(chunk, offset, ranges);
            signed.update(&*chunk);
        }
    })?;
    let matches = match expected {
        Expected::Sha1(hash) => hex(&sha1.finalize()) == *hash,
        Expected::Sha256(hash) => hex(&sha256.finalize()) == *hash,
    };
    Ok(Checked {
        matches,
        signed: signed.map(|signed| hex(&signed.finalize())),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn zeroes_only_the_overlapping_bytes() {
        let mut chunk = [1u8; 8];
        zero(&mut chunk, 100, &[96..102, 106..120, 200..210]);
        assert_eq!(chunk, [0, 0, 1, 1, 1, 1, 0, 0]);
    }
}
