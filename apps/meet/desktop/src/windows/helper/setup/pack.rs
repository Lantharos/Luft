use std::fs::{self, File};
use std::io::{Read, Write};
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::Stdio;

use luft_i18n::t;
use luft_meet::handoff::BOX_LABEL;
use luft_meet::moving_box::{
    self, Account, BLUETOOTH_KEYS, BLUETOOTH_NAMES, Bluetooth, Folder, Manifest, PICTURE,
    WALLPAPER, WIFI,
};

use super::{prepare, room};
use crate::L10N;
use crate::plan::gap::{self, Head};
use crate::plan::layout::{self, Plan, Role};
use crate::plan::sizes::{self, BOX_CLUSTER};
use crate::protocol::answers::Prepared;
use crate::protocol::{Packing, Stage};
use crate::windows::folders::{Item, verbatim, walk};
use crate::windows::helper::Context;
use crate::windows::helper::drive::state::Found;
use crate::windows::helper::drive::storage::{
    self, BASIC_TYPE, MSFT_Disk, MSFT_Partition, Storage,
};
use crate::windows::helper::drive::windows_drive::{self, WindowsDrive};
use crate::windows::helper::drive::windows_space;
use crate::windows::helper::drive::{record, state};
use crate::windows::helper::system::protected::Scratch;
use crate::windows::helper::system::{bluetooth, programs};

const EXFAT: &str = "exFAT";
const NO_WINDOW: u32 = 0x0800_0000;
const CHUNK: usize = 1 << 20;

fn single(source: &str, name: &str) -> Option<Item> {
    let source = PathBuf::from(source);
    let size = fs::metadata(verbatim(&source)).ok()?.len();
    let extension = source
        .extension()
        .map(|extension| format!(".{}", extension.to_string_lossy()))
        .unwrap_or_default();
    Some(Item {
        target: format!("{name}{extension}"),
        source,
        size,
    })
}

fn export_wifi(into: &Path) -> Result<Vec<PathBuf>, String> {
    fs::create_dir_all(into).map_err(|error| error.to_string())?;
    let status = programs::windows("netsh")
        .args(["wlan", "export", "profile", "key=clear"])
        .arg(format!("folder={}", into.display()))
        .stdout(Stdio::null())
        .creation_flags(NO_WINDOW)
        .status()
        .map_err(|error| error.to_string())?;
    if !status.success() {
        return Ok(Vec::new());
    }
    Ok(fs::read_dir(into)
        .map_err(|error| error.to_string())?
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            path.extension()
                .is_some_and(|extension| extension.eq_ignore_ascii_case("xml"))
        })
        .collect())
}

fn copy(
    context: &Context,
    item: &Item,
    root: &Path,
    done: &mut u64,
    total: u64,
) -> Result<(), String> {
    let target = item
        .target
        .split('/')
        .fold(root.to_owned(), |path, part| path.join(part));
    fs::create_dir_all(target.parent().expect("files live in folders"))
        .map_err(|error| error.to_string())?;
    let mut source = File::open(verbatim(&item.source))
        .map_err(|error| format!("{}: {error}", item.source.display()))?;
    let mut destination = File::create(&target).map_err(|error| error.to_string())?;
    let mut buffer = vec![0; CHUNK];
    loop {
        let read = source
            .read(&mut buffer)
            .map_err(|error| format!("{}: {error}", item.source.display()))?;
        if read == 0 {
            break;
        }
        destination
            .write_all(&buffer[..read])
            .map_err(|error| error.to_string())?;
        *done += read as u64;
        context.progress(Stage::Packing, *done, total);
    }
    if let Ok(modified) = source.metadata().and_then(|metadata| metadata.modified()) {
        let _ = destination.set_modified(modified);
    }
    Ok(())
}

fn fill(
    context: &Context,
    storage: &Storage,
    partition: &MSFT_Partition,
    items: &[Item],
    manifest: &Manifest,
) -> Result<(), String> {
    let root = storage.format(partition, EXFAT, BOX_LABEL, Some(BOX_CLUSTER as u32))?;
    let total: u64 = items.iter().map(|item| item.size).sum();
    let mut done = 0;
    for item in items {
        copy(context, item, &root, &mut done, total)?;
    }
    fs::write(root.join(moving_box::MANIFEST), manifest.to_json())
        .map_err(|error| error.to_string())
}

fn take_back(
    storage: &Storage,
    drive: &WindowsDrive,
    partition: &MSFT_Partition,
    windows_before: u64,
) -> Result<(), String> {
    storage.delete(&storage.refreshed(partition)?)?;
    if let Some(guid) = partition.guid() {
        record::removed_partition(&guid)?;
    }
    let windows = storage.layout(&drive.volume)?.windows;
    if windows.Size < windows_before {
        storage.resize(&windows, windows_before)?;
    }
    Ok(())
}

