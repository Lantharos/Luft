mod params;
mod tools;

use luft_app::{Activation, Commands, Empty};
use sabine::SabineWindow;

use crate::app::settings;
use crate::app::state::RoverState;
use crate::details::vcs;
use crate::files::{entries, folders, transfer, trash};
use crate::integration::chooser::ChooserResponse;
use crate::integration::launch_args;
use crate::locations::drives;
use params::*;

pub fn register(window: SabineWindow, state: &RoverState) -> SabineWindow {
    let window = register_files(window, state);
    let window = register_trash(window, state);
    let window = register_vcs(window, state);
    let window = tools::register(window, state);
    let window = crate::locations::places::register(crate::details::inspect::register(
        crate::details::look::register(window),
    ));
    let window = crate::locations::network::register(window, &state.events);
    let window = crate::locations::cloud::register(window, &state.events);
    let window = crate::integration::file_actions::register(window, &state.events);
    register_app(crate::app::events::declare(window), state)
}

fn register_files(window: SabineWindow, state: &RoverState) -> SabineWindow {
    window
        .command("list_directory", |Listing { path, show_hidden }| {
            entries::list_directory(path, show_hidden)
        })
        .with(
            "watch_directory",
            state,
            |state, Watching { viewer, path }| state.watcher.watch(viewer, path),
        )
        .command("list_folders", |Path { path }| folders::list_folders(path))
        .with(
            "count_items",
            state,
            |state,
             Counting {
                 mut paths,
                 show_hidden,
             }| {
                paths.retain(|path| {
                    !crate::locations::network::is_remote(path)
                        && !crate::locations::cloud::is_cloud(path)
                });
                state.counts.request(paths, show_hidden);
                Ok(())
            },
        )
        .command("get_file_info", |Path { path }| {
            entries::get_file_info(path)
        })
        .command("is_pdf", |Path { path }| Ok(entries::is_pdf(&path)))
        .with("create_file", state, |state, NewEntry { path, name }| {
            entries::create_file(path, name, &state.history)
        })
        .with(
            "create_directory",
            state,
            |state, NewEntry { path, name }| entries::create_directory(path, name, &state.history),
        )
        .with("rename_item", state, |state, Rename { path, new_name }| {
            entries::rename_item(path, new_name, &state.history)
        })
        .with(
            "copy_items",
            state,
            |state,
             Transfer {
                 sources,
                 destination,
             }| {
                transfer::copy_items(sources, destination, &state.queue, &state.history)
            },
        )
        .with(
            "move_items",
            state,
            |state,
             Transfer {
                 sources,
                 destination,
             }| {
                transfer::move_items(sources, destination, &state.queue, &state.history)
            },
        )
        .command("open_link", |Link { uri, token }| {
            luft_app::launch::open_web_link(&uri, token.as_deref())
        })
        .command("list_drives", |Empty {}| Ok(drives::list_drives()))
        .command("eject_drive", |MountPoint { mount_point, .. }| {
            drives::eject_drive(mount_point)
        })
        .command_async("list_windows", |Empty {}| async {
            Ok(drives::closed_windows().await)
        })
        .command_async(
            "open_windows",
            |WindowsDevice { device, read_only }| async move {
                drives::open_windows(&device, read_only).await
            },
        )
        .command("manage_drive", |MountPoint { mount_point, token }| {
            drives::manage(&mount_point, token.as_deref())
        })
        .command("explore_space", |Handoff { path, token }| {
            drives::explore(&path, token.as_deref())
        })
}

fn register_trash(window: SabineWindow, state: &RoverState) -> SabineWindow {
    window
        .command("list_trash", |Empty {}| trash::list_trash())
        .with("move_to_trash", state, |state, Paths { paths }| {
            trash::move_to_trash(paths, &state.queue, &state.history)
        })
        .with("restore_from_trash", state, |state, Ids { ids }| {
            trash::restore(ids, &state.queue, &state.history)
        })
        .with("delete_items", state, |state, Paths { paths }| {
            trash::delete_items(paths, &state.queue)
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
        .with("vcs_root", state, |state, Path { path }| {
            Ok(vcs::root(path, &state.settings.read()))
        })
        .with("vcs_trust", state, |state, VcsRoot { root }| {
            vcs::trust(root, &mut state.settings.write())
        })
        .with("vcs_status", state, |state, VcsRoot { root }| {
            Ok(vcs::start_status(
                root,
                &state.settings.read(),
                state.events.clone(),
            ))
        })
        .with("vcs_diff", state, |state, VcsDiff { root, file_path }| {
            vcs::diff(root, file_path, &state.settings.read())
        })
        .with(
            "vcs_save",
            state,
            |state,
             VcsSave {
                 root,
                 message,
                 files,
             }| { vcs::save(root, message, files, &state.settings.read()) },
        )
        .with("vcs_sync", state, |state, VcsRoot { root }| {
            vcs::sync(root, &state.settings.read())
        })
}

fn register_app(window: SabineWindow, state: &RoverState) -> SabineWindow {
    window
        .with_async("app_state", state, |state, Empty {}| async move {
            Ok(state.app_state().await)
        })
        .command("resolve_arguments", |activation: Activation| {
            Ok(launch_args::resolve(&activation))
        })
        .with(
            "update_settings",
            state,
            |state, SettingsUpdate { settings }| {
                settings::update_settings(settings, &state.settings)
            },
        )
        .with("chooser_config", state, |state, Chooser { request }| {
            state.choosers.config(request)
        })
        .with(
            "accept_chooser",
            state,
            |state,
             Chosen {
                 request,
                 paths,
                 filter,
             }| {
                state.finish_chooser(
                    request,
                    ChooserResponse {
                        accepted: true,
                        paths,
                        filter,
                    },
                );
                Ok(())
            },
        )
        .with("cancel_chooser", state, |state, Chooser { request }| {
            state.finish_chooser(request, ChooserResponse::default());
            Ok(())
        })
}
