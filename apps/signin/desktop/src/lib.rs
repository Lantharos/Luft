mod connectivity;
mod link;
mod profile;

use luft_app::{Activation, Appearance, Commands, Events, GlassWindow};
use sabine::SabineWindow;
use serde::Serialize;
use serde_json::Value;

use link::Target;

const APP_ID: &str = "com.lantharos.signin";
const WINDOW: GlassWindow = GlassWindow {
    title: "Network Sign-In",
    size: (980, 720),
    min_size: (520, 420),
    sidebar_width: 0,
    single_instance: Some(APP_ID),
};

#[derive(Serialize)]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    target: Option<Target>,
}

async fn app_state(_: Value) -> Result<AppState, String> {
    Ok(AppState {
        appearance: Appearance::current().await,
        target: link::verified(Activation::current_process().arguments()).await,
    })
}

async fn activation_target(activation: Activation) -> Result<Option<Target>, String> {
    Ok(link::verified(activation.arguments()).await)
}

pub fn run_app() -> ! {
    profile::forget(APP_ID);
    let events = Events::default();
    luft_app::run(
        &events,
        |window| register(WINDOW.apply(window), &events),
        connectivity::watch,
    )
}

fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .command_async("app_state", app_state)
        .command_async("activation_target", activation_target)
        .with_async("check_connectivity", events, connectivity::check)
}