fn plan_box(
    storage: &Storage,
    drive: &WindowsDrive,
    found: &Found,
    size: u64,
) -> Result<(Plan, MSFT_Disk), String> {
    let room = found.room().ok_or_else(|| t!(L10N, "helper-no-room-yet"))?;
    let layout = storage.layout(&drive.volume)?;
    let short = |message: &str, available: u64| {
        t!(
            L10N,
            message,
            available = available >> 30,
            needed = size.div_ceil(1 << 30)
        )
    };
    if found.beside_windows(&layout) {
        let windows = storage.windows_plan(&layout, &drive.volume)?;
        let plan = layout::plan(
            &layout.plan_disk(),
            &windows,
            room.size,
            &[(Role::MovingBox, size)],
        )
        .map_err(|shortfall| {
            short(
                "helper-box-shortfall",
                shortfall.available.saturating_sub(room.size),
            )
        })?;
        return Ok((plan, layout.disk));
    }
    let disk = storage.disk(found.live.as_ref().map_or(0, |live| live.DiskNumber))?;
    let partitions = storage.partitions_of(disk.Number)?;
    let smallest = sizes::smallest_luft(storage::esp_size(&partitions, &found.made));
    let gap = gap::gaps(&room::disk_plan(&disk, &partitions))
        .into_iter()
        .find(|gap| gap.offset <= room.offset && room.offset < gap.end())
        .unwrap_or(room);
    let plan =
        gap::inside(gap, Head::Room { smallest }, &[(Role::MovingBox, size)]).map_err(|_| {
            short(
                "helper-box-room-shortfall",
                gap.size.saturating_sub(smallest),
            )
        })?;
    Ok((plan, disk))
}

pub fn pack(context: &Context, belongings: &Packing) -> Result<Prepared, String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let found = state::find(&storage.all_partitions()?);
    let (Some(mut handoff), Some(live)) = (found.handoff.clone(), found.live_path()) else {
        return Err(t!(L10N, "helper-no-room-yet"));
    };
    if let Some(old) = &found.moving_box {
        storage.delete(old)?;
        if let Some(guid) = old.guid() {
            record::removed_partition(&guid)?;
        }
        if let Some(made) = handoff.partitions_mut() {
            made.moving_box = None;
        }
        state::write_handoff(&live, &handoff)?;
    }

    let mut items = Vec::new();
    let mut folders = Vec::new();
    for chosen in &belongings.folders {
        let start = items.len();
        walk(Path::new(&chosen.path), &chosen.kind.in_box(), &mut items);
        let chosen_items = &items[start..];
        folders.push(Folder {
            kind: chosen.kind,
            files: chosen_items.len() as u64,
            bytes: chosen_items.iter().map(|item| item.size).sum(),
        });
    }
    let wallpaper = belongings
        .wallpaper
        .as_deref()
        .and_then(|path| single(path, WALLPAPER));
    let picture = belongings
        .account
        .as_ref()
        .and_then(|account| account.picture.as_deref())
        .and_then(|path| single(path, PICTURE));
    let staging = Scratch::new("packing")?;
    let networks = if belongings.wifi {
        export_wifi(&staging.path().join("wifi"))?
    } else {
        Vec::new()
    };
    let saved = if belongings.bluetooth {
        Some(bluetooth::save(&staging.path().join("bluetooth"))?)
    } else {
        None
    };
    let bluetooth_keys = saved
        .as_ref()
        .and_then(|saved| single(&saved.keys.to_string_lossy(), BLUETOOTH_KEYS));
    let bluetooth_names = saved
        .as_ref()
        .and_then(|saved| saved.names.as_ref())
        .and_then(|names| single(&names.to_string_lossy(), BLUETOOTH_NAMES));
    let wifi: Vec<Item> = networks
        .iter()
        .enumerate()
        .filter_map(|(index, path)| single(&path.to_string_lossy(), &format!("{WIFI}/{index}")))
        .collect();
    let manifest = Manifest {
        account: belongings.account.as_ref().map(|account| Account {
            full_name: account.full_name.clone(),
            user_name: account.user_name.clone(),
            picture: picture.as_ref().map(|item| item.target.clone()),
        }),
        wallpaper: wallpaper.as_ref().map(|item| item.target.clone()),
        wifi: wifi.iter().map(|item| item.target.clone()).collect(),
        bluetooth: bluetooth_keys.as_ref().map(|keys| Bluetooth {
            devices: bluetooth::paired(),
            keys: keys.target.clone(),
            names: bluetooth_names.as_ref().map(|names| names.target.clone()),
        }),
        folders,
    };
    items.extend(wallpaper);
    items.extend(picture);
    items.extend(wifi);
    items.extend(bluetooth_keys);
    items.extend(bluetooth_names);
    let total: u64 = items.iter().map(|item| item.size).sum();

    let windows_before = storage.layout(&drive.volume)?.windows.Size;
    let size = sizes::moving_box(items.len() as u64, total);
    let (plan, disk) = plan_box(&storage, &drive, &found, size)?;
    if let Some(size) = plan.windows_size {
        let windows = storage.layout(&drive.volume)?.windows;
        windows_space::shrink(context, &storage, &windows, size)?;
    }
    let partition = storage.create(&disk, plan.partitions[0].span, BASIC_TYPE)?;
    record::made_partition(
        &partition
            .guid()
            .ok_or_else(|| t!(L10N, "drive-box-no-guid"))?,
    )?;
    if let Err(error) = fill(context, &storage, &partition, &items, &manifest) {
        if let Err(cleanup) = take_back(&storage, &drive, &partition, windows_before) {
            eprintln!("Cleaning up after packing failed didn't work: {cleanup}");
        }
        return Err(error);
    }
    drop(staging);
    if let Some(made) = handoff.partitions_mut() {
        made.moving_box = partition.guid();
        made.room = made.room.map(|room| luft_meet::Room {
            offset: plan.room.offset,
            size: plan.room.size,
            ..room
        });
    }
    state::write_handoff(&live, &handoff)?;
    prepare::now_prepared(&storage)
}
