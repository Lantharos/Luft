use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;

use anyhow::{Context, Result};

const HEADERS: usize = 4096;
const SYMBOL_SIZE: u64 = 18;
const LONGEST_NAME: usize = 64;

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

fn short_name(raw: &[u8]) -> String {
    let name = raw.split(|byte| *byte == 0).next().unwrap_or_default();
    String::from_utf8_lossy(name).into_owned()
}

fn read_at(file: &mut File, offset: u64, size: usize) -> Option<Vec<u8>> {
    let mut data = vec![0u8; size];
    file.seek(SeekFrom::Start(offset)).ok()?;
    let read = file.read(&mut data).ok()?;
    data.truncate(read);
    Some(data)
}

fn long_name(file: &mut File, strings: u64, name: &str) -> Option<String> {
    let offset: u64 = name.strip_prefix('/')?.parse().ok()?;
    Some(short_name(&read_at(file, strings + offset, LONGEST_NAME)?))
}

fn base_sections(file: &mut File, headers: &[u8]) -> Option<Vec<(String, Section)>> {
    let pe = u32_at(headers, 0x3c)?;
    if headers.get(pe..pe + 4)? != b"PE\0\0" {
        return None;
    }
    let strings = u32_at(headers, pe + 12)? as u64 + u32_at(headers, pe + 16)? as u64 * SYMBOL_SIZE;
    let table = pe + 24 + u16_at(headers, pe + 20)?;
    let all: Vec<(String, Section)> = (0..u16_at(headers, pe + 6)?)
        .map_while(|index| {
            let entry = headers.get(table + index * 40..table + index * 40 + 40)?;
            let name = short_name(&entry[..8]);
            Some((
                long_name(file, strings, &name).unwrap_or(name),
                Section {
                    offset: u32_at(entry, 20)? as u64,
                    size: u32_at(entry, 8)?.min(u32_at(entry, 16)?) as u64,
                },
            ))
        })
        .collect();
    let profiles = all
        .iter()
        .position(|(name, _)| name.starts_with(".profile"))
        .unwrap_or(all.len());
    Some(all.into_iter().take(profiles).collect())
}

pub struct PeFile {
    file: File,
    sections: Vec<(String, Section)>,
}

impl PeFile {
    pub fn open(path: &Path) -> Result<Self> {
        let mut file =
            File::open(path).with_context(|| format!("{} can't be read.", path.display()))?;
        let mut headers = vec![0u8; HEADERS];
        let read = file.read(&mut headers)?;
        let sections = base_sections(&mut file, &headers[..read])
            .with_context(|| format!("{} isn't an EFI program.", path.display()))?;
        Ok(Self { file, sections })
    }

    pub fn section(&mut self, wanted: &str) -> Result<Vec<u8>> {
        let section = self
            .sections
            .iter()
            .find(|(name, _)| name == wanted)
            .map(|(_, section)| section)
            .with_context(|| format!("There's no {wanted} section."))?;
        let mut data = vec![0u8; section.size as usize];
        self.file.seek(SeekFrom::Start(section.offset))?;
        self.file.read_exact(&mut data)?;
        Ok(data)
    }
}
