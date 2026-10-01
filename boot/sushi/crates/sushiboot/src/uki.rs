//! Read a unified kernel image's name and kernel version from its PE sections.

use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec;

use uefi::proto::media::file::RegularFile;

const HEADERS: usize = 4096;

fn u16_at(data: &[u8], at: usize) -> Option<usize> {
    Some(u16::from_le_bytes(data.get(at..at + 2)?.try_into().ok()?) as usize)
}

fn u32_at(data: &[u8], at: usize) -> Option<usize> {
    Some(u32::from_le_bytes(data.get(at..at + 4)?.try_into().ok()?) as usize)
}

fn section(file: &mut RegularFile, headers: &[u8], wanted: &[u8]) -> Option<String> {
    let pe = u32_at(headers, 0x3c)?;
    if headers.get(pe..pe + 4)? != b"PE\0\0" {
        return None;
    }
    let count = u16_at(headers, pe + 6)?;
    let table = pe + 24 + u16_at(headers, pe + 20)?;
    (0..count).find_map(|index| {
        let entry = headers.get(table + index * 40..table + index * 40 + 40)?;
        let name = entry[..8].split(|byte| *byte == 0).next()?;
        if name != wanted {
            return None;
        }
        let size = u32_at(entry, 8)?.min(u32_at(entry, 16)?).min(HEADERS);
        let mut data = vec![0u8; size];
        file.set_position(u32_at(entry, 20)? as u64).ok()?;
        file.read(&mut data).ok()?;
        let end = data
            .iter()
            .position(|byte| *byte == 0)
            .unwrap_or(data.len());
        Some(String::from_utf8_lossy(&data[..end]).into_owned())
    })
}

fn pretty_name(os_release: &str) -> Option<String> {
    os_release.lines().find_map(|line| {
        line.strip_prefix("PRETTY_NAME=")
            .map(|name| name.trim_matches('"').to_string())
    })
}

pub fn title(file: &mut RegularFile) -> Option<String> {
    let mut headers = vec![0u8; HEADERS];
    file.read(&mut headers).ok()?;
    let name = section(file, &headers, b".osrel").and_then(|release| pretty_name(&release))?;
    Some(match section(file, &headers, b".uname") {
        Some(version) => format!("{name} ({})", version.trim()),
        None => name,
    })
}
