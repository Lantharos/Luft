use futures_util::{Stream, StreamExt};
use luft_dbus::{explain, objects, session};
use zbus::Proxy;
use zbus::proxy::{Builder, CacheProperties};

use crate::types::{HandwritingModel, Stroke};

pub const NAME: &str = "com.lantharos.Handwriting1";
pub const PATH: &str = "/com/lantharos/Handwriting1";
const MODELS: &str = "com.lantharos.Handwriting1.Models";

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

/// Why a line wasn't read.
#[derive(Debug)]
pub enum Unread {
    /// The model isn't downloaded.
    NotInstalled,
    /// The battery is low; try again later.
    Paused,
    Failed(String),
}

/// Whether someone waits for the line, or it can be read in the background.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Urgency {
    Waiting,
    Background,
}

/// Reads one line of handwriting, written stroke after stroke, as text.
pub async fn recognize(strokes: &[Stroke], urgency: Urgency) -> Result<String, Unread> {
    let proxy = proxy(NAME).await.map_err(Unread::Failed)?;
    let method = match urgency {
        Urgency::Waiting => "RecognizeNow",
        Urgency::Background => "Recognize",
    };
    proxy
        .call(method, &(strokes,))
        .await
        .map_err(|error| match &error {
            zbus::Error::MethodError(name, _, _) if name.ends_with(".NotInstalled") => {
                Unread::NotInstalled
            }
            zbus::Error::MethodError(name, _, _) if name.ends_with(".Paused") => Unread::Paused,
            _ => Unread::Failed(explain(&error)),
        })
}

pub async fn overview() -> Result<HandwritingModel, String> {
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
