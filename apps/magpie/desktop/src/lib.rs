mod app;
mod apps;
mod cache;
mod folder;
mod font;
mod launch;
mod media;
mod mpris;
mod photo;

use app::state::MagpieState;
use luft_app::GlassWindow;

const WINDOW: GlassWindow = GlassWindow {
    title: "Magpie",
    size: (1180, 780),
    min_size: (640, 460),
    sidebar_width: 280,
    single_instance: Some("com.lantharos.magpie"),
};

pub fn run_app() -> ! {
    let state = MagpieState::new();
    luft_app::run(
        &state.events,
        |window| app::bridge::register(WINDOW.apply(window), &state),
        |_| {},
    )
}
