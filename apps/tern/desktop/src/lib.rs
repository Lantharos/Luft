mod bridge;
mod desktop;
mod events;
mod launch;
mod pty;
mod settings;
mod shell;
mod state;

use luft_app::GlassWindow;
use sabine::{SabineLifecyclePolicy, SabineWindow, WindowRegion};
use state::TernState;

const APP_ID: &str = "com.lantharos.tern";
const WINDOW_RADIUS: i32 = 16;

pub fn run_app() -> ! {
    let state = TernState::new();
    let notifications = state.notifications.clone();
    luft_app::run(
        &state.events,
        |window| build_window(window, &state),
        move |events| notifications.watch(events),
    )
}

fn build_window(window: SabineWindow, state: &TernState) -> SabineWindow {
    let glass = GlassWindow {
        title: "Tern",
        size: (960, 620),
        min_size: (420, 260),
        sidebar_width: 0,
        single_instance: Some(APP_ID),
    };
    let window = glass
        .apply(window)
        .lifecycle_policy(SabineLifecyclePolicy::default());
    let window = if state.glass {
        window
            .blur_region(WindowRegion::adaptive_rounded_rect(WINDOW_RADIUS))
            .opaque_region(WindowRegion::empty())
    } else {
        window
    };
    bridge::register(window, state)
}
