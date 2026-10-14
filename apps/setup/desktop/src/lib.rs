mod hardware;
mod installer;
mod regional;
mod session;
mod trust;

use luft_app::{Appearance, Commands, Events};
use sabine::{SabineLifecyclePolicy, SabineWindow, SingleInstancePolicy, WindowRegion};
use serde::Serialize;
use serde_json::Value;

const APP_ID: &str = "com.lantharos.setup";
const SIZE: (u32, u32) = (820, 600);
const RADIUS: i32 = 22;

#[derive(Serialize)]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    hardware: hardware::Hardware,
}

fn window(window: SabineWindow) -> SabineWindow {
    window
        .title("Set up Luft")
        .fixed_size(SIZE.0, SIZE.1)
        .frameless()
        .glass()
        .lifecycle_policy(SabineLifecyclePolicy::browser_tab())
        .blur_region(WindowRegion::adaptive_rounded_rect(RADIUS))
        .input_region(WindowRegion::adaptive_rounded_rect(RADIUS))
        .single_instance_id(APP_ID)
        .single_instance(SingleInstancePolicy::FocusExisting)
}

fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = window.command("app_state", |_: Value| {
        Ok(AppState {
            appearance: Appearance::current(),
            hardware: hardware::detect(),
        })
    });
    let window = luft_network::register(window, events);
    let window = luft_fingerprint::register(window, events);
    let window = installer::register(window);
    let window = trust::register(window);
    let window = regional::register(window);
    session::register(window)
}

pub fn run() -> ! {
    let events = Events::default();
    luft_app::run(
        &events,
        |built| register(window(built), &events),
        |events| installer::watch(&events),
    )
}
