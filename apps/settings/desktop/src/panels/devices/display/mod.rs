mod apply;
mod brightness;
mod state;

use std::sync::Once;

use futures_util::StreamExt;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde_json::Value;

const DISPLAYS_CHANGED: &str = "display.changed";

static WATCH: Once = Once::new();

async fn watch(events: Events) {
    let Ok(proxy) = state::proxy().await else {
        return;
    };
    let Ok(mut changes) = proxy.receive_signal("MonitorsChanged").await else {
        return;
    };
    while changes.next().await.is_some() {
        brightness::monitors_changed();
        if let Ok(current) = state::current().await {
            events.emit(DISPLAYS_CHANGED, current);
        }
    }
}

async fn displays(events: Events, _: Value) -> Result<state::Displays, String> {
    WATCH.call_once(|| {
        luft_app::spawn(watch(events));
    });
    state::current().await
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("display_state", events, displays)
        .command_async("display_apply", apply::apply)
        .with_async("display_brightness", events, |events, _: Value| {
            brightness::current(events)
        })
        .with_async("display_set_brightness", events, brightness::set)
}
