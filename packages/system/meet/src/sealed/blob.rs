use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};

use chacha20poly1305::aead::{AeadInOut, KeyInit};
use chacha20poly1305::{Tag, XChaCha20Poly1305, XNonce};

use super::key::Key;

const BLOBS: &str = "blobs";
const SHARD: u64 = 1024;
pub const CHUNK: usize = 1 << 20;
const TAG: usize = 16;
const SEALED_CHUNK: u64 = (CHUNK + TAG) as u64;

fn path(root: &Path, blob: u64) -> PathBuf {
    root.join(BLOBS)
        .join((blob / SHARD).to_string())
        .join(blob.to_string())
}

/// Every chunk has a nonce of its own: the blob it belongs to, where it
/// comes in the blob, and whether it's the last, so chunks can't be moved,
/// dropped or cut off without the box noticing.
fn nonce(blob: u64, chunk: u64, last: bool) -> XNonce {
    let mut nonce = XNonce::default();
    nonce[..8].copy_from_slice(&blob.to_le_bytes());
    nonce[8..16].copy_from_slice(&chunk.to_le_bytes());
    nonce[16] = u8::from(last);
    nonce
}

fn fill(source: &mut impl Read, buffer: &mut [u8]) -> io::Result<usize> {
    let mut filled = 0;
    while filled < buffer.len() {
        match source.read(&mut buffer[filled..]) {
            Ok(0) => break,
            Ok(read) => filled += read,
            Err(error) if error.kind() == io::ErrorKind::Interrupted => {}
            Err(error) => return Err(error),
        }
    }
    Ok(filled)
}

fn damaged() -> io::Error {
    io::Error::new(
        io::ErrorKind::InvalidData,
        "the moving box was changed or damaged",
    )
}

/// The buffers one box is sealed or opened with, a megabyte at a time.
pub struct Chunks {
    cipher: XChaCha20Poly1305,
    current: Vec<u8>,
    next: Vec<u8>,
}

impl Chunks {
    pub fn new(key: &Key) -> Self {
        Self {
            cipher: XChaCha20Poly1305::new((&**key).into()),
            current: vec![0; CHUNK + TAG],
            next: vec![0; CHUNK + TAG],
        }
    }

    /// Seals everything `source` holds into `blob` and returns how many
    /// bytes that was, telling `progress` after each chunk.
    pub fn seal(
        &mut self,
        root: &Path,
        blob: u64,
        source: &mut impl Read,
        mut progress: impl FnMut(u64),
    ) -> io::Result<u64> {
        let path = path(root, blob);
        fs::create_dir_all(path.parent().expect("blobs live in folders"))?;
        let mut sealed = File::create(path)?;
        let name = blob.to_string();
        let mut size = 0;
        let mut held = fill(source, &mut self.current[..CHUNK])?;
        for chunk in 0.. {
            let following = if held == CHUNK {
                fill(source, &mut self.next[..CHUNK])?
            } else {
                0
            };
            let last = following == 0;
            let tag = self
                .cipher
                .encrypt_inout_detached(
                    &nonce(blob, chunk, last),
                    name.as_bytes(),
                    (&mut self.current[..held]).into(),
                )
                .map_err(io::Error::other)?;
            self.current[held..held + TAG].copy_from_slice(&tag);
            sealed.write_all(&self.current[..held + TAG])?;
            size += held as u64;
            progress(held as u64);
            if last {
                break;
            }
            std::mem::swap(&mut self.current, &mut self.next);
            held = following;
        }
        Ok(size)
    }

    /// Opens `blob` into `target` and returns how many bytes it held.
    pub fn open(
        &mut self,
        root: &Path,
        blob: u64,
        target: &mut impl Write,
        mut progress: impl FnMut(u64),
    ) -> io::Result<u64> {
        let mut sealed = File::open(path(root, blob))?;
        let chunks = sealed.metadata()?.len().div_ceil(SEALED_CHUNK).max(1);
        let name = blob.to_string();
        let mut size = 0;
        for chunk in 0..chunks {
            let held = fill(&mut sealed, &mut self.current)?;
            let text = held.checked_sub(TAG).ok_or_else(damaged)?;
            let (message, tag) = self.current[..held].split_at_mut(text);
            let tag = Tag::try_from(&*tag).map_err(|_| damaged())?;
            self.cipher
                .decrypt_inout_detached(
                    &nonce(blob, chunk, chunk + 1 == chunks),
                    name.as_bytes(),
                    message.into(),
                    &tag,
                )
                .map_err(|_| damaged())?;
            target.write_all(&self.current[..text])?;
            size += text as u64;
            progress(text as u64);
        }
        Ok(size)
    }
}
