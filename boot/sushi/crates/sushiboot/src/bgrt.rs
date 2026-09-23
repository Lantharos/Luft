//! Read the ACPI BGRT firmware boot logo in UEFI.

use alloc::vec::Vec;

use uefi::table::cfg::{ACPI2_GUID, ACPI_GUID};
use uefi::system::with_config_table;

use crate::bmp;

const BGRT_SIG: &[u8; 4] = b"BGRT";

pub fn load_bgrt_bmp() -> Option<Vec<u8>> {
    with_config_table(|tables| {
        for entry in tables {
            if entry.guid == ACPI2_GUID || entry.guid == ACPI_GUID {
                if let Some(data) = read_bgrt_from_rsdp(entry.address as *const u8) {
                    return Some(data);
                }
            }
        }
        None
    })
}

fn read_bgrt_from_rsdp(rsdp: *const u8) -> Option<Vec<u8>> {
    if rsdp.is_null() {
        return None;
    }
    let revision = unsafe { *rsdp.add(15) };
    if revision >= 2 {
        let xsdt_addr = unsafe { read_u64(rsdp.add(24)) };
        find_bgrt_in_sdts(xsdt_addr as *const u8, true)
    } else {
        let rsdt_addr = unsafe { read_u32(rsdp.add(16)) };
        find_bgrt_in_sdts(rsdt_addr as *const u8, false)
    }
}

fn find_bgrt_in_sdts(sdt: *const u8, pointers_are_64bit: bool) -> Option<Vec<u8>> {
    if sdt.is_null() {
        return None;
    }
    let table_len = unsafe { read_u32(sdt.add(4)) } as usize;
    if table_len < 36 {
        return None;
    }
    let mut offset = 36usize;
    while offset + if pointers_are_64bit { 8 } else { 4 } <= table_len {
        let ptr = if pointers_are_64bit {
            (unsafe { read_u64(sdt.add(offset)) }) as *const u8
        } else {
            (unsafe { read_u32(sdt.add(offset)) }) as *const u8
        };
        offset += if pointers_are_64bit { 8 } else { 4 };
        if let Some(data) = read_bgrt_image(ptr) {
            return Some(data);
        }
    }
    None
}

fn read_bgrt_image(table: *const u8) -> Option<Vec<u8>> {
    if table.is_null() {
        return None;
    }
    if read_sig(table) != *BGRT_SIG {
        return None;
    }
    let table_len = unsafe { read_u32(table.add(4)) } as usize;
    if table_len < 56 {
        return None;
    }
    let image_type = unsafe { *table.add(39) };
    if image_type != 0 {
        return None;
    }
    let image_addr = unsafe { read_u64(table.add(40)) };
    if image_addr == 0 {
        return None;
    }
    read_bmp_blob(image_addr as *const u8)
}

fn read_bmp_blob(ptr: *const u8) -> Option<Vec<u8>> {
    if ptr.is_null() {
        return None;
    }
    if &read_sig(ptr)[..2] != b"BM" {
        return None;
    }
    let file_size = unsafe { read_u32(ptr.add(2)) } as usize;
    if file_size < 54 || file_size > 4 * 1024 * 1024 {
        return None;
    }
    let mut out = Vec::with_capacity(file_size);
    for i in 0..file_size {
        out.push(unsafe { *ptr.add(i) });
    }
    if bmp::decode_bmp(&out).is_some() {
        Some(out)
    } else {
        None
    }
}

fn read_sig(ptr: *const u8) -> [u8; 4] {
    [
        unsafe { *ptr },
        unsafe { *ptr.add(1) },
        unsafe { *ptr.add(2) },
        unsafe { *ptr.add(3) },
    ]
}

fn read_u32(ptr: *const u8) -> u32 {
    u32::from_le_bytes([
        unsafe { *ptr },
        unsafe { *ptr.add(1) },
        unsafe { *ptr.add(2) },
        unsafe { *ptr.add(3) },
    ])
}

fn read_u64(ptr: *const u8) -> u64 {
    u64::from_le_bytes([
        unsafe { *ptr },
        unsafe { *ptr.add(1) },
        unsafe { *ptr.add(2) },
        unsafe { *ptr.add(3) },
        unsafe { *ptr.add(4) },
        unsafe { *ptr.add(5) },
        unsafe { *ptr.add(6) },
        unsafe { *ptr.add(7) },
    ])
}