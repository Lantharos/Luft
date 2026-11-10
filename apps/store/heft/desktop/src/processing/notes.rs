use futures_util::StreamExt;
use luft_app::{Commands, Empty, Events};
use luft_language::client::{self, Unwritten};
use luft_language::types::{Heading, HeadingRequest, LanguageModel, Notes, NotesRequest};
use sabine::{BridgeEvent, SabineWindow};
use serde::Serialize;
use specta::Type;

pub const LANGUAGE_CHANGED: BridgeEvent<()> = BridgeEvent::new("language.changed");

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase", tag = "kind", content = "written")]
pub enum Written<T> {
    Done(T),
    NotInstalled,
    Paused,
    Missing,
}

async fn written<T>(result: Result<T, Unwritten>) -> Result<Written<T>, String> {
    match result {
        Ok(written) => Ok(Written::Done(written)),
        Err(Unwritten::NotInstalled) => Ok(Written::NotInstalled),
        Err(Unwritten::Paused) => Ok(Written::Paused),
        Err(Unwritten::Failed(_)) if client::overview().await.is_err() => Ok(Written::Missing),
        Err(Unwritten::Failed(error)) => Err(error),
    }
}

async fn overview(Empty {}: Empty) -> Result<Option<LanguageModel>, String> {
    Ok(client::overview().await.ok())
}

async fn notes(request: NotesRequest) -> Result<Written<Notes>, String> {
    written(client::notes(&request).await).await
}

async fn heading(request: HeadingRequest) -> Result<Written<Heading>, String> {
    written(client::heading(&request).await).await
}

pub async fn watch(events: Events) {
    let Ok(changes) = client::changes().await else {
        return;
    };
    let mut changes = std::pin::pin!(changes);
    while changes.next().await.is_some() {
        events.emit(LANGUAGE_CHANGED, ());
    }
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&LANGUAGE_CHANGED)
        .command_async("notes_overview", overview)
        .command_async("notes_install", |Empty {}| client::install())
        .command_async("notes_remove", |Empty {}| client::remove())
        .command_async("notes_write", notes)
        .command_async("notes_heading", heading)
}
