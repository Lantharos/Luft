mod bridge;
mod desktop;
mod events;
mod l10n;
mod launch;
mod pty;
mod settings;
mod shell;
mod state;

use l10n::L10N;
use luft_app::{Backdrop, GlassWindow};
use luft_i18n::t;
use sabine::{SabineWindow, WindowRegion};
use state::State;

const APP_ID: &str = "com.lantharos.terminal";
const WINDOW_RADIUS: i32 = 15;

pub fn run_app() -> ! {
    let state = State::new();
    luft_app::run(&state.events, |window| build_window(window, &state), |_| {})
}

fn build_window(window: SabineWindow, state: &State) -> SabineWindow {
    let title = t!(L10N, "terminal-desktop-app-name");
    let glass = GlassWindow {
        title: &title,
        size: (960, 620),
        min_size: (420, 260),
        sidebar_width: 0,
        single_instance: Some(APP_ID),
        backdrop: Backdrop::WINDOW,
    };
    let window = glass.apply(window);
    let window = if state.glass {
        window
            .blur_region(WindowRegion::rounded_rect(WINDOW_RADIUS))
            .opaque_region(WindowRegion::empty())
    } else {
        window
    };
    bridge::register(window, state)
}
