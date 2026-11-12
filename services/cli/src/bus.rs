//! The D-Bus side of luft. Nothing here runs unless a command needs the bus,
//! so commands that only read files start without a runtime or connection.

use std::collections::HashMap;
use std::future::Future;

use luft_dbus_macros::introspect;
use zbus::OwnedVariant;
use zbus::{Connection, proxy};

use crate::failure::{Failure, Outcome};

pub type Properties = HashMap<String, OwnedVariant>;

pub fn block_on<F: Future>(future: F) -> Outcome<F::Output> {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?;
    Ok(runtime.block_on(future))
}

pub async fn system() -> Outcome<&'static Connection> {
    luft_dbus::system().await.map_err(Failure::unavailable)
}

pub async fn session() -> Outcome<&'static Connection> {
    luft_dbus::session().await.map_err(Failure::unavailable)
}

#[introspect]
#[proxy(
    interface = "com.lantharos.Greeter1",
    default_service = "com.lantharos.Greeter1",
    default_path = "/com/lantharos/Greeter1"
)]
pub trait Greeter {
    #[zbus(property)]
    fn developer_tools(&self) -> zbus::Result<bool>;
}

#[introspect]
#[proxy(
    interface = "com.lantharos.Trust1",
    default_service = "com.lantharos.Trust1",
    default_path = "/com/lantharos/Trust1"
)]
pub trait Trust {
    #[zbus(property)]
    fn secure_boot(&self) -> zbus::Result<String>;

    #[zbus(property)]
    fn tpm(&self) -> zbus::Result<Properties>;

    #[zbus(property)]
    fn disk(&self) -> zbus::Result<Properties>;
}

#[introspect]
#[proxy(
    interface = "com.lantharos.Changes1",
    default_service = "com.lantharos.Changes1",
    default_path = "/com/lantharos/Changes1"
)]
pub trait Changes {
    fn read(&self, settings: &[&str]) -> zbus::Result<Vec<(String, OwnedVariant)>>;
}

pub fn get<T: TryFrom<OwnedVariant>>(properties: &Properties, key: &str) -> Option<T> {
    properties
        .get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| T::try_from(value).ok())
}

pub async fn developer_tools() -> Outcome<bool> {
    Ok(GreeterProxy::new(system().await?)
        .await?
        .developer_tools()
        .await?)
}

/// Refuses what only works while Developer tools is on.
pub async fn require_developer_tools() -> Outcome {
    if developer_tools().await? {
        return Ok(());
    }
    Err(Failure::unavailable(
        "Developer tools is off. Turn it on with luft developer on, or in Settings → Security.",
    ))
}
