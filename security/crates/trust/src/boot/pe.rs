use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;

use anyhow::{Context, Result};

const HEADERS: usize = 4096;

pub struct Section {
    offset: u64,
    size: u64,
}

fn u16_at(data: &[u8], at: usize) -> Option<usize> {
    Some(u16::from_le_bytes(data.get(at..at + 2)?.try_into().ok()?) as usize)
}

fn u32_at(data: &[u8], at: usize) -> Option<usize> {
    Some(u32::from_le_bytes(data.get(at..at + 4)?.try_into().ok()?) as usize)
}

fn base_sections(headers: &[u8]) -> Option<Vec<([u8; 8], Section)>> {
    let pe = u32_at(headers, 0x3c)?;
    if headers.get(pe..pe + 4)? != b"PE\0\0" {
        return None;
    }
    let table = pe + 24 + u16_at(headers, pe + 20)?;
    let all: Vec<([u8; 8], Section)> = (0..u16_at(headers, pe + 6)?)
        .map_while(|index| {
            let entry = headers.get(table + index * 40..table + index * 40 + 40)?;
            Some((
                entry[..8].try_into().ok()?,
                Section {
                    offset: u32_at(entry, 20)? as u64,
                    size: u32_at(entry, 8)?.min(u32_at(entry, 16)?) as u64,
                },
            ))
        })
        .collect();
    let profiles = all
        .iter()
        .position(|(name, _)| name.starts_with(b".profile"))
        .unwrap_or(all.len());
    Some(all.into_iter().take(profiles).collect())
}

pub struct StartupImage {
    file: File,
    sections: Vec<([u8; 8], Section)>,
}

impl StartupImage {
    pub fn open(path: &Path) -> Result<Self> {
        let mut file =
            File::open(path).with_context(|| format!("{} can't be read.", path.display()))?;
        let mut headers = vec![0u8; HEADERS];
        let read = file.read(&mut headers)?;
        let sections = base_sections(&headers[..read])
            .with_context(|| format!("{} isn't a startup image.", path.display()))?;
        Ok(Self { file, sections })
    }

    pub fn section(&mut self, wanted: &str) -> Result<Vec<u8>> {
        let section = self
            .sections
            .iter()
            .find(|(name, _)| name.split(|byte| *byte == 0).next() == Some(wanted.as_bytes()))
            .map(|(_, section)| section)
            .with_context(|| format!("The startup image has no {wanted} section."))?;
        let mut data = vec![0u8; section.size as usize];
        self.file.seek(SeekFrom::Start(section.offset))?;
        self.file.read_exact(&mut data)?;
        Ok(data)
    }
}
