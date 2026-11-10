use std::env;

use luft_dbus_macros::introspect;
use tokio::process::Command;
use url::Url;
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::{Connection, interface};

use super::activation;
use super::launch_args::REVEAL;
use super::{install_dbus_service, serve_dbus};

const BUS_NAME: &str = "org.freedesktop.FileManager1";
const SERVICE_PATH: &str = "/org/freedesktop/FileManager1";

struct FileManager;

#[introspect]
#[interface(interface = "org.freedesktop.FileManager1")]
impl FileManager {
    async fn show_items(
        &self,
        uris: Vec<String>,
        startup_id: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) {
        let token = token(startup_id, connection, &header).await;
        open_in_rover(&uris, token.as_deref());
    }

    async fn show_folders(
        &self,
        uris: Vec<String>,
        startup_id: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) {
        let token = token(startup_id, connection, &header).await;
        open_in_rover(&uris, token.as_deref());
    }

    async fn show_item_properties(
        &self,
        uris: Vec<String>,
        startup_id: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) {
        let token = token(startup_id, connection, &header).await;
        open_in_rover(&uris, token.as_deref());
    }
}

async fn token(startup_id: String, connection: &Connection, header: &Header<'_>) -> Option<String> {
    if !startup_id.is_empty() {
        return Some(startup_id);
    }
    let sender = header.sender()?;
    let pid = DBusProxy::new(connection)
        .await
        .ok()?
        .get_connection_unix_process_id(sender.clone().into())
        .await
        .ok()?;
    activation::token_for(connection, pid).await
}

fn open_in_rover(uris: &[String], token: Option<&str>) {
    let paths: Vec<_> = uris
        .iter()
        .filter_map(|uri| Url::parse(uri).ok()?.to_file_path().ok())
        .collect();
    if paths.is_empty() {
        return;
    }
    let Some(exe) = env::args_os().next() else {
        return;
    };
    let mut command = Command::new(exe);
    command.arg(REVEAL).args(paths);
    if let Some(token) = token {
        command.env("XDG_ACTIVATION_TOKEN", token);
    }
    let _ = command.spawn();
}

pub fn run() -> Result<(), String> {
    serve_dbus(BUS_NAME, SERVICE_PATH, FileManager)
}

pub fn install() -> Result<(), String> {
    install_dbus_service(BUS_NAME, "--file-manager-bus")
}
