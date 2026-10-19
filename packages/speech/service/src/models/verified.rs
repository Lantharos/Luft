use std::collections::HashMap;
use std::fs;
use std::io::Read;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

use anyhow::Result;
use sha2::{Digest, Sha256};

use super::download::BUFFER;
use super::manifest::File;

pub const RECORD: &str = ".verified";

/// Files of a model whose checksum was confirmed, remembered by the file's
/// identity on disk so a later download doesn't read them again.
pub struct Verified {
    path: PathBuf,
    stamps: HashMap<String, String>,
}

impl Verified {
    pub fn load(folder: &Path) -> Self {
        let path = folder.join(RECORD);
        let stamps = fs::read_to_string(&path)
            .unwrap_or_default()
            .lines()
            .filter_map(|line| line.split_once('\t'))
            .map(|(name, stamp)| (name.to_owned(), stamp.to_owned()))
            .collect();
        Self { path, stamps }
    }

    pub fn confirm(&mut self, target: &Path, file: &File) -> Result<bool> {
        let Ok(meta) = fs::metadata(target) else {
            return Ok(false);
        };
        if meta.len() != file.size {
            return Ok(false);
        }
        if self.stamps.get(&file.name) == Some(&stamp(&meta, file)) {
            return Ok(true);
        }
        if digest(target)? != file.sha256 {
            fs::remove_file(target)?;
            return Ok(false);
        }
        self.record(target, file)?;
        Ok(true)
    }

    pub fn record(&mut self, target: &Path, file: &File) -> Result<()> {
        self.stamps
            .insert(file.name.clone(), stamp(&fs::metadata(target)?, file));
        let contents: String = self
            .stamps
            .iter()
            .map(|(name, stamp)| format!("{name}\t{stamp}\n"))
            .collect();
        fs::write(&self.path, contents)?;
        Ok(())
    }
}

fn stamp(meta: &fs::Metadata, file: &File) -> String {
    format!(
        "{} {} {} {} {}.{}",
        file.sha256,
        meta.dev(),
        meta.ino(),
        meta.len(),
        meta.mtime(),
        meta.mtime_nsec()
    )
}

pub fn hex(digest: impl AsRef<[u8]>) -> String {
    digest
        .as_ref()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn digest(path: &Path) -> Result<String> {
    let mut hasher = Sha256::new();
    let mut input = fs::File::open(path)?;
    let mut buffer = vec![0; BUFFER];
    loop {
        let read = input.read(&mut buffer)?;
        if read == 0 {
            return Ok(hex(hasher.finalize()));
        }
        hasher.update(&buffer[..read]);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn files_are_checked_once_and_thrown_away_when_they_differ() {
        let folder =
            std::env::temp_dir().join(format!("luft-speech-verified-{}", std::process::id()));
        fs::create_dir_all(&folder).unwrap();
        let target = folder.join("model.bin");
        fs::write(&target, b"hello").unwrap();
        let file = File {
            name: "model.bin".into(),
            size: 5,
            sha256: hex(Sha256::digest(b"hello")),
        };
        assert!(Verified::load(&folder).confirm(&target, &file).unwrap());
        assert!(
            fs::read_to_string(folder.join(RECORD))
                .unwrap()
                .starts_with("model.bin\t")
        );
        assert!(Verified::load(&folder).confirm(&target, &file).unwrap());

        fs::write(&target, b"jello").unwrap();
        assert!(!Verified::load(&folder).confirm(&target, &file).unwrap());
        assert!(!target.exists());
        fs::remove_dir_all(folder).unwrap();
    }
}
