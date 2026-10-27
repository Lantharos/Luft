mod apply;
mod brightness;
mod state;

use std::sync::Once;

use futures_util::StreamExt;
use luft_app::{Commands, Empty, Events};
use sabine::{BridgeEvent, SabineWindow};

const DISPLAYS_CHANGED: BridgeEvent<state::Displays> = BridgeEvent::new("display.changed");

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

async fn displays(events: Events, Empty {}: Empty) -> Result<state::Displays, String> {
    WATCH.call_once(|| {
        luft_app::spawn(watch(events));
    });
    state::current().await
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&DISPLAYS_CHANGED)
        .bridge_event(&brightness::BRIGHTNESS_CHANGED)
        .with_async("display_state", events, displays)
        .command_async("display_apply", apply::apply)
        .with_async("display_brightness", events, |events, Empty {}| {
            brightness::current(events)
        })
        .with_async("display_set_brightness", events, brightness::set)
}
