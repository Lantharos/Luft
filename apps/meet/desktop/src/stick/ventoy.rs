use std::io::{self, Read, Seek};

use super::table::{self, HEAD, Slot, Style, Table};

const DATA_START: u64 = 2048 * 512;
const EFI_SIZE: u64 = 32 << 20;
const EFI_LABEL: &str = "VTOYEFI";
const BOOT_SECTOR: usize = 4096;
const EXTENDED_BOOT: u8 = 0x29;

fn layout(table: &Table) -> Option<&Slot> {
    let [data, efi, ..] = table.slots.as_slice() else {
        return None;
    };
    let named = table.style == Style::Mbr || efi.name == EFI_LABEL;
    (data.start == DATA_START
        && efi.size == EFI_SIZE
        && data.start + data.size == efi.start
        && named)
        .then_some(efi)
}

fn fat_label(boot: &[u8]) -> Option<String> {
    if boot.len() < 512 || boot[510..512] != [0x55, 0xaa] {
        return None;
    }
    let (signature, label) = if &boot[0x52..0x57] == b"FAT32" {
        (0x42, 0x47)
    } else {
        (0x26, 0x2b)
    };
    (boot[signature] == EXTENDED_BOOT).then(|| {
        String::from_utf8_lossy(&boot[label..label + 11])
            .trim_end()
            .to_owned()
    })
}

pub fn data_partition(disk: &mut (impl Read + Seek), sector: u64) -> io::Result<Option<Slot>> {
    let head = table::read_at(disk, 0, HEAD)?;
    let Some(table) = table::parse(&head, sector) else {
        return Ok(None);
    };
    let Some(efi) = layout(&table) else {
        return Ok(None);
    };
    let boot = table::read_at(disk, efi.start, BOOT_SECTOR)?;
    Ok((fat_label(&boot).as_deref() == Some(EFI_LABEL)).then(|| table.slots[0].clone()))
}

#[cfg(test)]
mod tests {
    use std::io::Cursor;

    use super::super::table::samples::{Entry, MIB, gpt, mbr};
    use super::*;

    const DISK: u64 = 64 * MIB;
    const DATA: u64 = DISK - MIB - EFI_SIZE;

    fn fat16(label: &str) -> Vec<u8> {
        let mut boot = vec![0; BOOT_SECTOR];
        boot[0x26] = EXTENDED_BOOT;
        boot[0x2b..0x36].copy_from_slice(format!("{label:<11}").as_bytes());
        boot[0x36..0x3e].copy_from_slice(b"FAT16   ");
        boot[510] = 0x55;
        boot[511] = 0xaa;
        boot
    }

    fn disk(head: Vec<u8>, efi_start: u64, efi_label: &str) -> Cursor<Vec<u8>> {
        let mut bytes = head;
        bytes.resize(DISK as usize, 0);
        bytes[efi_start as usize..][..BOOT_SECTOR].copy_from_slice(&fat16(efi_label));
        Cursor::new(bytes)
    }

    fn ventoy(data_kind: u8, efi_name: &'static str) -> [Entry; 2] {
        [
            Entry {
                start: MIB,
                size: DATA,
                kind: data_kind,
                name: "Ventoy",
            },
            Entry {
                start: MIB + DATA,
                size: EFI_SIZE,
                kind: 0xef,
                name: efi_name,
            },
        ]
    }

    #[test]
    fn ventoy_on_mbr_is_found_by_its_layout_and_its_efi_label() {
        let mut stick = disk(mbr(&ventoy(0x07, "")), MIB + DATA, "VTOYEFI");
        let data = data_partition(&mut stick, 512).unwrap().unwrap();
        assert_eq!((data.start, data.size), (MIB, DATA));
    }

    #[test]
    fn ventoy_on_gpt_is_found_on_any_sector_size() {
        for sector in [512, 4096] {
            let mut stick = disk(gpt(&ventoy(0xaa, "VTOYEFI"), sector), MIB + DATA, "VTOYEFI");
            assert!(data_partition(&mut stick, sector).unwrap().is_some());
        }
    }

    #[test]
    fn a_gpt_efi_partition_has_to_be_named_vtoyefi() {
        let mut stick = disk(gpt(&ventoy(0xaa, "EFI"), 512), MIB + DATA, "VTOYEFI");
        assert_eq!(data_partition(&mut stick, 512).unwrap(), None);
    }

    #[test]
    fn the_same_layout_with_another_label_is_not_ventoy() {
        let mut stick = disk(mbr(&ventoy(0x07, "")), MIB + DATA, "BOOT");
        assert_eq!(data_partition(&mut stick, 512).unwrap(), None);
    }

    #[test]
    fn ventoy_s_efi_partition_is_exactly_32_mb_right_after_the_data() {
        let mut entries = ventoy(0x07, "");
        entries[1].size = 16 * MIB;
        let mut stick = disk(mbr(&entries), entries[1].start, "VTOYEFI");
        assert_eq!(data_partition(&mut stick, 512).unwrap(), None);
        let mut entries = ventoy(0x07, "");
        entries[1].start += MIB;
        let mut stick = disk(mbr(&entries), entries[1].start, "VTOYEFI");
        assert_eq!(data_partition(&mut stick, 512).unwrap(), None);
    }

    #[test]
    fn an_ordinary_stick_is_not_ventoy() {
        let head = mbr(&[Entry {
            start: MIB,
            size: DISK - MIB,
            kind: 0x0c,
            name: "",
        }]);
        let mut stick = disk(head, 2 * MIB, "PHOTOS");
        assert_eq!(data_partition(&mut stick, 512).unwrap(), None);
    }
}
