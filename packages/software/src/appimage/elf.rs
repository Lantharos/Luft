use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;

const MAGIC: [u8; 4] = [0x7f, b'E', b'L', b'F'];
const APPIMAGE_TYPE_2: [u8; 3] = [b'A', b'I', 2];

struct Header {
    wide: bool,
    section_offset: u64,
    section_size: u64,
    sections: u64,
    names: u64,
}

fn number(bytes: &[u8]) -> u64 {
    bytes
        .iter()
        .rev()
        .fold(0, |value, byte| (value << 8) | u64::from(*byte))
}

fn header(file: &mut File) -> Option<Header> {
    let mut bytes = [0u8; 64];
    file.seek(SeekFrom::Start(0)).ok()?;
    file.read_exact(&mut bytes).ok()?;
    if bytes[..4] != MAGIC || bytes[8..11] != APPIMAGE_TYPE_2 || bytes[5] != 1 {
        return None;
    }
    let wide = bytes[4] == 2;
    let (offset, size, count, names) = if wide {
        (40..48, 58..60, 60..62, 62..64)
    } else {
        (32..36, 46..48, 48..50, 50..52)
    };
    Some(Header {
        wide,
        section_offset: number(&bytes[offset]),
        section_size: number(&bytes[size]),
        sections: number(&bytes[count]),
        names: number(&bytes[names]),
    })
}

pub fn is_appimage(path: &Path) -> bool {
    File::open(path)
        .ok()
        .and_then(|mut file| header(&mut file))
        .is_some()
}

pub fn payload_offset(file: &mut File) -> Option<u64> {
    let header = header(file)?;
    Some(header.section_offset + header.section_size * header.sections)
}

struct Section {
    name: u64,
    offset: u64,
    size: u64,
}

fn sections(file: &mut File, header: &Header) -> Option<Vec<Section>> {
    let mut table = vec![0u8; (header.section_size * header.sections) as usize];
    file.seek(SeekFrom::Start(header.section_offset)).ok()?;
    file.read_exact(&mut table).ok()?;
    let fields = if header.wide {
        (0..4, 24..32, 32..40)
    } else {
        (0..4, 16..20, 20..24)
    };
    Some(
        table
            .chunks_exact(header.section_size as usize)
            .map(|entry| Section {
                name: number(&entry[fields.0.clone()]),
                offset: number(&entry[fields.1.clone()]),
                size: number(&entry[fields.2.clone()]),
            })
            .collect(),
    )
}

fn read(file: &mut File, offset: u64, size: u64) -> Option<Vec<u8>> {
    let mut bytes = vec![0u8; usize::try_from(size).ok()?.min(1 << 20)];
    file.seek(SeekFrom::Start(offset)).ok()?;
    file.read_exact(&mut bytes).ok()?;
    Some(bytes)
}

pub fn section(path: &Path, wanted: &str) -> Option<String> {
    let mut file = File::open(path).ok()?;
    let header = header(&mut file)?;
    let sections = sections(&mut file, &header)?;
    let names = sections.get(header.names as usize)?;
    let names = read(&mut file, names.offset, names.size)?;
    let section = sections.iter().find(|section| {
        names
            .get(section.name as usize..)
            .and_then(|tail| tail.split(|byte| *byte == 0).next())
            .is_some_and(|name| name == wanted.as_bytes())
    })?;
    let bytes = read(&mut file, section.offset, section.size)?;
    let text = String::from_utf8_lossy(&bytes);
    let text = text.trim_matches(char::from(0)).trim();
    (!text.is_empty()).then(|| text.to_owned())
}
