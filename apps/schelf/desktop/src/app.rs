use std::path::PathBuf;

use gio::prelude::*;
use luft_app::{Appearance, Commands};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

const PAGE_SCHEME: &str = "schelf:";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    files: Vec<String>,
    page: Option<String>,
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
}

fn open_url(Link { url }: Link) -> Result<(), String> {
    if !url.starts_with("https://") && !url.starts_with("http://") {
        return Err("Only web links can be opened.".into());
    }
    gio::AppInfo::launch_default_for_uri(&url, gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("app_state", |_: Value| {
            let arguments: Vec<String> = std::env::args().skip(1).collect();
            Ok(AppState {
                appearance: Appearance::current(),
                files: files(&arguments, None),
                page: arguments
                    .into_iter()
                    .find(|argument| argument.starts_with(PAGE_SCHEME)),
            })
        })
        .command("app_activation_files", |activation: Activation| {
            Ok(files(
                &activation.arguments,
                activation.working_directory.as_deref(),
            ))
        })
        .command("app_open_url", open_url)
}
