mod connectivity;
mod profile;

use luft_app::{Appearance, Commands, Events, GlassWindow};
use sabine::SabineWindow;
use serde::Serialize;
use serde_json::Value;

const APP_ID: &str = "com.lantharos.signin";
const LINK_SCHEME: &str = "kestrel-signin:";
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
    link: Option<String>,
}

fn app_state(_: Value) -> Result<AppState, String> {
    Ok(AppState {
        appearance: Appearance::current(),
        link: std::env::args().find(|argument| argument.starts_with(LINK_SCHEME)),
    })
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
        .command("app_state", app_state)
        .with("check_connectivity", events, |events, _: Value| {
            connectivity::check(events);
            Ok(())
        })
}
