mod apps;
mod bridge;
mod cache;
mod events;
mod folder;
mod launch;
mod media;
mod mpris;
mod photo;
mod state;

use luft_app::GlassWindow;
use state::MagpieState;

const WINDOW: GlassWindow = GlassWindow {
    title: "Magpie",
    size: (1180, 780),
    min_size: (640, 460),
    sidebar_width: 280,
    single_instance: Some("dev.lantharos.magpie"),
};

pub fn run_app() -> ! {
    let state = MagpieState::new();
    luft_app::run(
        &state.events,
        |window| bridge::register(WINDOW.apply(window), &state),
        |_| {},
    )
}
