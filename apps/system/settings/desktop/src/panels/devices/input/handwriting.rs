use std::pin::pin;
use std::sync::Once;

use futures_util::StreamExt;
use luft_app::{Commands, Empty, Events};
use luft_handwriting::client;
use luft_handwriting::types::HandwritingModel;
use sabine::{BridgeEvent, SabineWindow};

const CHANGED: BridgeEvent<HandwritingModel> = BridgeEvent::new("handwriting.changed");

static WATCH: Once = Once::new();

async fn watch(events: Events) {
    let Ok(changes) = client::changes().await else {
        return;
    };
    let mut changes = pin!(changes);
    while changes.next().await.is_some() {
        if let Ok(model) = client::overview().await {
            events.emit(CHANGED, model);
        }
    }
}

async fn model(events: Events, Empty {}: Empty) -> Result<HandwritingModel, String> {
    let model = client::overview().await?;
    WATCH.call_once(|| {
        luft_app::spawn(watch(events));
    });
    Ok(model)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .with_async("handwriting", events, model)
        .command_async("handwriting_remove", |Empty {}| client::remove())
}
