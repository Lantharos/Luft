use std::sync::Once;

use luft_app::{Commands, Empty, Events};
use luft_policy::{Follow, Policy};
use sabine::{BridgeEvent, SabineWindow};

const POLICY_CHANGED: BridgeEvent<Policy> = BridgeEvent::new("policy.changed");

static WATCH: Once = Once::new();

async fn follow(events: Events) {
    if let Err(error) = announce(&events).await {
        eprintln!("Settings stopped following the policy: {error}");
    }
}

async fn announce(events: &Events) -> std::io::Result<()> {
    let mut policy = Follow::start()?;
    loop {
        events.emit(POLICY_CHANGED, policy.changed().await?.clone());
    }
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&POLICY_CHANGED)
        .with("policy", events, |events, Empty {}| {
            WATCH.call_once(|| {
                luft_app::spawn(follow(events.clone()));
            });
            Ok::<_, String>(Policy::load())
        })
}
