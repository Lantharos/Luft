use std::path::Path;

use gio::prelude::*;
use luft_app::{Activation, Appearance, Commands, Empty, Events};
use sabine::SabineWindow;
use serde::Serialize;
use specta::Type;

use crate::actions::{drive, encryption, formatting, mounting, plan};
use crate::events::SYSTEM_STEP;
use crate::images::{self, Imaging};
use crate::launch;
use crate::space::Explorer;
use crate::trust::{self, drives as encryption_drives};
use crate::udisks::{self, snapshot};
use luft_disks::{partitions, systems};
use requests::{
    Block, ChangePassphrase, CreateImage, CreatePartition, Drive, Encrypt, Folder, FormatDrive,
    FormatEncrypted, FormatVolume, Grow, Handoff, KeySheet, Label, NextStep, Place, Remove,
    RestoreImage, Resume, Selftest, Shown, Startup, SystemId, Unlock, Unlocked, Unlocking, Uuid,
};

mod requests;

#[derive(Clone, Default)]
pub struct State {
    pub events: Events,
    pub imaging: Imaging,
    pub explorer: Explorer,
}

#[derive(Serialize, Type)]
struct AppState {
    activation: Activation,
    #[serde(flatten)]
    appearance: Appearance,
}

pub fn register(window: SabineWindow, state: &State) -> SabineWindow {
    let window = register_volumes(window);
    let window = register_encryption(window);
    let window = register_space(window, state);
    let window = register_trust(window);
    let window = register_plan(window, state);
    let window = register_systems(window, state);
    register_drives(window, state)
}

