use super::load_option::Partition;

const SIGNATURE: &[u8; 8] = b"EFI PART";

pub struct Header {
    pub entries_lba: u64,
    pub count: u32,
    pub entry_size: u32,
}

pub fn header(lba1: &[u8]) -> Option<Header> {
    if lba1.get(..8)? != SIGNATURE {
        return None;
    }
    let field = |at: usize, width: usize| -> Option<u64> {
        let bytes = lba1.get(at..at + width)?;
        let mut padded = [0u8; 8];
        padded[..width].copy_from_slice(bytes);
        Some(u64::from_le_bytes(padded))
    };
    Some(Header {
        entries_lba: field(72, 8)?,
        count: field(80, 4)? as u32,
        entry_size: field(84, 4)? as u32,
    })
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Entry {
    pub number: u32,
    pub kind: [u8; 16],
    pub guid: [u8; 16],
    pub first_lba: u64,
    pub last_lba: u64,
    pub name: String,
}

fn name(bytes: &[u8]) -> String {
    let units: Vec<u16> = bytes
        .as_chunks::<2>()
        .0
        .iter()
        .map(|pair| u16::from_le_bytes(*pair))
        .take_while(|unit| *unit != 0)
        .collect();
    String::from_utf16_lossy(&units)
}

pub fn entries(header: &Header, table: &[u8]) -> Vec<Entry> {
    table
        .chunks_exact(header.entry_size as usize)
        .take(header.count as usize)
        .enumerate()
        .filter(|(_, entry)| entry[..16] != [0; 16])
        .map(|(index, entry)| Entry {
            number: index as u32 + 1,
            kind: entry[..16].try_into().expect("sixteen bytes"),
            guid: entry[16..32].try_into().expect("sixteen bytes"),
            first_lba: u64::from_le_bytes(entry[32..40].try_into().expect("eight bytes")),
            last_lba: u64::from_le_bytes(entry[40..48].try_into().expect("eight bytes")),
            name: name(&entry[56..128.min(entry.len())]),
        })
        .collect()
}

pub fn find(header: &Header, table: &[u8], guid: &[u8; 16]) -> Option<Partition> {
    entries(header, table)
        .into_iter()
        .find(|entry| &entry.guid == guid)
        .map(|entry| Partition {
            number: entry.number,
            first_lba: entry.first_lba,
            sectors: entry.last_lba - entry.first_lba + 1,
            guid: *guid,
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_entry_number_is_its_place_in_the_table() {
        let mut lba1 = vec![0u8; 512];
        lba1[..8].copy_from_slice(SIGNATURE);
        lba1[72..80].copy_from_slice(&2u64.to_le_bytes());
        lba1[80..84].copy_from_slice(&128u32.to_le_bytes());
        lba1[84..88].copy_from_slice(&128u32.to_le_bytes());
        let header = header(&lba1).unwrap();
        assert_eq!(header.entries_lba, 2);
        let mut entries = vec![0u8; 128 * 128];
        let guid = [7u8; 16];
        let third = &mut entries[2 * 128..3 * 128];
        third[..16].copy_from_slice(&[1; 16]);
        third[16..32].copy_from_slice(&guid);
        for (at, unit) in "Luft".encode_utf16().enumerate() {
            third[56 + at * 2..58 + at * 2].copy_from_slice(&unit.to_le_bytes());
        }
        third[32..40].copy_from_slice(&4096u64.to_le_bytes());
        third[40..48].copy_from_slice(&8191u64.to_le_bytes());
        let partition = find(&header, &entries, &guid).unwrap();
        assert_eq!(
            (partition.number, partition.first_lba, partition.sectors),
            (3, 4096, 4096)
        );
        assert!(find(&header, &entries, &[9; 16]).is_none());
        let listed = super::entries(&header, &entries);
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].name, "Luft");
    }
}
