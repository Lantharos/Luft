use luft_app::Commands;
use luft_app::portal::FileChooser;
use sabine::{BridgeCommand, BridgeError, BridgeResponse, BridgeResult, SabineWindow};
use serde::Serialize;

use super::params::*;
use crate::services::compose;
use crate::state::{MailmanState, cache_folder};

#[derive(Serialize)]
struct Chosen {
    path: String,
    name: String,
    size: u64,
}

fn chosen(path: &std::path::Path) -> Chosen {
    Chosen {
        size: std::fs::metadata(path)
            .map(|metadata| metadata.len())
            .unwrap_or(0),
        name: path
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_default(),
        path: path.to_string_lossy().into_owned(),
    }
}

fn choose_files(Empty {}: Empty) -> Result<Vec<Chosen>, String> {
    let chooser = FileChooser {
        title: "Attach Files",
        multiple: true,
        ..FileChooser::default()
    };
    Ok(chooser
        .open()?
        .iter()
        .filter_map(|uri| luft_app::portal::uri_path(uri))
        .map(|path| chosen(&path))
        .collect())
}

fn describe_files(Paths { paths }: Paths) -> Result<Vec<Chosen>, String> {
    Ok(paths
        .iter()
        .map(|path| chosen(std::path::Path::new(path)))
        .filter(|file| std::path::Path::new(&file.path).is_file())
        .collect())
}

fn stash(command: BridgeCommand) -> BridgeResult {
    let Stash { name } = serde_json::from_value(command.params)
        .map_err(|error| BridgeError::new(error.to_string()))?;
    let path = write_stash(&name, &command.body.unwrap_or_default()).map_err(BridgeError::new)?;
    Ok(BridgeResponse::json(path.into()))
}

fn write_stash(name: &str, bytes: &[u8]) -> Result<String, String> {
    let stamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|elapsed| elapsed.as_nanos())
        .unwrap_or_default();
    let folder = cache_folder().join("compose").join(stamp.to_string());
    std::fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let path = folder.join(name.replace(['/', '\\'], "_"));
    std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

pub fn register(window: SabineWindow, state: &MailmanState) -> SabineWindow {
    window
        .with("send", state, |state, Send { draft }| {
            compose::send(state, draft)
        })
        .with("cancel_send", state, |state, Id { id }| {
            state.store.cancel_outgoing(id)
        })
        .with(
            "save_draft",
            state,
            |state, SaveDraft { draft, replaces }| compose::save_draft(state, draft, replaces),
        )
        .with("reopen_draft", state, |state, Id { id }| {
            compose::reopen(state, id)
        })
        .with("unsubscribe", state, |state, Id { id }| {
            compose::unsubscribe(state, id)
        })
        .command("choose_files", choose_files)
        .command("describe_files", describe_files)
        .bridge_handler("stash_file", stash)
        .with("templates", state, |state, Empty {}| {
            state.store.templates()
        })
        .with(
            "save_template",
            state,
            |state, Template { id, name, body }| state.store.save_template(id, &name, &body),
        )
        .with("delete_template", state, |state, Id { id }| {
            state.store.delete_template(id)
        })
}
