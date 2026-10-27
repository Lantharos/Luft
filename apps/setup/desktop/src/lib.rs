mod contract;
mod fingerprint;
mod hardware;
mod installer;
mod regional;
mod session;
mod trust;

use luft_app::{Appearance, Commands, Empty, Events};
use luft_i18n::{Localizer, localizer, t};
use luft_meet::{Handoff, Intent};
use sabine::{SabineLifecyclePolicy, SabineWindow, SingleInstancePolicy, WindowRegion};
use serde::Serialize;
use specta::Type;

const APP_ID: &str = "com.lantharos.setup";
const SIZE: (u32, u32) = (820, 600);
const RADIUS: i32 = 15;
const MEET_NOTES: &str = "/run/initramfs/live/meet.json";

pub static L10N: Localizer = localizer!("locales", ["desktop"]);

#[derive(Serialize, Type)]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    hardware: hardware::Hardware,
    meet: Option<Intent>,
}

fn meet_intent() -> Option<Intent> {
    let notes = std::fs::read_to_string(MEET_NOTES).ok()?;
    Handoff::parse(&notes).ok().map(|handoff| handoff.intent)
}

fn window(window: SabineWindow) -> SabineWindow {
    window
        .title(t!(L10N, "desktop-window-title"))
        .fixed_size(SIZE.0, SIZE.1)
        .frameless()
        .glass()
        .lifecycle_policy(SabineLifecyclePolicy::browser_tab())
        .blur_region(WindowRegion::adaptive_rounded_rect(RADIUS))
        .input_region(WindowRegion::adaptive_rounded_rect(RADIUS))
        .single_instance_id(APP_ID)
        .single_instance(SingleInstancePolicy::FocusExisting)
}

async fn app_state(Empty {}: Empty) -> Result<AppState, String> {
    Ok(AppState {
        appearance: Appearance::current().await,
        hardware: hardware::detect().await,
        meet: meet_intent(),
    })
}

fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = window.command_async("app_state", app_state);
    let window = luft_network::register(window, events);
    let window = fingerprint::register(window, events);
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
        installer::watch,
    )
}
