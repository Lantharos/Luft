use std::path::PathBuf;

use luft_app::portal;
use luft_app::{Appearance, Commands};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{characters, layout, method, sources};

pub const LINK_SCHEME: &str = "kestrel-keys:";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    link: Option<String>,
    files: Vec<String>,
}

#[derive(Deserialize)]
struct OpenFile {
    path: String,
}

#[derive(Serialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
enum Opened {
    Layout { id: String },
    Method { id: String },
}

fn open_file(OpenFile { path }: OpenFile) -> Result<Opened, String> {
    let path = portal::uri_path(&path).unwrap_or_else(|| PathBuf::from(path));
    if method::is_method_file(&path) {
        method::import_path(&path).map(|stored| Opened::Method { id: stored.id })
    } else {
        layout::import_path(&path).map(|layout| Opened::Layout { id: layout.id })
    }
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("app_state", |_: Value| {
            let arguments: Vec<String> = std::env::args().skip(1).collect();
            Ok(AppState {
                appearance: Appearance::current(),
                link: arguments
                    .iter()
                    .find(|argument| argument.starts_with(LINK_SCHEME))
                    .cloned(),
                files: arguments
                    .into_iter()
                    .filter(|argument| {
                        !argument.starts_with(LINK_SCHEME) && !argument.starts_with('-')
                    })
                    .collect(),
            })
        })
        .command("open_file", open_file)
        .command("characters", |_: Value| Ok(characters::all()))
        .command("input_sources", |_: Value| sources::list())
}
