use std::io::Write;

use futures_util::StreamExt;
use luft_app::{Commands, Empty, Events};
use luft_handwriting::client::{self, Unread, Urgency};
use luft_handwriting::types::{HandwritingModel, Stroke};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;

pub const HANDWRITING_CHANGED: BridgeEvent<()> = BridgeEvent::new("handwriting.changed");

#[derive(Deserialize, Type)]
pub struct Line {
    strokes: Vec<Stroke>,
    now: bool,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase", tag = "kind", content = "text")]
pub enum Read {
    Text(String),
    NotInstalled,
    Paused,
    Missing,
}

async fn overview(Empty {}: Empty) -> Result<Option<HandwritingModel>, String> {
    Ok(client::overview().await.ok())
}

async fn install(Empty {}: Empty) -> Result<(), String> {
    client::install().await
}

async fn remove(Empty {}: Empty) -> Result<(), String> {
    client::remove().await
}

async fn read(Line { strokes, now }: Line) -> Result<Read, String> {
    let urgency = if now {
        Urgency::Waiting
    } else {
        Urgency::Background
    };
    match client::recognize(&strokes, urgency).await {
        Ok(text) => Ok(Read::Text(text)),
        Err(Unread::NotInstalled) => Ok(Read::NotInstalled),
        Err(Unread::Paused) => Ok(Read::Paused),
        Err(Unread::Failed(_)) if client::overview().await.is_err() => Ok(Read::Missing),
        Err(Unread::Failed(error)) => Err(error),
    }
}

#[derive(Deserialize, Type)]
pub struct Correction {
    line: String,
}

fn keep_correction(Correction { line }: Correction) -> Result<(), String> {
    let folder = dirs::data_dir()
        .ok_or("There's no folder for Heft's data")?
        .join("com.lantharos.Heft");
    std::fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(folder.join("corrections.jsonl"))
        .map_err(|error| error.to_string())?;
    writeln!(file, "{line}").map_err(|error| error.to_string())
}

pub async fn watch(events: Events) {
    let Ok(changes) = client::changes().await else {
        return;
    };
    let mut changes = std::pin::pin!(changes);
    while changes.next().await.is_some() {
        events.emit(HANDWRITING_CHANGED, ());
    }
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&HANDWRITING_CHANGED)
        .command_async("handwriting_overview", overview)
        .command_async("handwriting_install", install)
        .command_async("handwriting_remove", remove)
        .command_async("handwriting_read", read)
        .command("keep_correction", keep_correction)
}
