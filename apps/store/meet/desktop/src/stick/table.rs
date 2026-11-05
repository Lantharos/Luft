use std::io::{self, Read, Seek, SeekFrom};

pub const HEAD: usize = 64 << 10;
const MBR_ENTRIES: usize = 446;
const MBR_ENTRY: usize = 16;
const PROTECTIVE: u8 = 0xee;
const GPT_SIGNATURE: &[u8] = b"EFI PART";
const GPT_NAME: usize = 56;
const GPT_NAME_END: usize = 128;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Style {
    Mbr,
    Gpt,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Slot {
    pub start: u64,
    pub size: u64,
    pub name: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Table {
    pub style: Style,
    pub slots: Vec<Slot>,
}

fn u32_at(bytes: &[u8], at: usize) -> u64 {
    u32::from_le_bytes(bytes[at..at + 4].try_into().expect("four bytes")) as u64
}

fn u64_at(bytes: &[u8], at: usize) -> u64 {
    u64::from_le_bytes(bytes[at..at + 8].try_into().expect("eight bytes"))
}

fn utf16_name(bytes: &[u8]) -> String {
    let units: Vec<u16> = bytes
        .as_chunks::<2>()
        .0
        .iter()
        .map(|pair| u16::from_le_bytes(*pair))
        .take_while(|unit| *unit != 0)
        .collect();
    String::from_utf16_lossy(&units)
}

fn mbr(head: &[u8], sector: u64) -> Table {
    let slots = (0..4)
        .map(|index| &head[MBR_ENTRIES + index * MBR_ENTRY..][..MBR_ENTRY])
        .take_while(|entry| entry[4] != 0)
        .map(|entry| Slot {
            start: u32_at(entry, 8) * sector,
            size: u32_at(entry, 12) * sector,
            name: String::new(),
        })
        .collect();
    Table {
        style: Style::Mbr,
        slots,
    }
}

fn gpt(head: &[u8], sector: u64) -> Option<Table> {
    let header = head.get(sector as usize..sector as usize + 92)?;
    if &header[..8] != GPT_SIGNATURE {
        return None;
    }
    let entries = (u64_at(header, 72) * sector) as usize;
    let count = u32_at(header, 80) as usize;
    let size = u32_at(header, 84) as usize;
    if size < GPT_NAME_END {
        return None;
    }
    let slots = (0..count)
        .map_while(|index| head.get(entries + index * size..entries + (index + 1) * size))
        .take_while(|entry| entry[..16].iter().any(|byte| *byte != 0))
        .map(|entry| {
            let first = u64_at(entry, 32);
            let last = u64_at(entry, 40);
            Slot {
                start: first * sector,
                size: (last + 1).saturating_sub(first) * sector,
                name: utf16_name(&entry[GPT_NAME..GPT_NAME_END]),
            }
        })
        .collect();
    Some(Table {
        style: Style::Gpt,
        slots,
    })
}

pub fn parse(head: &[u8], sector: u64) -> Option<Table> {
    if head.len() < 512 || head[510..512] != [0x55, 0xaa] {
        return None;
    }
    if head[MBR_ENTRIES + 4] == PROTECTIVE {
        return gpt(head, sector);
    }
    Some(mbr(head, sector))
}

pub fn read_at(disk: &mut (impl Read + Seek), offset: u64, length: usize) -> io::Result<Vec<u8>> {
    let mut bytes = vec![0; length];
    disk.seek(SeekFrom::Start(offset))?;
    disk.read_exact(&mut bytes)?;
    Ok(bytes)
}

#[cfg(test)]
pub mod samples {
    use super::*;

    pub const MIB: u64 = 1 << 20;

    pub struct Entry {
        pub start: u64,
        pub size: u64,
        pub kind: u8,
        pub name: &'static str,
    }

    pub fn mbr(entries: &[Entry]) -> Vec<u8> {
        let mut head = vec![0; HEAD];
        for (index, entry) in entries.iter().enumerate() {
            let at = MBR_ENTRIES + index * MBR_ENTRY;
            head[at + 4] = entry.kind;
            head[at + 8..at + 12].copy_from_slice(&((entry.start / 512) as u32).to_le_bytes());
            head[at + 12..at + 16].copy_from_slice(&((entry.size / 512) as u32).to_le_bytes());
        }
        head[510] = 0x55;
        head[511] = 0xaa;
        head
    }

    pub fn gpt(entries: &[Entry], sector: u64) -> Vec<u8> {
        let mut head = mbr(&[Entry {
            start: sector,
            size: 0,
            kind: PROTECTIVE,
            name: "",
        }]);
        let header = sector as usize;
        head[header..header + 8].copy_from_slice(GPT_SIGNATURE);
        head[header + 72..header + 80].copy_from_slice(&2u64.to_le_bytes());
        head[header + 80..header + 84].copy_from_slice(&128u32.to_le_bytes());
        head[header + 84..header + 88].copy_from_slice(&128u32.to_le_bytes());
        for (index, entry) in entries.iter().enumerate() {
            let at = 2 * sector as usize + index * 128;
            head[at..at + 16].fill(entry.kind);
            head[at + 32..at + 40].copy_from_slice(&(entry.start / sector).to_le_bytes());
            let last = (entry.start + entry.size) / sector - 1;
            head[at + 40..at + 48].copy_from_slice(&last.to_le_bytes());
            for (unit, value) in entry.name.encode_utf16().enumerate() {
                head[at + GPT_NAME + unit * 2..][..2].copy_from_slice(&value.to_le_bytes());
            }
        }
        head
    }
}

#[cfg(test)]
mod tests {
    use super::samples::{Entry, MIB, gpt as gpt_sample, mbr as mbr_sample};
    use super::*;

    #[test]
    fn an_mbr_table_lists_its_partitions_in_order() {
        let head = mbr_sample(&[
            Entry {
                start: MIB,
                size: 100 * MIB,
                kind: 0x07,
                name: "",
            },
            Entry {
                start: 101 * MIB,
                size: 32 * MIB,
                kind: 0xef,
                name: "",
            },
        ]);
        let table = parse(&head, 512).unwrap();
        assert_eq!(table.style, Style::Mbr);
        assert_eq!(
            table.slots,
            [
                Slot {
                    start: MIB,
                    size: 100 * MIB,
                    name: String::new()
                },
                Slot {
                    start: 101 * MIB,
                    size: 32 * MIB,
                    name: String::new()
                }
            ]
        );
    }

    #[test]
    fn a_gpt_table_names_its_partitions_on_any_sector_size() {
        for sector in [512, 4096] {
            let head = gpt_sample(
                &[Entry {
                    start: MIB,
                    size: 32 * MIB,
                    kind: 0xaa,
                    name: "VTOYEFI",
                }],
                sector,
            );
            let table = parse(&head, sector).unwrap();
            assert_eq!(table.style, Style::Gpt);
            assert_eq!(table.slots.len(), 1);
            assert_eq!(table.slots[0].name, "VTOYEFI");
            assert_eq!(table.slots[0].size, 32 * MIB);
        }
    }

    #[test]
    fn a_blank_drive_has_no_table() {
        assert_eq!(parse(&vec![0; HEAD], 512), None);
    }
}
