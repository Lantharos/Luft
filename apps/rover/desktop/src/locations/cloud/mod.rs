use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::{Once, OnceLock};

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
    gio::AppInfo::launch_default_for_uri(address, gio::AppLaunchContext::NONE).map_err(|error| error.to_string())
}

fn drives(events: &Events, _: Value) -> Result<Vec<Drive>, String> {
    let drives = client::drives()?;
    let events = events.clone();
    WATCH.call_once(|| {
        client::watch(move |signal| {
            if matches!(signal, Signal::Drives | Signal::Accounts) {
                events.emit(CHANGED, ());
            }
        })
    });
    Ok(drives)
}

fn states(Folder { path }: Folder) -> Result<BTreeMap<String, FileState>, String> {
    client::states(&path)
}

fn open_in_browser(Folder { path }: Folder) -> Result<(), String> {
    open(&client::web_address(&path)?)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with("cloud_drives", events, drives)
        .command("cloud_states", states)
        .command("cloud_keep", |Paths { paths }| client::keep(&paths))
        .command("cloud_free", |Paths { paths }| client::free(&paths))
        .command("cloud_share_link", |Folder { path }| client::share_link(&path))
        .command("cloud_open_in_browser", open_in_browser)
        .command("cloud_dismiss_conflict", |Conflict { account, copy }| {
            client::dismiss_conflict(&account, &copy)
        })
        .command("cloud_add_account", |_: Value| open(ADD_ACCOUNT))
}
