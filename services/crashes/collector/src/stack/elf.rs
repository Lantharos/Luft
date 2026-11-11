//! The build ID of a program or library file, read from its notes.

use std::fs::File;
use std::os::unix::fs::FileExt;
use std::path::Path;

const MAGIC: &[u8] = b"\x7fELF\x02\x01";
const NOTES: u32 = 4;
const LONGEST_NOTES: u64 = 4096;
const MOST_HEADERS: u16 = 64;

fn word<const N: usize>(bytes: &[u8], at: usize) -> Option<[u8; N]> {
    bytes.get(at..at + N)?.try_into().ok()
}

pub fn build_id(path: &Path) -> Option<String> {
    let file = File::open(path).ok()?;
    if !file.metadata().ok()?.is_file() {
        return None;
    }
    let mut header = [0u8; 64];
    file.read_exact_at(&mut header, 0).ok()?;
    if !header.starts_with(MAGIC) {
        return None;
    }
    let headers_at = u64::from_le_bytes(word(&header, 0x20)?);
    let size = u16::from_le_bytes(word(&header, 0x36)?);
    let count = u16::from_le_bytes(word(&header, 0x38)?).min(MOST_HEADERS);
    (0..count).find_map(|index| {
        let mut program_header = [0u8; 56];
        file.read_exact_at(
            &mut program_header,
            headers_at + u64::from(index) * u64::from(size),
        )
        .ok()?;
        if u32::from_le_bytes(word(&program_header, 0)?) != NOTES {
            return None;
        }
        let at = u64::from_le_bytes(word(&program_header, 8)?);
        let length = u64::from_le_bytes(word(&program_header, 32)?).min(LONGEST_NOTES);
        let mut notes = vec![0u8; usize::try_from(length).ok()?];
        file.read_exact_at(&mut notes, at).ok()?;
        luft_dbus::panics::build_id(&notes)
    })
}

#[cfg(test)]
mod tests {
    use super::build_id;

    #[test]
    fn reads_the_build_id_of_a_real_program() {
        let program = std::env::current_exe().unwrap();
        let id = build_id(&program).unwrap();
        assert!(
            id.len() >= 32 && id.bytes().all(|byte| byte.is_ascii_hexdigit()),
            "{id}"
        );
    }
}
