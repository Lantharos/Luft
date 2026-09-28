mod apply;
mod state;

use std::sync::Once;

use sabine::SabineWindow;
use serde_json::Value;

use crate::bridge::Commands;
use crate::events::Events;

const DISPLAYS_CHANGED: &str = "display.changed";

static WATCH: Once = Once::new();

fn watch(events: &Events) {
    let events = events.clone();
    WATCH.call_once(|| {
        std::thread::spawn(move || {
            let Ok(proxy) = state::proxy() else {
                return;
            };
            let Ok(changes) = proxy.receive_signal("MonitorsChanged") else {
                return;
            };
            for _ in changes {
                if let Ok(current) = state::current() {
                    events.emit(DISPLAYS_CHANGED, current);
                }
            }
        });
    });
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_events("display_state", events, |events, _: Value| {
            watch(events);
            state::current()
        })
        .command("display_apply", apply::apply)
}
