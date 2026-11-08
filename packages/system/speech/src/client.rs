use futures_util::{Stream, StreamExt};
use luft_dbus::{explain, objects, session};
use serde::de::DeserializeOwned;
use zbus::proxy::{Builder, CacheProperties};
use zbus::{DynamicType, Proxy};

use crate::types::{Overview, Transcribed};

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

const TRANSCRIPTION: &str = "com.lantharos.Transcription1";
const TRANSCRIPTION_PATH: &str = "/com/lantharos/Transcription1";

/// Why part of a recording wasn't transcribed.
#[derive(Debug)]
pub enum Untranscribed {
    /// Whisper isn't downloaded; names the model to download.
    NotInstalled(String),
    /// The battery is low; try again later.
    Paused,
    /// This computer's processor can't run Whisper.
    Unsupported,
    Failed(String),
}

/// Transcribes about two minutes of an Ogg Opus recording from `from`
/// milliseconds, at the lowest priority. `ended` says the recording won't
/// grow any more; `languages` are the ones to choose from, such as `sr-Latn`.
pub async fn transcribe(
    audio: std::fs::File,
    from: u64,
    ended: bool,
    languages: &[String],
) -> Result<Transcribed, Untranscribed> {
    let proxy: Proxy = Builder::new(session().await.map_err(Untranscribed::Failed)?)
        .destination(TRANSCRIPTION)
        .path(TRANSCRIPTION_PATH)
        .interface(TRANSCRIPTION)
        .cache_properties(CacheProperties::No)
        .build()
        .await
        .map_err(|error| Untranscribed::Failed(explain(&error)))?;
    let audio = zbus::Fd::from(std::os::fd::OwnedFd::from(audio));
    let reply: String = proxy
        .call("Transcribe", &(audio, from, ended, languages))
        .await
        .map_err(|error| match &error {
            zbus::Error::MethodError(name, message, _) if name.ends_with(".NotInstalled") => {
                Untranscribed::NotInstalled(message.clone().unwrap_or_default())
            }
            zbus::Error::MethodError(name, _, _) if name.ends_with(".Paused") => {
                Untranscribed::Paused
            }
            zbus::Error::MethodError(name, _, _) if name.ends_with(".Unsupported") => {
                Untranscribed::Unsupported
            }
            _ => Untranscribed::Failed(explain(&error)),
        })?;
    serde_json::from_str(&reply).map_err(|error| Untranscribed::Failed(error.to_string()))
}
