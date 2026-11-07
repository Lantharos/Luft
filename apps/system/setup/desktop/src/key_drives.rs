use std::path::Path;

use luft_app::dbus::{self, objects};
use luft_app::recovery::for_computer;
use luft_app::{Commands, Empty, Events};
use luft_disks::mounting;
use luft_disks::udisks::snapshot::{self, Drive, Kind};
use luft_disks::udisks::volumes::{Segment, Volume};
use luft_disks::udisks::{self, ROOT, SERVICE};
use luft_i18n::t;
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::L10N;

const CHANGED: BridgeEvent<Vec<KeyDrive>> = BridgeEvent::new("trust.keyDrivesChanged");
const LIVE_MEDIUM: &str = "/run/initramfs";
const WRITABLE: [&str; 3] = ["vfat", "exfat", "ntfs"];
const PRODUCT: &str = "/sys/class/dmi/id/product_name";

#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct KeyDrive {
    block: String,
    name: String,
    size: u64,
}

#[derive(Deserialize, Type)]
struct SaveToDrive {
    key: String,
    block: String,
}

fn volumes(drive: &Drive) -> impl Iterator<Item = &Volume> {
    drive.segments.iter().filter_map(|segment| match segment {
        Segment::Volume(volume) => Some(volume.as_ref()),
        Segment::Free { .. } => None,
    })
}

fn holds_this_system(drive: &Drive) -> bool {
    drive.system
        || volumes(drive).any(|volume| {
            volume
                .mount_points
                .iter()
                .any(|point| point.starts_with(LIVE_MEDIUM))
        })
}

fn plugged_in(drive: &Drive) -> bool {
    (drive.removable || matches!(drive.kind, Kind::Usb | Kind::Card))
        && !drive.read_only
        && !holds_this_system(drive)
}

fn listed(snapshot: snapshot::Snapshot) -> Vec<KeyDrive> {
    snapshot
        .drives
        .iter()
        .filter(|drive| plugged_in(drive))
        .flat_map(|drive| {
            volumes(drive)
                .filter(|volume| WRITABLE.contains(&volume.fs_type.as_str()))
                .map(move |volume| KeyDrive {
                    block: volume.block.clone(),
                    name: if volume.label.trim().is_empty() {
                        drive.name.clone()
                    } else {
                        volume.label.trim().to_owned()
                    },
                    size: volume.size,
                })
        })
        .collect()
}

async fn drives() -> Result<Vec<KeyDrive>, String> {
    Ok(listed(snapshot::build(&udisks::objects().await?)))
}

fn this_computer() -> String {
    std::fs::read_to_string(PRODUCT)
        .map(|name| name.trim().to_owned())
        .ok()
        .filter(|name| !name.is_empty())
        .unwrap_or_else(|| t!(L10N, "desktop-recovery-this-computer"))
}

async fn save(SaveToDrive { key, block }: SaveToDrive) -> Result<String, String> {
    let drive = drives()
        .await?
        .into_iter()
        .find(|drive| drive.block == block)
        .ok_or_else(|| t!(L10N, "desktop-recovery-drive-gone"))?;
    let objects = udisks::objects().await?;
    let mounted = objects
        .get(&block, udisks::FILESYSTEM)
        .and_then(|filesystem| filesystem.get::<Vec<Vec<u8>>>("MountPoints"))
        .and_then(|points| points.into_iter().next())
        .map(udisks::bytes_text);
    let folder = match &mounted {
        Some(folder) => folder.clone(),
        None => mounting::mount(&block).await?,
    };
    let saved = for_computer(&key, this_computer())
        .save_into(Path::new(&folder), &t!(L10N, "desktop-recovery-file-name"));
    if mounted.is_none() {
        mounting::unmount(&block).await?;
    }
    saved.map(|_| drive.name)
}

pub fn watch(events: Events) {
    luft_app::spawn(async move {
        let Ok(connection) = dbus::system().await else {
            return;
        };
        let Ok(mut changes) = objects::signals(connection, SERVICE, ROOT).await else {
            return;
        };
        while objects::settle(&mut changes).await {
            if let Ok(drives) = drives().await {
                events.emit(CHANGED, drives);
            }
        }
    });
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .command_async("trust_key_drives", |Empty {}| drives())
        .command_async("trust_save_key_to_drive", save)
}
