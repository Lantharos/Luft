use alloc::string::{String, ToString};
use alloc::vec;
use alloc::vec::Vec;

use uefi::proto::media::file::RegularFile;

const HEADERS: usize = 4096;
const LARGEST_TEXT: usize = 4096;

struct Section {
    name: [u8; 8],
    offset: u64,
    size: usize,
}

impl Section {
    fn is(&self, wanted: &[u8]) -> bool {
        self.name.split(|byte| *byte == 0).next() == Some(wanted)
    }
}

pub struct Profile {
    pub id: Option<String>,
    pub title: Option<String>,
}

pub struct Uki {
    pub os: String,
    pub name: Option<String>,
    pub version: Option<String>,
    pub profiles: Vec<Profile>,
}

fn u16_at(data: &[u8], at: usize) -> Option<usize> {
    Some(u16::from_le_bytes(data.get(at..at + 2)?.try_into().ok()?) as usize)
}

fn u32_at(data: &[u8], at: usize) -> Option<usize> {
    Some(u32::from_le_bytes(data.get(at..at + 4)?.try_into().ok()?) as usize)
}

fn sections(file: &mut RegularFile) -> Option<Vec<Section>> {
    let mut headers = vec![0u8; HEADERS];
    let read = file.read(&mut headers).ok()?;
    headers.truncate(read);
    let pe = u32_at(&headers, 0x3c)?;
    if headers.get(pe..pe + 4)? != b"PE\0\0" {
        return None;
    }
    let count = u16_at(&headers, pe + 6)?;
    let table = pe + 24 + u16_at(&headers, pe + 20)?;
    Some(
        (0..count)
            .map_while(|index| {
                let entry = headers.get(table + index * 40..table + index * 40 + 40)?;
                Some(Section {
                    name: entry[..8].try_into().ok()?,
                    size: u32_at(entry, 8)?.min(u32_at(entry, 16)?),
                    offset: u32_at(entry, 20)? as u64,
                })
            })
            .collect(),
    )
}

fn text(file: &mut RegularFile, section: &Section) -> Option<String> {
    let mut data = vec![0u8; section.size.min(LARGEST_TEXT)];
    file.set_position(section.offset).ok()?;
    let read = file.read(&mut data).ok()?;
    let end = data[..read]
        .iter()
        .position(|byte| *byte == 0)
        .unwrap_or(read);
    Some(String::from_utf8_lossy(&data[..end]).into_owned())
}

fn field(environment: &str, key: &str) -> Option<String> {
    environment.lines().find_map(|line| {
        let value = line.trim().strip_prefix(key)?.strip_prefix('=')?;
        Some(value.trim().trim_matches(['"', '\'']).to_string())
    })
}

pub fn uki(file: &mut RegularFile) -> Option<Uki> {
    let sections = sections(file)?;
    sections.iter().find(|section| section.is(b".linux"))?;
    let base = sections
        .iter()
        .position(|section| section.is(b".profile"))
        .unwrap_or(sections.len());
    let base_text = |file: &mut RegularFile, name: &[u8]| {
        sections[..base]
            .iter()
            .find(|section| section.is(name))
            .and_then(|section| text(file, section))
    };
    let release = base_text(file, b".osrel").unwrap_or_default();
    let version = base_text(file, b".uname").map(|version| version.trim().to_string());
    let profiles = sections[base..]
        .iter()
        .filter(|section| section.is(b".profile"))
        .map(|section| {
            let profile = text(file, section).unwrap_or_default();
            Profile {
                id: field(&profile, "ID"),
                title: field(&profile, "TITLE"),
            }
        })
        .collect();
    Some(Uki {
        os: field(&release, "ID").unwrap_or_default(),
        name: field(&release, "PRETTY_NAME").or_else(|| field(&release, "NAME")),
        version,
        profiles,
    })
}

pub fn is_sushiboot(file: &mut RegularFile) -> bool {
    sections(file).is_some_and(|sections| {
        sections
            .iter()
            .filter(|section| section.is(b".sbat"))
            .filter_map(|section| text(file, section))
            .any(|sbat| sbat.lines().any(|line| line.starts_with("sushiboot,")))
    })
}
