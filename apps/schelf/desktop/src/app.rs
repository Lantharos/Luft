use std::path::PathBuf;

use gio::prelude::*;
use luft_app::{Appearance, Commands, launch};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::fedora;

const PAGE_SCHEME: &str = "schelf:";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    files: Vec<String>,
    page: Option<String>,
    fedora: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Activation {
    arguments: Vec<String>,
    working_directory: Option<String>,
}

fn files(arguments: &[String], working_directory: Option<&str>) -> Vec<String> {
    let cwd = working_directory
        .map(PathBuf::from)
        .or_else(|| std::env::current_dir().ok())
        .unwrap_or_else(|| PathBuf::from("/"));
    arguments
        .iter()
        .filter(|argument| {
            !argument.is_empty() && !argument.starts_with('-') && !argument.starts_with(PAGE_SCHEME)
        })
        .filter_map(|argument| gio::File::for_commandline_arg_and_cwd(argument, &cwd).path())
        .filter(|path| path.is_file())
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

#[derive(Deserialize)]
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

async fn state(_: Value) -> Result<AppState, String> {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    Ok(AppState {
        appearance: Appearance::current().await,
        files: files(&arguments, None),
        page: arguments
            .into_iter()
            .find(|argument| argument.starts_with(PAGE_SCHEME)),
        fedora: fedora::available(),
    })
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("app_state", state)
        .command("app_activation_files", |activation: Activation| {
            Ok(files(
                &activation.arguments,
                activation.working_directory.as_deref(),
            ))
        })
        .command("app_open_url", open_url)
}
