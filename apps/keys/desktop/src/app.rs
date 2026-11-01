use std::path::{Path, PathBuf};

use luft_app::portal;
use luft_app::{Activation, Appearance, Commands, Empty};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;
use tokio::sync::OnceCell;
use tokio::task::spawn_blocking;

use crate::compose::Reloader;
use crate::{characters, layout, method, sources};

pub const LINK_SCHEME: &str = "kestrel-keys:";

static LAUNCH: OnceCell<Launch> = OnceCell::const_new();

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    #[serde(flatten)]
    launch: Launch,
}

#[derive(Clone, Serialize, Type)]
struct Launch {
    link: Option<String>,
    opened: Vec<Opened>,
    failed: Vec<String>,
}

#[derive(Serialize, Type)]
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

#[derive(Deserialize, Type)]
struct OpenFile {
    path: String,
}

#[derive(Clone, Serialize, Type)]
#[serde(tag = "kind", rename_all = "lowercase")]
enum Opened {
    Layout { id: String },
    Method { id: String },
}

fn open_path(reloader: &Reloader, path: &Path) -> Result<Opened, String> {
    if method::is_method_file(path) {
        method::import_path(path).map(|stored| Opened::Method { id: stored.id })
    } else {
        layout::import_path(path, reloader).map(|layout| Opened::Layout { id: layout.id })
    }
}

fn open_file(reloader: &Reloader, OpenFile { path }: OpenFile) -> Result<Opened, String> {
    open_path(
        reloader,
        &portal::uri_path(&path).unwrap_or_else(|| PathBuf::from(path)),
    )
}

fn open_launch(reloader: &Reloader) -> Launch {
    let Targets { link, files } = Targets::from(&Activation::current_process());
    let mut launch = Launch {
        link,
        opened: Vec::new(),
        failed: Vec::new(),
    };
    for file in &files {
        match open_path(reloader, file) {
            Ok(opened) => launch.opened.push(opened),
            Err(error) => launch.failed.push(error),
        }
    }
    launch
}

async fn app_state(reloader: Reloader, Empty {}: Empty) -> Result<AppState, String> {
    let launch = LAUNCH
        .get_or_try_init(|| spawn_blocking(move || open_launch(&reloader)))
        .await
        .map_err(|error| error.to_string())?;
    Ok(AppState {
        appearance: Appearance::current().await,
        launch: launch.clone(),
    })
}

pub fn register(window: SabineWindow, reloader: &Reloader) -> SabineWindow {
    window
        .with_async("app_state", reloader, app_state)
        .command("activation_targets", |activation: Activation| {
            Ok(Targets::from(&activation))
        })
        .with("open_file", reloader, open_file)
        .command("characters", |Empty {}| Ok(characters::all()))
        .command("input_sources", |Empty {}| sources::list())
}
