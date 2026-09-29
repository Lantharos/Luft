use luft_app::Commands;
use sabine::SabineWindow;
use serde_json::Value;

use crate::desktop;
use crate::files::{self, encoding, index, listing};
use crate::launch;
use crate::state::{self, WrenState};
use crate::store;

pub fn register(window: SabineWindow, state: &WrenState) -> SabineWindow {
    window
        .command("app_state", |_: Value| state::app_state())
        .command("activation_folders", launch::activation_folders)
        .command("store_read", store::read)
        .command("store_write", store::write)
        .command("backup_remove", store::remove_backup)
        .command("dir_list", listing::list)
        .command("dir_files", index::files)
        .command("file_stat", files::stat)
        .command("file_encoding", encoding::detect)
        .command("choose_files", desktop::choose_files)
        .command("choose_folder", desktop::choose_folder)
        .command("choose_save", desktop::choose_save)
        .command("show_in_folder", desktop::show_in_folder)
        .command("open_link", desktop::open_link)
        .with("write_chunk", &state.writes, |writes, chunk| {
            writes.append(chunk)
        })
        .with("write_commit", &state.writes, |writes, commit| {
            writes.commit(commit)
        })
        .with("write_discard", &state.writes, |writes, discard| {
            writes.discard(discard)
        })
        .with("watch", &state.watcher, |watcher, folders| {
            watcher.watch(folders)
        })
}
