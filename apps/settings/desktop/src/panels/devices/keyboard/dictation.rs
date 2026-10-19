use std::pin::pin;
use std::sync::Once;

use futures_util::StreamExt;
use luft_app::{Commands, Events, launch};
use luft_speech::client;
use luft_speech::types::Overview;
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

const CHANGED: &str = "dictation.changed";

static WATCH: Once = Once::new();

#[derive(Deserialize)]
struct Target {
    model: String,
}

#[derive(Deserialize)]
struct Homepage {
    url: String,
    token: Option<String>,
}

fn open_homepage(Homepage { url, token }: Homepage) -> Result<(), String> {
    if !url.starts_with("https://") {
        return Err("That isn't a web address".to_owned());
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

async fn overview(events: Events, _: Value) -> Result<Overview, String> {
    let overview = client::overview().await?;
    WATCH.call_once(|| {
        luft_app::spawn(watch(events));
    });
    Ok(overview)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("dictation", events, overview)
        .command_async("dictation_install", |Target { model }| async move {
            client::install(&model).await
        })
        .command_async("dictation_cancel", |Target { model }| async move {
            client::cancel_install(&model).await
        })
        .command_async("dictation_remove", |Target { model }| async move {
            client::remove(&model).await
        })
        .command("dictation_open_homepage", open_homepage)
}
