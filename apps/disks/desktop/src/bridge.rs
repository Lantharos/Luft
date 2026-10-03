use std::path::Path;

use gio::prelude::*;
use luft_app::{Appearance, Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::actions::formatting::Format;
use crate::actions::{drive, encryption, formatting, mounting, plan};
use crate::images::{self, Imaging};
use crate::launch;
use crate::space::Explorer;
use crate::trust::{self, drives as encryption_drives};
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
struct PlanStep {
    step: plan::Step,
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
#[serde(rename_all = "camelCase")]
struct Encrypt {
    block: String,
    recovery_key: String,
    passphrase: String,
    auto_unlock: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FormatEncrypted {
    block: String,
    format: Format,
    recovery_key: String,
    auto_unlock: bool,
}

#[derive(Deserialize)]
struct Unlocked {
    block: String,
    unlock: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Unlocking {
    block: String,
    unlock: String,
    recovery_key: String,
    auto_unlock: bool,
}

#[derive(Deserialize)]
struct Uuid {
    uuid: String,
}

#[derive(Deserialize)]
struct Resume {
    uuid: String,
    unlock: String,
}

#[derive(Deserialize)]
struct KeySheet {
    key: String,
    name: String,
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
    let window = register_trust(window);
    let window = register_plan(window, state);
    register_drives(window, state)
}

fn register_trust(window: SabineWindow) -> SabineWindow {
    window
        .command("trust_state", |_: Value| trust::state())
        .command("trust_check", |Block { block }| {
            encryption_drives::check(&block)
        })
        .command("trust_recovery_key", |_: Value| {
            encryption_drives::recovery_key()
        })
        .command(
            "trust_encrypt",
            |Encrypt {
                 block,
                 recovery_key,
                 passphrase,
                 auto_unlock,
             }| {
                encryption_drives::encrypt(&block, &recovery_key, &passphrase, auto_unlock)
            },
        )
        .command(
            "trust_format",
            |FormatEncrypted {
                 block,
                 format,
                 recovery_key,
                 auto_unlock,
             }| {
                encryption_drives::format(&block, format, &recovery_key, auto_unlock)
            },
        )
        .command("trust_decrypt", |Unlocked { block, unlock }| {
            encryption_drives::decrypt(&block, &unlock)
        })
        .command(
            "trust_unlocking",
            |Unlocking {
                 block,
                 unlock,
                 recovery_key,
                 auto_unlock,
             }| {
                encryption_drives::set_up_unlocking(&block, &unlock, &recovery_key, auto_unlock)
            },
        )
        .command("trust_pause", |Uuid { uuid }| {
            encryption_drives::pause(&uuid)
        })
        .command("trust_resume", |Resume { uuid, unlock }| {
            encryption_drives::resume(&uuid, &unlock)
        })
        .command("trust_show_key", |Uuid { uuid }| {
            encryption_drives::show_recovery_key(&uuid)
        })
        .command("trust_save_key", |KeySheet { key, name }| {
            encryption_drives::save_key(&key, &name)
        })
        .command("trust_print_key", |KeySheet { key, name }| {
            encryption_drives::print_key(&key, &name)
        })
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

fn register_plan(window: SabineWindow, state: &State) -> SabineWindow {
    window.with("disks_plan_step", state, |state, PlanStep { step }| {
        plan::run(&state.events, step)
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
            plan::delete(&block)
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
