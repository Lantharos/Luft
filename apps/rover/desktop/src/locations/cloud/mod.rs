use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::pin::pin;
use std::sync::{Once, OnceLock};

use futures_util::StreamExt;
use luft_accounts::client::{self, Signal};
use luft_accounts::types::{Drive, FileState};
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

const CHANGED: &str = "rover.cloud";
const ADD_ACCOUNT: &str = "kestrel-settings:accounts/add";

static CLOUD_ROOT: OnceLock<PathBuf> = OnceLock::new();
static WATCH: Once = Once::new();

#[derive(Deserialize)]
struct Folder {
    path: String,
}

#[derive(Deserialize)]
struct Paths {
    paths: Vec<String>,
}

#[derive(Deserialize)]
struct Conflict {
    account: String,
    copy: String,
}

pub fn is_cloud(path: &str) -> bool {
    let root = CLOUD_ROOT.get_or_init(|| gio::glib::home_dir().join("Cloud"));
    Path::new(path).starts_with(root)
}

fn open(address: &str) -> Result<(), String> {
    gio::AppInfo::launch_default_for_uri(address, gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

async fn drives(events: Events, _: Value) -> Result<Vec<Drive>, String> {
    let drives = client::drives().await?;
    WATCH.call_once(|| {
        luft_app::spawn(watch(events));
    });
    Ok(drives)
}

async fn watch(events: Events) {
    let Ok(signals) = client::signals().await else {
        return;
    };
    let mut signals = pin!(signals);
    while let Some(signal) = signals.next().await {
        if matches!(signal, Signal::Drives | Signal::Accounts) {
            events.emit(CHANGED, ());
        }
    }
}

async fn states(Folder { path }: Folder) -> Result<BTreeMap<String, FileState>, String> {
    client::states(&path).await
}

async fn open_in_browser(Folder { path }: Folder) -> Result<(), String> {
    open(&client::web_address(&path).await?)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("cloud_drives", events, drives)
        .command_async("cloud_states", states)
        .command_async("cloud_keep", |Paths { paths }| async move {
            client::keep(&paths).await
        })
        .command_async("cloud_free", |Paths { paths }| async move {
            client::free(&paths).await
        })
        .command_async("cloud_share_link", |Folder { path }| async move {
            client::share_link(&path).await
        })
        .command_async("cloud_open_in_browser", open_in_browser)
        .command_async("cloud_dismiss_conflict", |Conflict { account, copy }| async move {
            client::dismiss_conflict(&account, &copy).await
        })
        .command("cloud_add_account", |_: Value| open(ADD_ACCOUNT))
}
