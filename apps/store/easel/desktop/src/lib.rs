mod bridge;
mod files;
mod format;
mod l10n;
mod picture;
mod state;

use luft_app::{Backdrop, GlassWindow};
use state::EaselState;

const WINDOW: GlassWindow = GlassWindow {
    title: "Easel",
    size: (1280, 820),
    min_size: (720, 480),
    sidebar_width: 64,
    single_instance: Some("com.lantharos.easel"),
    backdrop: Backdrop::WINDOW,
};

pub fn run_app() -> ! {
    let state = EaselState::new();
    luft_app::run(
        &state.events,
        |window| bridge::register(WINDOW.apply(window), &state),
        |_| {},
    )
}
