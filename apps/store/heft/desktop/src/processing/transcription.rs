use luft_app::{Commands, Empty};
use luft_speech::client::{self, Untranscribed};
use luft_speech::types::{Engine, Model, Transcribed};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::library;

pub const SPEECH_CHANGED: BridgeEvent<()> = BridgeEvent::new("speech.changed");

#[derive(Deserialize, Type)]
pub struct Transcribe {
    path: String,
    from: u64,
    ended: bool,
    languages: Vec<String>,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase", tag = "kind", content = "transcribed")]
pub enum Transcription {
    Done(Transcribed),
    NotInstalled,
    Paused,
    Unsupported,
    Missing,
}

async fn whisper(Empty {}: Empty) -> Result<Option<Model>, String> {
    Ok(client::overview().await.ok().and_then(|overview| {
        overview
            .models
            .into_iter()
            .find(|model| model.engine == Engine::Whisper)
    }))
}

#[derive(Deserialize, Type)]
pub struct ModelId {
    id: String,
}

async fn install(ModelId { id }: ModelId) -> Result<(), String> {
    client::install(&id).await
}

async fn transcribe(request: Transcribe) -> Result<Transcription, String> {
    let audio = std::fs::File::open(library::resolve(&request.path)?).map_err(|error| error.to_string())?;
    match client::transcribe(audio, request.from, request.ended, &request.languages).await {
        Ok(transcribed) => Ok(Transcription::Done(transcribed)),
        Err(Untranscribed::NotInstalled(_)) => Ok(Transcription::NotInstalled),
        Err(Untranscribed::Paused) => Ok(Transcription::Paused),
        Err(Untranscribed::Unsupported) => Ok(Transcription::Unsupported),
        Err(Untranscribed::Failed(_)) if client::overview().await.is_err() => Ok(Transcription::Missing),
        Err(Untranscribed::Failed(error)) => Err(error),
    }
}

pub async fn watch(events: luft_app::Events) {
    use futures_util::StreamExt;
    let Ok(changes) = client::changes().await else {
        return;
    };
    let mut changes = std::pin::pin!(changes);
    while changes.next().await.is_some() {
        events.emit(SPEECH_CHANGED, ());
    }
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&SPEECH_CHANGED)
        .command_async("whisper_overview", whisper)
        .command_async("whisper_install", install)
        .command_async("transcribe", transcribe)
}
