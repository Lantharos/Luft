use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::ops::Range;
use std::path::Path;

const MAGIC: [u8; 4] = [0x7f, b'E', b'L', b'F'];
const APPIMAGE_TYPE_2: [u8; 3] = [b'A', b'I', 2];
const WIDE_ENTRY: u64 = 64;
const NARROW_ENTRY: u64 = 40;
const MAX_SECTIONS: u64 = 1024;
const MAX_SECTION_BYTES: u64 = 1 << 20;

struct Header {
    wide: bool,
    section_offset: u64,
    section_size: u64,
    sections: u64,
    names: u64,
}

impl Header {
    fn table_bytes(&self) -> Option<u64> {
        self.section_size.checked_mul(self.sections)
    }
}

pub struct Section {
    pub name: String,
    pub offset: u64,
    pub size: u64,
}

impl Section {
    pub fn range(&self) -> Option<Range<u64>> {
        Some(self.offset..self.offset.checked_add(self.size)?)
    }
}

fn number(bytes: &[u8]) -> u64 {
    bytes
        .iter()
        .rev()
        .fold(0, |value, byte| (value << 8) | u64::from(*byte))
}

fn parse_header(bytes: &[u8; 64]) -> Option<Header> {
    if bytes[..4] != MAGIC || bytes[8..11] != APPIMAGE_TYPE_2 || bytes[5] != 1 {
        return None;
    }
    let wide = match bytes[4] {
        1 => false,
        2 => true,
        _ => return None,
    };
    let (offset, size, count, names) = if wide {
        (40..48, 58..60, 60..62, 62..64)
    } else {
        (32..36, 46..48, 48..50, 50..52)
    };
    let header = Header {
        wide,
        section_offset: number(&bytes[offset]),
        section_size: number(&bytes[size]),
        sections: number(&bytes[count]),
        names: number(&bytes[names]),
    };
    let entry = if wide { WIDE_ENTRY } else { NARROW_ENTRY };
    (header.section_size == entry
        && header.sections <= MAX_SECTIONS
        && header.names < header.sections.max(1))
    .then_some(header)
}

fn header(file: &mut File) -> Option<Header> {
    let mut bytes = [0u8; 64];
    file.seek(SeekFrom::Start(0)).ok()?;
    file.read_exact(&mut bytes).ok()?;
    parse_header(&bytes)
}

pub fn is_appimage(path: &Path) -> bool {
    File::open(path)
        .ok()
        .and_then(|mut file| header(&mut file))
        .is_some()
}

pub fn payload_offset(file: &mut File) -> Option<u64> {
    let header = header(file)?;
    header.section_offset.checked_add(header.table_bytes()?)
}

struct Entry {
    name: u64,
    offset: u64,
    size: u64,
}

fn entries(file: &mut File, header: &Header) -> Option<Vec<Entry>> {
    let mut table = vec![0u8; usize::try_from(header.table_bytes()?).ok()?];
    file.seek(SeekFrom::Start(header.section_offset)).ok()?;
    file.read_exact(&mut table).ok()?;
    let fields = if header.wide {
        (0..4, 24..32, 32..40)
    } else {
        (0..4, 16..20, 20..24)
    };
    Some(
        table
            .chunks_exact(usize::try_from(header.section_size).ok()?)
            .map(|entry| Entry {
                name: number(&entry[fields.0.clone()]),
                offset: number(&entry[fields.1.clone()]),
                size: number(&entry[fields.2.clone()]),
            })
            .collect(),
    )
}

fn read(file: &mut File, offset: u64, size: u64) -> Option<Vec<u8>> {
    let mut bytes = vec![0u8; usize::try_from(size.min(MAX_SECTION_BYTES)).ok()?];
    file.seek(SeekFrom::Start(offset)).ok()?;
    file.read_exact(&mut bytes).ok()?;
    Some(bytes)
}

pub fn sections(path: &Path) -> Option<Vec<Section>> {
    let mut file = File::open(path).ok()?;
    let header = header(&mut file)?;
    let entries = entries(&mut file, &header)?;
    let names = entries.get(usize::try_from(header.names).ok()?)?;
    let names = read(&mut file, names.offset, names.size)?;
    Some(
        entries
            .iter()
            .filter_map(|entry| {
                let name = names
                    .get(usize::try_from(entry.name).ok()?..)?
                    .split(|byte| *byte == 0)
                    .next()?;
                Some(Section {
                    name: String::from_utf8_lossy(name).into_owned(),
                    offset: entry.offset,
                    size: entry.size,
                })
            })
            .collect(),
    )
}

pub fn section_bytes(path: &Path, sections: &[Section], wanted: &str) -> Option<Vec<u8>> {
    let section = sections.iter().find(|section| section.name == wanted)?;
    let mut file = File::open(path).ok()?;
    let bytes = read(&mut file, section.offset, section.size)?;
    let end = bytes.iter().rposition(|byte| *byte != 0)? + 1;
    Some(bytes[..end].to_vec())
}

pub fn section(path: &Path, wanted: &str) -> Option<String> {
    let bytes = section_bytes(path, &sections(path)?, wanted)?;
    let text = String::from_utf8_lossy(&bytes);
    let text = text.trim_matches(char::from(0)).trim();
    (!text.is_empty()).then(|| text.to_owned())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn wide_header(entry: u16, count: u16, names: u16) -> [u8; 64] {
        let mut bytes = [0u8; 64];
        bytes[..4].copy_from_slice(&MAGIC);
        bytes[4] = 2;
        bytes[5] = 1;
        bytes[8..11].copy_from_slice(&APPIMAGE_TYPE_2);
        bytes[40..48].copy_from_slice(&4096u64.to_le_bytes());
        bytes[58..60].copy_from_slice(&entry.to_le_bytes());
        bytes[60..62].copy_from_slice(&count.to_le_bytes());
        bytes[62..64].copy_from_slice(&names.to_le_bytes());
        bytes
    }

    #[test]
    fn reads_a_well_formed_header() {
        let header = parse_header(&wide_header(64, 30, 29)).unwrap();
        assert_eq!(header.table_bytes(), Some(64 * 30));
    }

    #[test]
    fn refuses_entries_of_the_wrong_size() {
        assert!(parse_header(&wide_header(0, 30, 29)).is_none());
        assert!(parse_header(&wide_header(40, 30, 29)).is_none());
        assert!(parse_header(&wide_header(u16::MAX, 30, 29)).is_none());
    }

    #[test]
    fn refuses_huge_section_tables() {
        assert!(parse_header(&wide_header(64, u16::MAX, 0)).is_none());
    }

    #[test]
    fn refuses_a_name_table_past_the_end() {
        assert!(parse_header(&wide_header(64, 30, 30)).is_none());
    }
}
