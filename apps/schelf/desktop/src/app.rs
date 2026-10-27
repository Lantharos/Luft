use luft_app::{Activation, Appearance, Commands, Empty, launch};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::fedora;

const PAGE_SCHEME: &str = "schelf:";

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    files: Vec<String>,
    page: Option<String>,
    fedora: bool,
}

fn files(activation: &Activation) -> Vec<String> {
    activation
        .paths()
        .filter(|path| path.is_file())
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

#[derive(Deserialize, Type)]
struct Link {
    url: String,
    token: Option<String>,
}

fn open_url(Link { url, token }: Link) -> Result<(), String> {
    if !url.starts_with("https://") && !url.starts_with("http://") {
        return Err("Only web links can be opened.".into());
    }
    launch::open(&url, token.as_deref()).map_err(|error| error.to_string())
}

async fn state(Empty {}: Empty) -> Result<AppState, String> {
    let activation = Activation::current_process();
    Ok(AppState {
        appearance: Appearance::current().await,
        files: files(&activation),
        page: activation
            .arguments()
            .iter()
            .find(|argument| argument.starts_with(PAGE_SCHEME))
            .cloned(),
        fedora: fedora::available(),
    })
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("app_state", state)
        .command("app_activation_files", |activation: Activation| {
            Ok(files(&activation))
        })
        .command("app_open_url", open_url)
}
