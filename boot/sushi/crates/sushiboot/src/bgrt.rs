use alloc::vec::Vec;

use sushi_scene::tiny_skia::Pixmap;
use uefi::system::with_config_table;
use uefi::table::cfg::ConfigTableEntry;

const LARGEST_LOGO: usize = 4 * 1024 * 1024;

pub struct FirmwareLogo {
    pub image: Pixmap,
    pub x: i32,
    pub y: i32,
}

unsafe fn read<T: Copy>(address: *const u8) -> T {
    unsafe { address.cast::<T>().read_unaligned() }
}

pub fn load() -> Option<FirmwareLogo> {
    with_config_table(|tables| {
        tables
            .iter()
            .filter(|entry| {
                entry.guid == ConfigTableEntry::ACPI2_GUID
                    || entry.guid == ConfigTableEntry::ACPI_GUID
            })
            .find_map(|entry| unsafe { from_rsdp(entry.address.cast()) })
    })
}

unsafe fn from_rsdp(rsdp: *const u8) -> Option<FirmwareLogo> {
    if rsdp.is_null() {
        return None;
    }
    unsafe {
        let extended = read::<u8>(rsdp.add(15)) >= 2;
        let (table, width) = if extended {
            (read::<u64>(rsdp.add(24)) as *const u8, 8)
        } else {
            (read::<u32>(rsdp.add(16)) as usize as *const u8, 4)
        };
        if table.is_null() {
            return None;
        }
        let length = read::<u32>(table.add(4)) as usize;
        (36..length.saturating_sub(width - 1))
            .step_by(width)
            .find_map(|offset| {
                let entry = if extended {
                    read::<u64>(table.add(offset)) as *const u8
                } else {
                    read::<u32>(table.add(offset)) as usize as *const u8
                };
                from_bgrt(entry)
            })
    }
}

unsafe fn from_bgrt(table: *const u8) -> Option<FirmwareLogo> {
    unsafe {
        if table.is_null()
            || core::slice::from_raw_parts(table, 4) != b"BGRT"
            || read::<u32>(table.add(4)) < 56
        {
            return None;
        }
        let displayed = read::<u8>(table.add(38)) & 1 == 1;
        let bitmap = read::<u64>(table.add(40)) as *const u8;
        if !displayed
            || read::<u8>(table.add(39)) != 0
            || bitmap.is_null()
            || core::slice::from_raw_parts(bitmap, 2) != b"BM"
        {
            return None;
        }
        let size = read::<u32>(bitmap.add(2)) as usize;
        if !(54..=LARGEST_LOGO).contains(&size) {
            return None;
        }
        let bytes: Vec<u8> = core::slice::from_raw_parts(bitmap, size).to_vec();
        Some(FirmwareLogo {
            image: sushi_scene::decode_bmp(&bytes)?,
            x: read::<u32>(table.add(48)) as i32,
            y: read::<u32>(table.add(52)) as i32,
        })
    }
}
