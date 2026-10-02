use luft_app::Commands;
use luft_app::portal::FileChooser;
use sabine::SabineWindow;
use serde::Serialize;

use base64::Engine;
use base64::engine::general_purpose::STANDARD;

use super::params::*;
use crate::services::compose;
use crate::state::{MailmanState, cache_folder};

#[derive(Serialize)]
struct Chosen {
    path: String,
    name: String,
    size: u64,
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
        .map(|path| Chosen {
            size: std::fs::metadata(&path)
                .map(|metadata| metadata.len())
                .unwrap_or(0),
            name: path
                .file_name()
                .map(|name| name.to_string_lossy().into_owned())
                .unwrap_or_default(),
            path: path.to_string_lossy().into_owned(),
        })
        .collect())
}

fn stash(Stash { name, data }: Stash) -> Result<String, String> {
    let bytes = STANDARD.decode(data).map_err(|error| error.to_string())?;
    let folder = cache_folder().join("compose");
    std::fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let stamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|elapsed| elapsed.as_nanos())
        .unwrap_or_default();
    let path = folder.join(format!("{stamp}-{}", name.replace(['/', '\\'], "_")));
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
        .command("stash_file", stash)
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
