use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::os::unix::fs::FileExt;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

use super::layout::Entry;

const FOLDER: &str = "disks/moves";
const KEPT: &str = "move";
const DRAFT: &str = "draft";
const EDGE: u64 = 1024 * 1024;
const RECORD_BYTES: usize = 16;
const LENGTH_BYTES: usize = 4;

#[derive(Serialize, Deserialize)]
pub struct Move {
    pub drive: String,
    pub drive_size: u64,
    pub label: String,
    pub entry: Entry,
    pub to: u64,
}

impl Move {
    pub fn head(&self) -> u64 {
        self.entry.size.min(EDGE)
    }

    pub fn tail_start(&self) -> u64 {
        self.head().max(self.entry.size.saturating_sub(EDGE))
    }

    pub fn body(&self) -> u64 {
        self.tail_start() - self.head()
    }

    pub fn distance(&self) -> u64 {
        self.entry.offset.abs_diff(self.to)
    }

    pub fn overlaps(&self) -> bool {
        self.distance() < self.entry.size
    }
}

pub struct Edges {
    pub head: Vec<u8>,
    pub tail: Vec<u8>,
}

pub struct Journal {
    path: PathBuf,
    file: File,
    stash_at: u64,
    pub plan: Move,
    pub edges: Edges,
    pub copied: u64,
    pub stashed: u64,
}

pub fn folder() -> PathBuf {
    dirs::state_dir()
        .expect("a session always has a home folder")
        .join(FOLDER)
}

fn persist_folder(path: &Path) -> io::Result<()> {
    File::open(path.parent().expect("journals live in a folder"))?.sync_all()
}

struct Header {
    plan: Move,
    copied: u64,
    stashed: u64,
    length: u64,
}

fn word(bytes: &[u8]) -> u64 {
    u64::from_le_bytes(bytes.try_into().expect("a record holds two words"))
}

fn read_header(file: &mut File) -> io::Result<Header> {
    let mut record = [0; RECORD_BYTES];
    file.read_exact(&mut record)?;
    let mut length = [0; LENGTH_BYTES];
    file.read_exact(&mut length)?;
    let mut header = vec![0; u32::from_le_bytes(length) as usize];
    file.read_exact(&mut header)?;
    Ok(Header {
        plan: serde_json::from_slice(&header)?,
        copied: word(&record[..8]),
        stashed: word(&record[8..]),
        length: (RECORD_BYTES + LENGTH_BYTES + header.len()) as u64,
    })
}

impl Journal {
    pub fn create(folder: &Path, plan: Move, edges: Edges) -> io::Result<Self> {
        fs::create_dir_all(folder)?;
        let started = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_or(0, |since| since.as_millis());
        let path = folder.join(format!("{started}.{KEPT}"));
        let draft = path.with_extension(DRAFT);
        let header = serde_json::to_vec(&plan)?;
        let mut file = File::options()
            .read(true)
            .write(true)
            .create_new(true)
            .open(&draft)?;
        file.write_all(&[0; RECORD_BYTES])?;
        file.write_all(&(header.len() as u32).to_le_bytes())?;
        file.write_all(&header)?;
        file.write_all(&edges.head)?;
        file.write_all(&edges.tail)?;
        file.sync_all()?;
        fs::rename(&draft, &path)?;
        persist_folder(&path)?;
        Ok(Self {
            path,
            file,
            stash_at: (RECORD_BYTES + LENGTH_BYTES + header.len()) as u64 + plan.entry.size
                - plan.body(),
            plan,
            edges,
            copied: 0,
            stashed: 0,
        })
    }

    pub fn open(folder: &Path, id: &str) -> io::Result<Self> {
        let path = folder.join(id).with_extension(KEPT);
        let mut file = File::options().read(true).write(true).open(&path)?;
        let Header {
            plan,
            copied,
            stashed,
            length,
        } = read_header(&mut file)?;
        let mut head = vec![0; plan.head() as usize];
        file.read_exact(&mut head)?;
        let mut tail = vec![0; (plan.entry.size - plan.tail_start()) as usize];
        file.read_exact(&mut tail)?;
        Ok(Self {
            path,
            file,
            stash_at: length + plan.entry.size - plan.body(),
            plan,
            edges: Edges { head, tail },
            copied,
            stashed,
        })
    }

    fn record(&mut self, copied: u64, stashed: u64) -> io::Result<()> {
        let mut record = [0; RECORD_BYTES];
        record[..8].copy_from_slice(&copied.to_le_bytes());
        record[8..].copy_from_slice(&stashed.to_le_bytes());
        self.file.write_all_at(&record, 0)?;
        self.file.sync_data()?;
        (self.copied, self.stashed) = (copied, stashed);
        Ok(())
    }

    pub fn stash(&mut self, bytes: &[u8]) -> io::Result<()> {
        self.file.write_all_at(bytes, self.stash_at)?;
        self.file.sync_data()?;
        self.record(self.copied, bytes.len() as u64)
    }

    pub fn read_stash(&self, bytes: &mut [u8]) -> io::Result<()> {
        self.file.read_exact_at(bytes, self.stash_at)
    }

    pub fn advance(&mut self, copied: u64) -> io::Result<()> {
        self.record(copied, 0)
    }

    pub fn finish(self) -> io::Result<()> {
        fs::remove_file(&self.path)?;
        persist_folder(&self.path)
    }
}

pub struct Kept {
    pub id: String,
    pub plan: Move,
    pub copied: u64,
}

pub fn kept() -> Vec<Kept> {
    kept_in(&folder())
}

pub fn kept_in(folder: &Path) -> Vec<Kept> {
    let Ok(entries) = fs::read_dir(folder) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            if path.extension().is_some_and(|extension| extension == DRAFT) {
                let _ = fs::remove_file(&path);
                return None;
            }
            let header = read_header(&mut File::open(&path).ok()?).ok()?;
            Some(Kept {
                id: path.file_stem()?.to_str()?.to_owned(),
                plan: header.plan,
                copied: header.copied,
            })
        })
        .collect()
}

pub fn discard(id: &str) {
    let path = folder().join(id).with_extension(KEPT);
    let _ = fs::remove_file(&path);
    let _ = persist_folder(&path);
}
