pub mod health;
pub mod snapshot;
mod system;
pub mod volumes;

use std::collections::HashMap;

use luft_dbus::objects::Objects;
use luft_dbus::{error_name, failed};
use zbus::wire::DynamicDeserialize;
use zbus::{DynamicType, OwnedObjectPath, Variant};

pub const SERVICE: &str = "org.freedesktop.UDisks2";
pub const ROOT: &str = "/org/freedesktop/UDisks2";
pub const MANAGER: &str = "/org/freedesktop/UDisks2/Manager";

pub const BLOCK: &str = "org.freedesktop.UDisks2.Block";
pub const DRIVE: &str = "org.freedesktop.UDisks2.Drive";
pub const ATA: &str = "org.freedesktop.UDisks2.Drive.Ata";
pub const NVME: &str = "org.freedesktop.UDisks2.NVMe.Controller";
pub const PARTITION: &str = "org.freedesktop.UDisks2.Partition";
pub const TABLE: &str = "org.freedesktop.UDisks2.PartitionTable";
pub const FILESYSTEM: &str = "org.freedesktop.UDisks2.Filesystem";
pub const ENCRYPTED: &str = "org.freedesktop.UDisks2.Encrypted";
pub const SWAP: &str = "org.freedesktop.UDisks2.Swapspace";
pub const LOOP: &str = "org.freedesktop.UDisks2.Loop";
pub const JOB: &str = "org.freedesktop.UDisks2.Job";
const MANAGER_INTERFACE: &str = "org.freedesktop.UDisks2.Manager";

pub const CANCELLED: &str = "cancelled";
const DISMISSED: &str = "org.freedesktop.UDisks2.Error.NotAuthorizedDismissed";

pub type Options<'a> = HashMap<&'static str, Variant<'a>>;

pub async fn objects() -> Result<Objects, String> {
    Objects::fetch(luft_dbus::system().await?, SERVICE, ROOT).await
}

pub async fn call<R>(
    path: &str,
    interface: &str,
    method: &str,
    body: &(impl serde::Serialize + DynamicType),
) -> Result<R, String>
where
    R: for<'a> DynamicDeserialize<'a>,
{
    let reply = luft_dbus::system()
        .await?
        .call_method(Some(SERVICE), path, Some(interface), method, body)
        .await
        .map_err(|error| explain(&error))?;
    reply.body().deserialize::<R>().map_err(failed)
}

pub async fn run(
    path: &str,
    interface: &str,
    method: &str,
    body: &(impl serde::Serialize + DynamicType),
) -> Result<(), String> {
    call::<()>(path, interface, method, body).await
}

pub async fn created(
    path: &str,
    interface: &str,
    method: &str,
    body: &(impl serde::Serialize + DynamicType),
) -> Result<String, String> {
    call::<OwnedObjectPath>(path, interface, method, body)
        .await
        .map(|path| path.to_string())
}

pub async fn manager<R>(
    method: &str,
    body: &(impl serde::Serialize + DynamicType),
) -> Result<R, String>
where
    R: for<'a> DynamicDeserialize<'a>,
{
    call(MANAGER, MANAGER_INTERFACE, method, body).await
}

pub fn no_options() -> Options<'static> {
    HashMap::new()
}

fn explain(error: &zbus::Error) -> String {
    if error_name(error).as_deref() == Some(DISMISSED) {
        return CANCELLED.to_owned();
    }
    luft_dbus::explain(error)
}

pub fn bytes_text(bytes: Vec<u8>) -> String {
    let end = bytes
        .iter()
        .position(|byte| *byte == 0)
        .unwrap_or(bytes.len());
    String::from_utf8_lossy(&bytes[..end]).into_owned()
}

pub fn text_bytes(text: &str) -> Vec<u8> {
    let mut bytes = text.as_bytes().to_vec();
    bytes.push(0);
    bytes
}