fn register_trust(window: SabineWindow) -> SabineWindow {
    window
        .command_async("trust_state", |Empty {}| trust::state())
        .command_async("trust_check", |Block { block }| async move {
            encryption_drives::check(&block).await
        })
        .command_async("trust_recovery_key", |Empty {}| {
            encryption_drives::recovery_key()
        })
        .command_async(
            "trust_encrypt",
            |Encrypt {
                 block,
                 recovery_key,
                 passphrase,
                 auto_unlock,
             }| async move {
                encryption_drives::encrypt(&block, &recovery_key, &passphrase, auto_unlock).await
            },
        )
        .command_async(
            "trust_format",
            |FormatEncrypted {
                 block,
                 format,
                 recovery_key,
                 auto_unlock,
             }| async move {
                encryption_drives::format(&block, format, &recovery_key, auto_unlock).await
            },
        )
        .command_async("trust_decrypt", |Unlocked { block, unlock }| async move {
            encryption_drives::decrypt(&block, &unlock).await
        })
        .command_async(
            "trust_unlocking",
            |Unlocking {
                 block,
                 unlock,
                 recovery_key,
                 auto_unlock,
             }| async move {
                encryption_drives::set_up_unlocking(&block, &unlock, &recovery_key, auto_unlock)
                    .await
            },
        )
        .command_async("trust_pause", |Uuid { uuid }| async move {
            encryption_drives::pause(&uuid).await
        })
        .command_async("trust_resume", |Resume { uuid, unlock }| async move {
            encryption_drives::resume(&uuid, &unlock).await
        })
        .command_async("trust_show_key", |Uuid { uuid }| async move {
            encryption_drives::show_recovery_key(&uuid).await
        })
        .command_async("trust_save_key", |KeySheet { key, name }| async move {
            encryption_drives::save_key(&key, &name).await
        })
        .command_async("trust_print_key", |KeySheet { key, name }| async move {
            encryption_drives::print_key(&key, &name).await
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
        .with_async(
            "space_show",
            state,
            |state, Shown { path, token }| async move {
                state.explorer.show(path, token.as_deref()).await
            },
        )
        .with("space_stop", state, |state, Empty {}| {
            state.explorer.stop();
            Ok(())
        })
}

fn register_plan(window: SabineWindow, state: &State) -> SabineWindow {
    window.with_async(
        "disks_plan_step",
        state,
        |state, NextStep { step }| async move { plan::run(&state.events, step).await },
    )
}

fn register_systems(window: SabineWindow, state: &State) -> SabineWindow {
    window
        .command_async("disks_systems", |Empty {}| systems::find())
        .with_async(
            "disks_remove_system",
            state,
            |state, SystemId { id }| async move {
                systems::remove(&id, |step| {
                    state.events.emit(SYSTEM_STEP, step);
                })
                .await
            },
        )
        .command_async("disks_grow_system", |Grow { unlock }| async move {
            systems::grow(&unlock).await
        })
}

fn register_volumes(window: SabineWindow) -> SabineWindow {
    window
        .command_async("app_state", |Empty {}| async {
            Ok(AppState {
                activation: Activation::current_process(),
                appearance: Appearance::current().await,
            })
        })
        .command_async("disks_snapshot", |Empty {}| async {
            Ok(snapshot::build(&udisks::objects().await?))
        })
        .command_async("disks_locate", |activation: Activation| async move {
            Ok(launch::resolve(
                &activation,
                &snapshot::build(&udisks::objects().await?),
            ))
        })
        .command_async("disks_formats", |Empty {}| async {
            Ok(formatting::supported().await)
        })
        .command_async("disks_mount", |Block { block }| async move {
            mounting::mount(&block).await
        })
        .command_async("disks_unmount", |Block { block }| async move {
            mounting::unmount(&block).await
        })
        .command("disks_open_folder", |Handoff { path, token }| {
            open_folder(&path, token.as_deref())
        })
        .command_async("disks_label", |Label { block, label }| async move {
            mounting::set_label(&block, &label).await
        })
        .command_async(
            "disks_startup",
            |Startup {
                 block,
                 directory,
                 read_only,
             }| async move {
                mounting::set_startup(&block, directory.as_deref(), read_only).await
            },
        )
        .command_async(
            "disks_format_volume",
            |FormatVolume { block, format }| async move {
                formatting::format_volume(&block, &format).await
            },
        )
        .command_async(
            "disks_format_drive",
            |FormatDrive {
                 block,
                 size,
                 removable,
                 format,
             }| async move {
                formatting::format_drive(&block, size, removable, &format).await
            },
        )
        .command_async(
            "disks_create_partition",
            |CreatePartition {
                 table,
                 offset,
                 size,
                 format,
             }| async move {
                formatting::create_partition(&table, offset, size, &format, true).await
            },
        )
        .command_async("disks_delete_partition", |Block { block }| async move {
            partitions::delete(&block).await
        })
}

fn open_folder(path: &str, token: Option<&str>) -> Result<(), String> {
    let uri = gio::File::for_path(path).uri();
    luft_app::launch::open(&uri, token).map_err(|error| error.to_string())
}

fn register_encryption(window: SabineWindow) -> SabineWindow {
    window
        .command_async(
            "disks_unlock",
            |Unlock {
                 block,
                 passphrase,
                 remember,
             }| async move {
                encryption::unlock(&block, passphrase.as_deref(), remember).await
            },
        )
        .command_async("disks_lock", |Block { block }| async move {
            encryption::lock(&block).await
        })
        .command_async(
            "disks_change_passphrase",
            |ChangePassphrase {
                 block,
                 current,
                 next,
             }| async move { encryption::change_passphrase(&block, &current, &next).await },
        )
        .command_async("disks_remembered", |Block { block }| async move {
            Ok(encryption::is_remembered(&block).await)
        })
        .command_async("disks_forget_passphrase", |Block { block }| async move {
            encryption::stop_remembering(&block).await;
            Ok(())
        })
}

fn register_drives(window: SabineWindow, state: &State) -> SabineWindow {
    window
        .command_async("disks_safely_remove", |Remove { drive, block }| async move {
            drive::safely_remove(&drive, &block).await
        })
        .command_async("disks_selftest", |Selftest { drive, extended }| async move {
            drive::start_selftest(&drive, extended).await
        })
        .command_async("disks_selftest_stop", |Drive { drive }| async move {
            drive::stop_selftest(&drive).await
        })
        .command(
            "disks_image_folder",
            |Empty {}| Ok(images::default_folder()),
        )
        .with_async("disks_image_choose_folder", state, |state, Empty {}| async move {
            state.imaging.choose_folder().await
        })
        .with_async(
            "disks_image_create",
            state,
            |state, CreateImage { block, path }| async move {
                state
                    .imaging
                    .create(&state.events, &block, Path::new(&path))
                    .await
            },
        )
        .with_async("disks_image_choose", state, |state, Empty {}| async move {
            state.imaging.choose().await
        })
        .with_async(
            "disks_image_restore",
            state,
            |state, RestoreImage { block, path }| async move {
                state
                    .imaging
                    .restore(&state.events, &block, Path::new(&path))
                    .await
            },
        )
        .with("disks_image_cancel", state, |state, Empty {}| {
            state.imaging.cancel();
            Ok(())
        })
}
