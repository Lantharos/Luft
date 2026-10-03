use luft_app::Commands;
use luft_app::thumbnails::ThumbnailSize;
use sabine::SabineWindow;
use serde::Deserialize;

use super::params::{Empty, Path, Paths};
use crate::archives::{self, ArchiveFormat};
use crate::files::operations::{Decision, Resolution};
use crate::files::rename::{self, Renaming};
use crate::files::transfer;
use crate::integration::terminal;
use crate::properties;
use crate::search::Query;
use crate::state::RoverState;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ConflictAnswer {
    id: String,
    resolution: Resolution,
    apply_to_all: bool,
}

#[derive(Deserialize)]
struct BatchRename {
    renamings: Vec<Renaming>,
}

#[derive(Deserialize)]
struct ThumbnailRequest {
    paths: Vec<String>,
    size: ThumbnailSize,
}

#[derive(Deserialize)]
struct SearchRequest {
    query: Query,
}

#[derive(Deserialize)]
struct Task {
    id: u64,
}

#[derive(Deserialize)]
struct Compress {
    paths: Vec<String>,
    destination: String,
    name: String,
    format: ArchiveFormat,
}

#[derive(Deserialize)]
struct Extract {
    paths: Vec<String>,
    destination: String,
}

#[derive(Deserialize)]
struct Permissions {
    path: String,
    mode: u32,
}

#[derive(Deserialize)]
struct DefaultApp {
    path: String,
    app: String,
}

pub fn register(window: SabineWindow, state: &RoverState) -> SabineWindow {
    let window = register_changes(window, state);
    let window = register_discovery(window, state);
    register_properties(window, state)
}

fn register_changes(window: SabineWindow, state: &RoverState) -> SabineWindow {
    window
        .with("history_state", state, |state, Empty {}| {
            Ok(state.history.state())
        })
        .with("undo", state, |state, Empty {}| {
            state.history.undo();
            Ok(())
        })
        .with("redo", state, |state, Empty {}| {
            state.history.redo();
            Ok(())
        })
        .with(
            "resolve_conflict",
            state,
            |state,
             ConflictAnswer {
                 id,
                 resolution,
                 apply_to_all,
             }| {
                state.queue.decide(
                    &id,
                    Decision {
                        resolution,
                        apply_to_all,
                    },
                )
            },
        )
        .with("duplicate_items", state, |state, Paths { paths }| {
            transfer::duplicate_items(paths, &state.queue, &state.history)
        })
        .with("batch_rename", state, |state, BatchRename { renamings }| {
            rename::batch_rename(renamings, &state.history)
        })
        .with(
            "compress_items",
            state,
            |state,
             Compress {
                 paths,
                 destination,
                 name,
                 format,
             }| {
                archives::compress(
                    paths,
                    destination,
                    name,
                    format,
                    &state.queue,
                    &state.history,
                )
            },
        )
        .with(
            "extract_archives",
            state,
            |state, Extract { paths, destination }| {
                archives::extract(paths, destination, &state.queue, &state.history)
            },
        )
}

fn register_discovery(window: SabineWindow, state: &RoverState) -> SabineWindow {
    window
        .with(
            "request_thumbnails",
            state,
            |state, ThumbnailRequest { mut paths, size }| {
                paths.retain(|path| !crate::network::is_remote(path));
                state.thumbnails.request(paths, size);
                Ok(())
            },
        )
        .with("start_search", state, |state, SearchRequest { query }| {
            state.search.start(query)
        })
        .with("cancel_search", state, |state, Task { id }| {
            state.search.cancel(id);
            Ok(())
        })
        .command("open_terminal", |Path { path }| terminal::open(&path))
}

fn register_properties(window: SabineWindow, state: &RoverState) -> SabineWindow {
    window
        .command("file_ownership", |Path { path }| {
            properties::ownership(&path)
        })
        .command("set_permissions", |Permissions { path, mode }| {
            properties::set_permissions(&path, mode)
        })
        .command("set_default_app", |DefaultApp { path, app }| {
            properties::set_default_app(&path, &app)
        })
        .with("measure", state, |state, Paths { paths }| {
            Ok(state.measurements.start(paths))
        })
        .with("cancel_measure", state, |state, Task { id }| {
            state.measurements.cancel(id);
            Ok(())
        })
}
