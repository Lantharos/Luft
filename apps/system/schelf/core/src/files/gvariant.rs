//! Just enough of GVariant's serialization to read the metadata at the start
//! of a Flatpak bundle without copying the rest of it.

fn offset_size(container: usize) -> usize {
    match container {
        0 => 0,
        1..=0xff => 1,
        0x100..=0xffff => 2,
        0x1_0000..=0xffff_ffff => 4,
        _ => 8,
    }
}

fn offset(bytes: &[u8], at: usize, size: usize) -> Option<usize> {
    let field = bytes.get(at..at + size)?;
    let mut value = [0u8; 8];
    value[..size].copy_from_slice(field);
    usize::try_from(u64::from_le_bytes(value)).ok()
}

fn aligned(position: usize, alignment: usize) -> usize {
    position.next_multiple_of(alignment)
}

/// The first member of a tuple whose members aren't all of a fixed size.
pub fn first_member(tuple: &[u8]) -> Option<&[u8]> {
    let size = offset_size(tuple.len());
    let end = offset(tuple, tuple.len().checked_sub(size)?, size)?;
    tuple.get(..end)
}

/// The `a{sv}` dictionary `dictionary`, as its keys and the bytes and type of each value.
pub fn entries(dictionary: &[u8]) -> Vec<(&str, &[u8], &str)> {
    let size = offset_size(dictionary.len());
    let Some(table) = dictionary
        .len()
        .checked_sub(size)
        .and_then(|last| offset(dictionary, last, size))
    else {
        return Vec::new();
    };
    let count = (dictionary.len() - table.min(dictionary.len())) / size.max(1);
    let mut start = 0;
    (0..count)
        .map_while(|index| {
            let end = offset(dictionary, table + index * size, size)?;
            let entry = dictionary.get(start..end)?;
            start = aligned(end, 8);
            entry_of(entry)
        })
        .collect()
}

fn entry_of(entry: &[u8]) -> Option<(&str, &[u8], &str)> {
    let size = offset_size(entry.len());
    let values = entry.len().checked_sub(size)?;
    let key_end = offset(entry, values, size)?;
    let key = std::str::from_utf8(entry.get(..key_end)?.strip_suffix(b"\0")?).ok()?;
    let variant = entry.get(aligned(key_end, 8)..values)?;
    let separator = variant.iter().rposition(|byte| *byte == 0)?;
    let kind = std::str::from_utf8(&variant[separator + 1..]).ok()?;
    Some((key, &variant[..separator], kind))
}

/// The text of a GVariant string, without its closing nul.
pub fn text(value: &[u8]) -> Option<&str> {
    std::str::from_utf8(value.strip_suffix(b"\0")?).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(key: &str, value: &[u8], kind: &str) -> Vec<u8> {
        let mut bytes = key.as_bytes().to_vec();
        bytes.push(0);
        let key_end = bytes.len();
        bytes.resize(aligned(key_end, 8), 0);
        bytes.extend_from_slice(value);
        bytes.push(0);
        bytes.extend_from_slice(kind.as_bytes());
        bytes.push(key_end as u8);
        bytes
    }

    fn dictionary(entries: &[Vec<u8>]) -> Vec<u8> {
        let mut bytes = Vec::new();
        let mut ends = Vec::new();
        for entry in entries {
            bytes.resize(aligned(bytes.len(), 8), 0);
            bytes.extend_from_slice(entry);
            ends.push(bytes.len() as u8);
        }
        bytes.extend(ends);
        bytes
    }

    #[test]
    fn a_bundles_metadata_is_read_by_key() {
        let metadata = dictionary(&[
            entry("ref", b"app/org.example.Tide/x86_64/stable\0", "s"),
            entry("icon-64", &[0x89, b'P', b'N', b'G'], "ay"),
        ]);
        let mut tuple = metadata.clone();
        tuple.extend_from_slice(&[0; 8]);
        tuple.push(metadata.len() as u8);
        let read = entries(first_member(&tuple).unwrap());
        assert_eq!(read.len(), 2);
        assert_eq!(read[0].0, "ref");
        assert_eq!(text(read[0].1), Some("app/org.example.Tide/x86_64/stable"));
        assert_eq!(read[1], ("icon-64", &[0x89, b'P', b'N', b'G'][..], "ay"));
    }
}
