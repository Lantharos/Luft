use std::path::Path;

use gio::prelude::*;
use luft_app::{Appearance, Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::actions::formatting::Format;
use crate::actions::{drive, encryption, formatting, mounting, partitions};
use crate::images::{self, Imaging};
use crate::launch;
use crate::space::Explorer;
use crate::udisks::{self, snapshot};

#[derive(Clone, Default)]
pub struct State {
    pub events: Events,
    pub imaging: Imaging,
    pub explorer: Explorer,
}

#[derive(Serialize)]
struct AppState {
    arguments: Vec<String>,
    #[serde(flatten)]
    appearance: Appearance,
}

#[derive(Deserialize)]
struct Arguments {
    arguments: Vec<String>,
}

#[derive(Deserialize)]
struct Block {
    block: String,
}

#[derive(Deserialize)]
struct Folder {
    path: String,
}

#[derive(Deserialize)]
struct Label {
    block: String,
    label: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Startup {
    block: String,
    directory: Option<String>,
    read_only: bool,
}

#[derive(Deserialize)]
struct FormatVolume {
    block: String,
    format: Format,
}

#[derive(Deserialize)]
struct FormatDrive {
    block: String,
    size: u64,
    removable: bool,
    format: Format,
}

#[derive(Deserialize)]
struct CreatePartition {
    table: String,
    offset: u64,
    size: u64,
    format: Format,
}

#[derive(Deserialize)]
struct Resize {
    block: String,
    size: u64,
}

#[derive(Deserialize)]
struct Unlock {
    block: String,
    passphrase: Option<String>,
    remember: bool,
}

#[derive(Deserialize)]
struct ChangePassphrase {
    block: String,
    current: String,
    next: String,
}

#[derive(Deserialize)]
struct Remove {
    drive: String,
    block: String,
}

#[derive(Deserialize)]
struct Selftest {
    drive: String,
    extended: bool,
}

#[derive(Deserialize)]
struct Drive {
    drive: String,
}

#[derive(Deserialize)]
struct Place {
    path: Vec<String>,
}

#[derive(Deserialize)]
struct CreateImage {
    block: String,
    path: String,
}

#[derive(Deserialize)]
struct RestoreImage {
    block: String,
    path: String,
}

pub fn register(window: SabineWindow, state: &State) -> SabineWindow {
    let window = register_volumes(window);
    let window = register_encryption(window);
    let window = register_space(window, state);
    register_drives(window, state)
}

fn register_space(window: SabineWindow, state: &State) -> SabineWindow {
    window
        .with("space_scan", state, |state, Folder { path }| {
            state.explorer.start(&state.events, &path)
        })
        .with("space_view", state, |state, Place { path }| {
            state.explorer.view(path)
        })
        .with("space_trash", state, |state, Place { path }| {
            state.explorer.trash(path)
        })
        .with("space_show", state, |state, Place { path }| {
            state.explorer.show(path)
        })
        .with("space_stop", state, |state, _: Value| {
            state.explorer.stop();
            Ok(())
        })
}

fn register_volumes(window: SabineWindow) -> SabineWindow {
    window
        .command("app_state", |_: Value| {
            Ok(AppState {
                arguments: std::env::args().skip(1).collect(),
                appearance: Appearance::current(),
            })
        })
        .command("disks_snapshot", |_: Value| {
            Ok(snapshot::build(&udisks::objects()?))
        })
        .command("disks_locate", |Arguments { arguments }| {
            Ok(launch::resolve(
                &arguments,
                &snapshot::build(&udisks::objects()?),
            ))
        })
        .command("disks_formats", |_: Value| Ok(formatting::supported()))
        .command("disks_mount", |Block { block }| mounting::mount(&block))
        .command("disks_unmount", |Block { block }| mounting::unmount(&block))
        .command("disks_open_folder", |Folder { path }| open_folder(&path))
        .command("disks_label", |Label { block, label }| {
            mounting::set_label(&block, &label)
        })
        .command(
            "disks_startup",
            |Startup {
                 block,
                 directory,
                 read_only,
             }| { mounting::set_startup(&block, directory.as_deref(), read_only) },
        )
        .command("disks_format_volume", |FormatVolume { block, format }| {
            formatting::format_volume(&block, &format)
        })
        .command(
            "disks_format_drive",
            |FormatDrive {
                 block,
                 size,
                 removable,
                 format,
             }| { formatting::format_drive(&block, size, removable, &format) },
        )
        .command(
            "disks_create_partition",
            |CreatePartition {
                 table,
                 offset,
                 size,
                 format,
             }| { formatting::create_partition(&table, offset, size, &format, true) },
        )
        .command("disks_delete_partition", |Block { block }| {
            partitions::delete(&block)
        })
        .command("disks_resize", |Resize { block, size }| {
            partitions::resize(&block, size)
        })
}

fn open_folder(path: &str) -> Result<(), String> {
    let uri = gio::File::for_path(path).uri();
    gio::AppInfo::launch_default_for_uri(&uri, gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

fn register_encryption(window: SabineWindow) -> SabineWindow {
    window
        .command(
            "disks_unlock",
            |Unlock {
                 block,
                 passphrase,
                 remember,
             }| { encryption::unlock(&block, passphrase.as_deref(), remember) },
        )
        .command("disks_lock", |Block { block }| encryption::lock(&block))
        .command(
            "disks_change_passphrase",
            |ChangePassphrase {
                 block,
                 current,
                 next,
             }| { encryption::change_passphrase(&block, &current, &next) },
        )
        .command("disks_remembered", |Block { block }| {
            Ok(encryption::is_remembered(&block))
        })
        .command("disks_forget_passphrase", |Block { block }| {
            encryption::stop_remembering(&block);
            Ok(())
        })
}

fn register_drives(window: SabineWindow, state: &State) -> SabineWindow {
    window
        .command("disks_safely_remove", |Remove { drive, block }| {
            drive::safely_remove(&drive, &block)
        })
        .command("disks_selftest", |Selftest { drive, extended }| {
            drive::start_selftest(&drive, extended)
        })
        .command("disks_selftest_stop", |Drive { drive }| {
            drive::stop_selftest(&drive)
        })
        .command(
            "disks_image_folder",
            |_: Value| Ok(images::default_folder()),
        )
        .with("disks_image_choose_folder", state, |state, _: Value| {
            state.imaging.choose_folder()
        })
        .with(
            "disks_image_create",
            state,
            |state, CreateImage { block, path }| {
                state
                    .imaging
                    .create(&state.events, &block, Path::new(&path))
            },
        )
        .with("disks_image_choose", state, |state, _: Value| {
            state.imaging.choose()
        })
        .with(
            "disks_image_restore",
            state,
            |state, RestoreImage { block, path }| {
                state
                    .imaging
                    .restore(&state.events, &block, Path::new(&path))
            },
        )
        .with("disks_image_cancel", state, |state, _: Value| {
            state.imaging.cancel();
            Ok(())
        })
}
