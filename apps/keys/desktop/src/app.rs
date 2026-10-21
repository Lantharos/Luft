use std::path::PathBuf;

use luft_app::portal;
use luft_app::{Activation, Appearance, Commands};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::compose::Reloader;
use crate::{characters, layout, method, sources};

pub const LINK_SCHEME: &str = "kestrel-keys:";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    #[serde(flatten)]
    targets: Targets,
}

#[derive(Serialize)]
struct Targets {
    link: Option<String>,
    files: Vec<PathBuf>,
}

impl From<&Activation> for Targets {
    fn from(activation: &Activation) -> Self {
        let (links, files): (Vec<&String>, Vec<&String>) = activation
            .arguments()
            .iter()
            .partition(|argument| argument.starts_with(LINK_SCHEME));
        Self {
            link: links.first().map(|link| link.to_string()),
            files: files
                .into_iter()
                .filter_map(|argument| activation.path(argument))
                .collect(),
        }
    }
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

fn open_file(reloader: &Reloader, OpenFile { path }: OpenFile) -> Result<Opened, String> {
    let path = portal::uri_path(&path).unwrap_or_else(|| PathBuf::from(path));
    if method::is_method_file(&path) {
        method::import_path(&path).map(|stored| Opened::Method { id: stored.id })
    } else {
        layout::import_path(&path, reloader).map(|layout| Opened::Layout { id: layout.id })
    }
}

async fn app_state(_: Value) -> Result<AppState, String> {
    Ok(AppState {
        appearance: Appearance::current().await,
        targets: Targets::from(&Activation::current_process()),
    })
}

pub fn register(window: SabineWindow, reloader: &Reloader) -> SabineWindow {
    window
        .command_async("app_state", app_state)
        .command("activation_targets", |activation: Activation| {
            Ok(Targets::from(&activation))
        })
        .with("open_file", reloader, open_file)
        .command("characters", |_: Value| Ok(characters::all()))
        .command("input_sources", |_: Value| sources::list())
}
