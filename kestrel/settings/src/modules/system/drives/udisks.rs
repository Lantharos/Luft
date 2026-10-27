use std::collections::HashMap;

use luft_dbus::objects::Object;
use zbus::proxy::CacheProperties;
use zbus::{Connection, Variant, proxy};

pub const SERVICE: &str = "org.freedesktop.UDisks2";
pub const ROOT: &str = "/org/freedesktop/UDisks2";
pub const BLOCK: &str = "org.freedesktop.UDisks2.Block";
pub const DRIVE: &str = "org.freedesktop.UDisks2.Drive";
pub const FILESYSTEM: &str = "org.freedesktop.UDisks2.Filesystem";
pub const PARTITION: &str = "org.freedesktop.UDisks2.Partition";

#[proxy(
    interface = "org.freedesktop.UDisks2.Filesystem",
    default_service = "org.freedesktop.UDisks2"
)]
trait Filesystem {
    fn mount(&self, options: HashMap<&str, Variant<'_>>) -> zbus::Result<String>;
    fn unmount(&self, options: HashMap<&str, Variant<'_>>) -> zbus::Result<()>;
}

pub fn text(object: &Object, name: &str) -> String {
    object.get::<String>(name).unwrap_or_default()
}

fn quietly<'a>() -> HashMap<&'static str, Variant<'a>> {
    HashMap::from([("auth.no_user_interaction", Variant::from(true))])
}

async fn filesystem<'a>(
    system: &'a Connection,
    block: &'a str,
) -> zbus::Result<FilesystemProxy<'a>> {
    FilesystemProxy::builder(system)
        .path(block)
        .cache_properties(CacheProperties::No)
        .build()
        .await
}

pub async fn mount(system: &Connection, block: &str, options: &str) -> zbus::Result<String> {
    let mut chosen = quietly();
    if !options.is_empty() {
        chosen.insert("options", Variant::from(options));
    }
    filesystem(system, block).await?.mount(chosen).await
}

pub async fn unmount(system: &Connection, block: &str) -> zbus::Result<()> {
    filesystem(system, block).await?.unmount(quietly()).await
}
