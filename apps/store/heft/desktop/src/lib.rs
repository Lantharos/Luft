mod bridge;
mod camera;
mod handwriting;
mod library;
mod state;

use luft_app::{Events, GlassWindow};

const WINDOW: GlassWindow = GlassWindow {
    title: "Heft",
    size: (1280, 820),
    min_size: (560, 480),
    sidebar_width: 280,
    single_instance: Some("com.lantharos.Heft"),
};

pub fn run_app() -> ! {
    let events = Events::default();
    luft_app::run(
        &events,
        |window| bridge::register(WINDOW.apply(window)),
        |events| {
            library::backups::start();
            luft_app::spawn(handwriting::watch(events));
        },
    )
}
