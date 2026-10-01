use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec::Vec;

use uefi::boot::{self, SearchType};
use uefi::proto::media::fs::SimpleFileSystem;
use uefi::proto::media::partition::PartitionInfo;
use uefi::{Handle, Identify};

use crate::files::Volume;
use crate::protocol;

pub struct EspVolume {
    pub handle: Handle,
    pub index: usize,
    pub label: String,
    pub is_boot: bool,
}

pub fn enumerate(boot_device: Handle) -> Vec<EspVolume> {
    let mut volumes: Vec<EspVolume> =
        boot::locate_handle_buffer(SearchType::ByProtocol(&SimpleFileSystem::GUID))
            .map(|handles| {
                handles
                    .iter()
                    .enumerate()
                    .filter(|(_, handle)| is_esp(**handle))
                    .map(|(index, handle)| EspVolume {
                        handle: *handle,
                        index,
                        label: label(*handle).unwrap_or_else(|| format!("ESP {}", index + 1)),
                        is_boot: *handle == boot_device,
                    })
                    .collect()
            })
            .unwrap_or_default();
    if !volumes.iter().any(|volume| volume.is_boot) {
        volumes.push(EspVolume {
            handle: boot_device,
            index: usize::MAX,
            label: String::from("ESP"),
            is_boot: true,
        });
    }
    volumes.sort_by(|a, b| b.is_boot.cmp(&a.is_boot).then(a.index.cmp(&b.index)));
    volumes
}

fn is_esp(handle: Handle) -> bool {
    protocol::shared::<PartitionInfo>(handle).is_ok_and(|info| info.is_system())
        || Volume::open(handle).is_some_and(|mut volume| !volume.list("\\EFI").is_empty())
}

fn label(handle: Handle) -> Option<String> {
    let info = protocol::shared::<PartitionInfo>(handle).ok()?;
    let units = info.gpt_partition_entry()?.partition_name;
    let name: String = units
        .iter()
        .map(|unit| char::from(*unit))
        .take_while(|character| *character != '\0')
        .collect();
    let name = name.trim();
    (!name.is_empty()).then(|| name.to_string())
}
