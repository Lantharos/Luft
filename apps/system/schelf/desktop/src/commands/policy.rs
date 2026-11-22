use luft_app::{Commands, Empty, Events};
use luft_policy::{Follow, Policy};
use sabine::{BridgeEvent, SabineWindow};
use schelf_core::operations::Job;
use serde::Deserialize;
use specta::Type;

const POLICY: BridgeEvent<Policy> = BridgeEvent::new("schelf.policy");

#[derive(Deserialize, Type)]
struct Allows {
    job: Job,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&POLICY)
        .command("policy", |Empty {}| Ok::<_, String>(Policy::load()))
        .command("policy_allows", |Allows { job }| {
            Ok::<_, String>(job.allowed_by(&Policy::load()))
        })
}

/// Tells the pages each time the policy changes, so what it keeps from being installed shows as
/// locked at once.
pub async fn follow(events: Events) {
    if let Err(error) = announce(&events).await {
        eprintln!("Schelf stopped following the policy: {error}");
    }
}

async fn announce(events: &Events) -> std::io::Result<()> {
    let mut policy = Follow::start()?;
    loop {
        events.emit(POLICY, policy.changed().await?.clone());
    }
}
