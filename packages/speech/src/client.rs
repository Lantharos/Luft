use futures_util::{Stream, StreamExt};
use luft_dbus::{explain, objects, session};
use serde::de::DeserializeOwned;
use zbus::proxy::{Builder, CacheProperties};
use zbus::{DynamicType, Proxy};

use crate::types::Overview;

pub const NAME: &str = "com.lantharos.Speech1";
pub const PATH: &str = "/com/lantharos/Speech1";
const MODELS: &str = "com.lantharos.Speech1.Models";

async fn proxy() -> Result<Proxy<'static>, String> {
    Builder::new(session().await?)
        .destination(NAME)
        .path(PATH)
        .interface(MODELS)
        .cache_properties(CacheProperties::No)
        .build()
        .await
        .map_err(|error| explain(&error))
}

async fn call<B>(method: &str, body: &B) -> Result<(), String>
where
    B: serde::Serialize + DynamicType,
{
    proxy()
        .await?
        .call_method(method, body)
        .await
        .map(drop)
        .map_err(|error| explain(&error))
}

async fn call_json<R: DeserializeOwned>(method: &str) -> Result<R, String> {
    let text: String = proxy()
        .await?
        .call(method, &())
        .await
        .map_err(|error| explain(&error))?;
    serde_json::from_str(&text).map_err(|error| error.to_string())
}

pub async fn overview() -> Result<Overview, String> {
    call_json("Overview").await
}

pub async fn install(model: &str) -> Result<(), String> {
    call("Install", &(model,)).await
}

pub async fn cancel_install(model: &str) -> Result<(), String> {
    call("CancelInstall", &(model,)).await
}

pub async fn remove(model: &str) -> Result<(), String> {
    call("Remove", &(model,)).await
}

/// Fires whenever the models, their downloads or the chosen language change.
/// Ends when the session bus goes.
pub async fn changes() -> Result<impl Stream<Item = ()>, String> {
    let messages = objects::signals(session().await?, NAME, PATH).await?;
    Ok(messages.filter_map(|message| async move {
        let message = message.ok()?;
        let header = message.header();
        (header.member().map(|member| member.as_str()) == Some("Changed")).then_some(())
    }))
}
