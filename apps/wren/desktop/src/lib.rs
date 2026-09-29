mod bridge;
mod desktop;
mod events;
mod files;
mod launch;
mod state;
mod store;

use luft_app::GlassWindow;
use state::WrenState;

const GLASS_WINDOW: GlassWindow = GlassWindow {
    title: "Wren",
    size: (1180, 780),
    min_size: (640, 420),
    sidebar_width: 260,
    single_instance: Some("dev.lantharos.wren"),
};

pub fn run_app() -> ! {
    let state = WrenState::new();
    luft_app::run(
        &state.events,
        |window| bridge::register(GLASS_WINDOW.apply_with_page_close(window), &state),
        |_| {},
    )
}
