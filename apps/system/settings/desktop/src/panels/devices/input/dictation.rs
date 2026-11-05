use std::pin::pin;
use std::sync::Once;

use futures_util::StreamExt;
use luft_app::{Commands, Empty, Events, launch};
use luft_i18n::t;
use luft_speech::client;
use luft_speech::types::Overview;
use sabine::{BridgeEvent, SabineWindow};
use serde::Deserialize;
use specta::Type;

use crate::L10N;

const CHANGED: BridgeEvent<Overview> = BridgeEvent::new("dictation.changed");

static WATCH: Once = Once::new();

#[derive(Deserialize, Type)]
struct DictationModel {
    model: String,
}

#[derive(Deserialize, Type)]
struct Homepage {
    url: String,
    token: Option<String>,
}

fn open_homepage(Homepage { url, token }: Homepage) -> Result<(), String> {
    if !url.starts_with("https://") {
        return Err(t!(L10N, "desktop-dictation-not-web-address"));
    }
    launch::open(&url, token.as_deref()).map_err(|error| error.to_string())
}

async fn watch(events: Events) {
    let Ok(changes) = client::changes().await else {
        return;
    };
    let mut changes = pin!(changes);
    while changes.next().await.is_some() {
        if let Ok(overview) = client::overview().await {
            events.emit(CHANGED, overview);
        }
    }
}

async fn overview(events: Events, Empty {}: Empty) -> Result<Overview, String> {
    let overview = client::overview().await?;
    WATCH.call_once(|| {
        luft_app::spawn(watch(events));
    });
    Ok(overview)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .with_async("dictation", events, overview)
        .command_async("dictation_install", |DictationModel { model }| async move {
            client::install(&model).await
        })
        .command_async("dictation_cancel", |DictationModel { model }| async move {
            client::cancel_install(&model).await
        })
        .command_async("dictation_remove", |DictationModel { model }| async move {
            client::remove(&model).await
        })
        .command("dictation_open_homepage", open_homepage)
}
