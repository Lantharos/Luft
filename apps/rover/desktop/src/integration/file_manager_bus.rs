use std::env;

use tokio::process::Command;
use url::Url;
use zbus::interface;

use super::{install_dbus_service, serve_dbus};

const BUS_NAME: &str = "org.freedesktop.FileManager1";
const SERVICE_PATH: &str = "/org/freedesktop/FileManager1";

struct FileManager;

#[interface(interface = "org.freedesktop.FileManager1")]
impl FileManager {
    async fn show_items(&self, uris: Vec<String>, startup_id: String) {
        open_in_rover(&uris, &startup_id);
    }

    async fn show_folders(&self, uris: Vec<String>, startup_id: String) {
        open_in_rover(&uris, &startup_id);
    }

    async fn show_item_properties(&self, uris: Vec<String>, startup_id: String) {
        open_in_rover(&uris, &startup_id);
    }
}

fn open_in_rover(uris: &[String], startup_id: &str) {
    let paths: Vec<_> = uris
        .iter()
        .filter_map(|uri| Url::parse(uri).ok()?.to_file_path().ok())
        .collect();
    if paths.is_empty() {
        return;
    }
    let Ok(exe) = env::current_exe() else {
        return;
    };
    let mut command = Command::new(exe);
    command.args(paths);
    if !startup_id.is_empty() {
        command.env("XDG_ACTIVATION_TOKEN", startup_id);
    }
    let _ = command.spawn();
}

pub fn run() -> Result<(), String> {
    serve_dbus(BUS_NAME, SERVICE_PATH, FileManager)
}

pub fn install() -> Result<(), String> {
    install_dbus_service(BUS_NAME, "--file-manager-bus")
}
