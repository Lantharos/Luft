mod params;

use luft_app::Commands;
use sabine::SabineWindow;

use crate::drives;
use crate::files::{entries, transfer, trash};
use crate::integration::chooser::{ChooserResponse, ChooserSession};
use crate::integration::launch_args;
use crate::settings;
use crate::state::RoverState;
use crate::vcs;
use params::*;

pub fn register(window: SabineWindow, state: &RoverState) -> SabineWindow {
    let window = register_files(window, state);
    let window = register_trash(window, state);
    let window = register_vcs(window, state);
    register_app(window, state)
}

fn register_files(window: SabineWindow, state: &RoverState) -> SabineWindow {
    window
        .command("list_directory", |Listing { path, show_hidden }| {
            entries::list_directory(path, show_hidden)
        })
        .with("watch_directory", state, |state, Path { path }| {
            state.watcher.watch(path)
        })
        .command("get_file_info", |Path { path }| {
            entries::get_file_info(path)
        })
        .command("create_file", |NewEntry { path, name }| {
            entries::create_file(path, name)
        })
        .command("create_directory", |NewEntry { path, name }| {
            entries::create_directory(path, name)
        })
        .command("rename_item", |Rename { path, new_name }| {
            entries::rename_item(path, new_name)
        })
        .with(
            "copy_items",
            state,
            |state,
             Transfer {
                 sources,
                 destination,
             }| { transfer::copy_items(sources, destination, &state.queue) },
        )
        .with(
            "move_items",
            state,
            |state,
             Transfer {
                 sources,
                 destination,
             }| { transfer::move_items(sources, destination, &state.queue) },
        )
        .command("open_with_default", |Path { path }| {
            entries::open_with_default(path)
        })
        .command("list_drives", |Empty {}| Ok(drives::list_drives()))
        .command("eject_drive", |MountPoint { mount_point }| {
            drives::eject_drive(mount_point)
        })
}

fn register_trash(window: SabineWindow, state: &RoverState) -> SabineWindow {
    window
        .command("list_trash", |Empty {}| trash::list_trash())
        .with("move_to_trash", state, |state, Paths { paths }| {
            trash::move_to_trash(paths, &state.queue)
        })
        .with("restore_from_trash", state, |state, Ids { ids }| {
            trash::restore(ids, &state.queue)
        })
        .with("delete_permanently", state, |state, Ids { ids }| {
            trash::delete_permanently(ids, &state.queue)
        })
        .command("empty_trash", |TrashLocation { trash_path }| {
            trash::empty_trash(trash_path)
        })
        .with("list_operations", state, |state, Empty {}| {
            Ok(state.queue.operations())
        })
        .with("cancel_operation", state, |state, Id { id }| {
            state.queue.cancel(&id);
            Ok(())
        })
        .with("pause_operation", state, |state, Id { id }| {
            state.queue.pause(&id);
            Ok(())
        })
        .with("resume_operation", state, |state, Id { id }| {
            state.queue.resume(&id);
            Ok(())
        })
}

fn register_vcs(window: SabineWindow, state: &RoverState) -> SabineWindow {
    window
        .command("vcs_root", |Path { path }| Ok(vcs::root(path)))
        .with("vcs_status", state, |state, VcsRoot { root }| {
            Ok(vcs::start_status(root, state.events.clone()))
        })
        .command("vcs_diff", |VcsDiff { root, file_path }| {
            vcs::diff(root, file_path)
        })
        .command(
            "vcs_save",
            |VcsSave {
                 root,
                 message,
                 files,
             }| { vcs::save(root, message, files) },
        )
        .command("vcs_sync", |VcsRoot { root }| vcs::sync(root))
}

fn register_app(window: SabineWindow, state: &RoverState) -> SabineWindow {
    window
        .with("app_state", state, |state, Empty {}| Ok(state.app_state()))
        .command(
            "resolve_arguments",
            |Arguments {
                 arguments,
                 working_directory,
             }| {
                let cwd = working_directory.unwrap_or_else(|| "/".to_string());
                Ok(launch_args::resolve(
                    arguments.get(1..).unwrap_or_default(),
                    std::path::Path::new(&cwd),
                ))
            },
        )
        .with(
            "update_settings",
            state,
            |state, SettingsUpdate { settings }| {
                settings::update_settings(settings, &state.settings)
            },
        )
        .with("accept_chooser", state, |state, Paths { paths }| {
            chooser(state)?.respond(ChooserResponse {
                accepted: true,
                paths,
            })
        })
        .with("cancel_chooser", state, |state, Empty {}| {
            chooser(state)?.respond(ChooserResponse::default())
        })
}

fn chooser(state: &RoverState) -> Result<&ChooserSession, String> {
    state
        .chooser
        .as_deref()
        .ok_or_else(|| "Rover was not opened as a file chooser".to_string())
}
