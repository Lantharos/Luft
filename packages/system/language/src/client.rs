use futures_util::{Stream, StreamExt};
use luft_dbus::{explain, objects, session};
use serde::Serialize;
use serde::de::DeserializeOwned;
use zbus::Proxy;
use zbus::proxy::{Builder, CacheProperties};

use crate::types::{Heading, HeadingRequest, LanguageModel, Notes, NotesRequest};

pub const NAME: &str = "com.lantharos.Language1";
pub const PATH: &str = "/com/lantharos/Language1";
const MODELS: &str = "com.lantharos.Language1.Models";

async fn proxy(interface: &'static str) -> Result<Proxy<'static>, String> {
    Builder::new(session().await?)
        .destination(NAME)
        .path(PATH)
        .interface(interface)
        .cache_properties(CacheProperties::No)
        .build()
        .await
        .map_err(|error| explain(&error))
}

/// Why something wasn't written.
#[derive(Debug)]
pub enum Unwritten {
    /// The model isn't downloaded.
    NotInstalled,
    /// The battery is low; try again later.
    Paused,
    Failed(String),
}

async fn ask<R: DeserializeOwned>(method: &str, request: &impl Serialize) -> Result<R, Unwritten> {
    let request =
        serde_json::to_string(request).map_err(|error| Unwritten::Failed(error.to_string()))?;
    let proxy = proxy(NAME).await.map_err(Unwritten::Failed)?;
    let reply: String = proxy
        .call(method, &(request,))
        .await
        .map_err(|error| match &error {
            zbus::Error::MethodError(name, _, _) if name.ends_with(".NotInstalled") => {
                Unwritten::NotInstalled
            }
            zbus::Error::MethodError(name, _, _) if name.ends_with(".Paused") => Unwritten::Paused,
            _ => Unwritten::Failed(explain(&error)),
        })?;
    serde_json::from_str(&reply).map_err(|error| Unwritten::Failed(error.to_string()))
}

/// Notes of part of a class, which can take minutes to write.
pub async fn notes(request: &NotesRequest) -> Result<Notes, Unwritten> {
    ask("Notes", request).await
}

/// A title and a summary for a whole class, from its key points.
pub async fn heading(request: &HeadingRequest) -> Result<Heading, Unwritten> {
    ask("Heading", request).await
}

pub async fn overview() -> Result<LanguageModel, String> {
    let text: String = proxy(MODELS)
        .await?
        .call("Overview", &())
        .await
        .map_err(|error| explain(&error))?;
    serde_json::from_str(&text).map_err(|error| error.to_string())
}

pub async fn install() -> Result<(), String> {
    call("Install").await
}

pub async fn remove() -> Result<(), String> {
    call("Remove").await
}

async fn call(method: &str) -> Result<(), String> {
    proxy(MODELS)
        .await?
        .call_method(method, &())
        .await
        .map(drop)
        .map_err(|error| explain(&error))
}

/// Fires whenever the model or its download changes. Ends when the session bus goes.
pub async fn changes() -> Result<impl Stream<Item = ()>, String> {
    let messages = objects::signals(session().await?, NAME, PATH).await?;
    Ok(messages.filter_map(|message| async move {
        let message = message.ok()?;
        let header = message.header();
        (header.member().map(|member| member.as_str()) == Some("Changed")).then_some(())
    }))
}
