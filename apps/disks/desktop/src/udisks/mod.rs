pub mod health;
pub mod snapshot;
mod system;
pub mod volumes;
pub mod watch;

use std::collections::HashMap;

use luft_app::dbus;
use luft_app::dbus::objects::{Objects, failed};
use zbus::zvariant::{DynamicDeserialize, DynamicType, OwnedObjectPath, Value};

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

pub type Options<'a> = HashMap<&'static str, Value<'a>>;

pub fn objects() -> Result<Objects, String> {
    Objects::fetch(dbus::system()?, SERVICE, ROOT)
}

pub fn call<R>(
    path: &str,
    interface: &str,
    method: &str,
    body: &(impl serde::Serialize + DynamicType),
) -> Result<R, String>
where
    R: for<'a> DynamicDeserialize<'a>,
{
    let reply = dbus::system()?
        .call_method(Some(SERVICE), path, Some(interface), method, body)
        .map_err(explain)?;
    reply.body().deserialize::<R>().map_err(failed)
}

pub fn run(
    path: &str,
    interface: &str,
    method: &str,
    body: &(impl serde::Serialize + DynamicType),
) -> Result<(), String> {
    call::<()>(path, interface, method, body)
}

pub fn created(
    path: &str,
    interface: &str,
    method: &str,
    body: &(impl serde::Serialize + DynamicType),
) -> Result<String, String> {
    call::<OwnedObjectPath>(path, interface, method, body).map(|path| path.to_string())
}

pub fn manager<R>(method: &str, body: &(impl serde::Serialize + DynamicType)) -> Result<R, String>
where
    R: for<'a> DynamicDeserialize<'a>,
{
    call(MANAGER, MANAGER_INTERFACE, method, body)
}

pub fn no_options() -> Options<'static> {
    HashMap::new()
}

fn explain(error: zbus::Error) -> String {
    match &error {
        zbus::Error::MethodError(name, _, _) if name.as_str() == DISMISSED => CANCELLED.to_owned(),
        zbus::Error::MethodError(_, Some(message), _) => message.clone(),
        _ => error.to_string(),
    }
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
