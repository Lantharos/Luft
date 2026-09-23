//! Enumerate EFI System Partitions across all discovered FAT volumes.

use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec;
use alloc::vec::Vec;

use uefi::boot::{self, HandleBuffer, SearchType};
use uefi::proto::media::file::{File, FileAttribute, FileMode, FileType};
use uefi::proto::media::fs::SimpleFileSystem;
use uefi::proto::media::partition::PartitionInfo;
use uefi::{Char16, CString16, Handle, Identify};

#[derive(Clone, Debug)]
pub struct EspVolume {
    pub handle: Handle,
    pub index: usize,
    pub label: String,
    pub is_boot: bool,
}

/// All ESP-like FAT volumes, boot ESP first.
pub fn enumerate_esp_volumes(boot_device: Handle) -> Vec<EspVolume> {
    let Ok(handles) = boot::locate_handle_buffer(SearchType::ByProtocol(&SimpleFileSystem::GUID))
    else {
        return fallback_single(boot_device);
    };
    let mut volumes = scan_handles(&handles, boot_device);
    if volumes.is_empty() {
        return fallback_single(boot_device);
    }
    volumes.sort_by(|a, b| b.is_boot.cmp(&a.is_boot).then(a.index.cmp(&b.index)));
    volumes
}

fn fallback_single(boot_device: Handle) -> Vec<EspVolume> {
    vec![EspVolume {
        handle: boot_device,
        index: 0,
        label: String::from("ESP"),
        is_boot: true,
    }]
}

fn scan_handles(handles: &HandleBuffer, boot_device: Handle) -> Vec<EspVolume> {
    let mut out = Vec::new();
    for (i, &handle) in handles.iter().enumerate() {
        if !volume_is_esp(handle) {
            continue;
        }
        out.push(EspVolume {
            handle,
            index: i,
            label: volume_label(handle, out.len()),
            is_boot: handle == boot_device,
        });
    }
    out
}

fn volume_is_esp(handle: Handle) -> bool {
    if let Ok(pi) = boot::open_protocol_exclusive::<PartitionInfo>(handle) {
        if pi.is_system() {
            return true;
        }
    }
    has_efi_tree(handle)
}

fn has_efi_tree(handle: Handle) -> bool {
    let Ok(mut fs) = boot::open_protocol_exclusive::<SimpleFileSystem>(handle) else {
        return false;
    };
    let Ok(mut root) = fs.open_volume() else {
        return false;
    };
    for path in ["\\EFI", "EFI"] {
        let Ok(cpath) = CString16::try_from(path) else {
            continue;
        };
        if let Ok(dir) = root.open(&cpath, FileMode::Read, FileAttribute::DIRECTORY) {
            if dir.into_type().ok().map(|t| matches!(t, FileType::Dir(_))).unwrap_or(false) {
                return true;
            }
        }
    }
    false
}

fn volume_label(handle: Handle, ordinal: usize) -> String {
    let Ok(pi) = boot::open_protocol_exclusive::<PartitionInfo>(handle) else {
        return format!("ESP {}", ordinal + 1);
    };
    let Some(gpt) = pi.gpt_partition_entry() else {
        return format!("ESP {}", ordinal + 1);
    };
    let partition_name = gpt.partition_name;
    let name = char16_name(&partition_name);
    if name.is_empty() {
        format!("ESP {}", ordinal + 1)
    } else {
        name
    }
}

fn char16_name(buf: &[Char16; 36]) -> String {
    let mut out = String::new();
    for &unit in buf {
        let ch: char = unit.into();
        if ch == '\0' {
            break;
        }
        out.push(ch);
    }
    out.trim().to_string()
}

