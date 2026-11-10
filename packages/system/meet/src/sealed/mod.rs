//! The seal on a moving box. Meet Luft packs the box on a partition any
//! system can read, so everything in it is encrypted with a key only the
//! box's code gives, and a list inside the seal says which files belong in
//! it: nothing in the box can be read, swapped or added without the code.

mod blob;
mod code;
mod key;

use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::moving_box::{Manifest, inside_box};
use blob::Chunks;
pub use code::Code;
pub use key::is_sealed;

const LIST: u64 = 0;
const SMALL_FILE: u64 = 16 << 20;

/// A file in the box: where it belongs and how large it is. Files are
/// numbered in the order they're listed, starting after the list itself.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Entry {
    pub path: String,
    pub size: u64,
    #[serde(default)]
    pub modified: Option<u64>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Contents {
    pub manifest: Manifest,
    pub files: Vec<Entry>,
}

#[derive(Debug)]
pub enum Refused {
    Unsealed,
    WrongCode,
    Damaged(io::Error),
}

impl From<io::Error> for Refused {
    fn from(error: io::Error) -> Self {
        Self::Damaged(error)
    }
}

fn damaged(reason: impl std::fmt::Display) -> io::Error {
    io::Error::new(io::ErrorKind::InvalidData, reason.to_string())
}

/// A box being packed.
pub struct Packing {
    root: PathBuf,
    chunks: Chunks,
    files: Vec<Entry>,
}

impl Packing {
    /// Seals a new box at `root` and makes up the code that opens it.
    pub fn start(root: &Path) -> io::Result<(Self, Code)> {
        let code = Code::random();
        let key = key::create(root, &code)?;
        let packing = Self {
            root: root.to_owned(),
            chunks: Chunks::new(&key),
            files: Vec::new(),
        };
        Ok((packing, code))
    }

    pub fn add(
        &mut self,
        path: &str,
        modified: Option<u64>,
        source: &mut impl Read,
        progress: impl FnMut(u64),
    ) -> io::Result<()> {
        let blob = self.files.len() as u64 + 1;
        let size = self.chunks.seal(&self.root, blob, source, progress)?;
        self.files.push(Entry {
            path: path.to_owned(),
            size,
            modified,
        });
        Ok(())
    }

    pub fn finish(mut self, manifest: Manifest) -> io::Result<()> {
        let contents = Contents {
            manifest,
            files: self.files,
        };
        let list = serde_json::to_vec(&contents).map_err(damaged)?;
        self.chunks
            .seal(&self.root, LIST, &mut list.as_slice(), |_| {})
            .map(drop)
    }
}

/// A box opened with its code.
pub struct Opened {
    root: PathBuf,
    chunks: Chunks,
    pub contents: Contents,
}

impl Opened {
    pub fn open(root: &Path, code: &Code) -> Result<Self, Refused> {
        let key = key::open(root, code)?.ok_or(Refused::Unsealed)?;
        let mut chunks = Chunks::new(&key);
        let mut list = Vec::new();
        chunks
            .open(root, LIST, &mut list, |_| {})
            .map_err(|error| match error.kind() {
                io::ErrorKind::InvalidData => Refused::WrongCode,
                _ => Refused::Damaged(error),
            })?;
        let contents: Contents = serde_json::from_slice(&list).map_err(damaged)?;
        contents.manifest.check().map_err(damaged)?;
        if let Some(entry) = contents.files.iter().find(|entry| !inside_box(&entry.path)) {
            return Err(damaged(format!("{} isn't a file in the moving box", entry.path)).into());
        }
        Ok(Self {
            root: root.to_owned(),
            chunks,
            contents,
        })
    }

    /// Writes the file listed at `index` to `target`.
    pub fn extract(
        &mut self,
        index: usize,
        target: &mut impl Write,
        progress: impl FnMut(u64),
    ) -> io::Result<()> {
        let entry = &self.contents.files[index];
        let size = self
            .chunks
            .open(&self.root, index as u64 + 1, target, progress)?;
        if size != entry.size {
            return Err(damaged(format!(
                "{} isn't the size it was packed with",
                entry.path
            )));
        }
        Ok(())
    }

    pub fn find(&self, path: &str) -> io::Result<usize> {
        self.contents
            .files
            .iter()
            .position(|entry| entry.path == path)
            .ok_or_else(|| damaged(format!("{path} is missing from the moving box")))
    }

    /// Reads one of the box's small files, such as a saved network.
    pub fn read(&mut self, path: &str) -> io::Result<Vec<u8>> {
        let index = self.find(path)?;
        if self.contents.files[index].size > SMALL_FILE {
            return Err(damaged(format!("{path} is too large")));
        }
        let mut file = Vec::new();
        self.extract(index, &mut file, |_| {})?;
        Ok(file)
    }
}

#[cfg(test)]
mod tests;
