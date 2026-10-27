use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec::Vec;

use uefi::boot::{self, SearchType};
use uefi::proto::device_path::{DevicePath, DeviceType};
use uefi::proto::media::fs::SimpleFileSystem;
use uefi::proto::media::partition::{GptPartitionEntry, GptPartitionType, PartitionInfo};
use uefi::{Handle, Identify, guid};

use crate::files::Volume;
use crate::protocol;

const XBOOTLDR: GptPartitionType = GptPartitionType(guid!("bc13c2ff-59e6-4262-a352-b275fd6f7172"));

pub struct EspVolume {
    pub handle: Handle,
    pub index: usize,
    pub label: String,
    pub is_boot: bool,
}

pub fn enumerate(boot_device: Handle) -> Vec<EspVolume> {
    let boot_disk = disk(boot_device);
    let boot_label = label(boot_device).unwrap_or_else(|| String::from("ESP"));
    let mut volumes: Vec<EspVolume> =
        boot::locate_handle_buffer(SearchType::ByProtocol(&SimpleFileSystem::GUID))
            .map(|handles| {
                handles
                    .iter()
                    .enumerate()
                    .filter_map(|(index, handle)| {
                        let is_boot = *handle == boot_device
                            || (is_xbootldr(*handle)
                                && boot_disk.is_some()
                                && disk(*handle) == boot_disk);
                        let label = if is_boot {
                            boot_label.clone()
                        } else {
                            label(*handle).unwrap_or_else(|| format!("ESP {}", index + 1))
                        };
                        (is_boot || is_esp(*handle)).then_some(EspVolume {
                            handle: *handle,
                            index,
                            label,
                            is_boot,
                        })
                    })
                    .collect()
            })
            .unwrap_or_default();
    if !volumes.iter().any(|volume| volume.handle == boot_device) {
        volumes.push(EspVolume {
            handle: boot_device,
            index: usize::MAX,
            label: boot_label,
            is_boot: true,
        });
    }
    volumes.sort_by(|a, b| b.is_boot.cmp(&a.is_boot).then(a.index.cmp(&b.index)));
    volumes
}

fn gpt_entry(handle: Handle) -> Option<GptPartitionEntry> {
    protocol::shared::<PartitionInfo>(handle)
        .ok()?
        .gpt_partition_entry()
        .copied()
}

fn is_esp(handle: Handle) -> bool {
    protocol::shared::<PartitionInfo>(handle).is_ok_and(|info| info.is_system())
        || Volume::open(handle).is_some_and(|mut volume| !volume.list("\\EFI").is_empty())
}

fn is_xbootldr(handle: Handle) -> bool {
    gpt_entry(handle).is_some_and(|entry| {
        let kind = entry.partition_type_guid;
        kind == XBOOTLDR
    })
}

fn disk(handle: Handle) -> Option<Vec<u8>> {
    let path = protocol::shared::<DevicePath>(handle).ok()?;
    let mut disk = Vec::new();
    for node in path
        .node_iter()
        .take_while(|node| node.device_type() != DeviceType::MEDIA)
    {
        disk.extend_from_slice(&[node.device_type().0, node.sub_type().0]);
        disk.extend_from_slice(node.data());
    }
    Some(disk)
}

pub fn partition_guid(handle: Handle) -> Option<String> {
    let guid = gpt_entry(handle)?.unique_partition_guid;
    Some(guid.to_string().to_uppercase())
}

fn label(handle: Handle) -> Option<String> {
    let units = gpt_entry(handle)?.partition_name;
    let name: String = units
        .iter()
        .map(|unit| char::from(*unit))
        .take_while(|character| *character != '\0')
        .collect();
    let name = name.trim();
    (!name.is_empty()).then(|| name.to_string())
}
