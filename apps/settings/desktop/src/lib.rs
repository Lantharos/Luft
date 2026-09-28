mod app;
mod gsettings;
mod panels;
mod portal;

use luft_app::{Events, GlassWindow};
use sabine::SabineWindow;

use gsettings::Watcher;

const GLASS_WINDOW: GlassWindow = GlassWindow {
    title: "Settings",
    size: (1040, 720),
    min_size: (760, 520),
    sidebar_width: 280,
    single_instance: Some("dev.lantharos.settings"),
};

pub fn run_app() -> ! {
    let events = Events::default();
    let watcher = Watcher::start();
    luft_app::run(
        &events,
        |window| build_window(window, &events, &watcher),
        |_| {},
    )
}

fn build_window(window: SabineWindow, events: &Events, watcher: &Watcher) -> SabineWindow {
    let window = app::register(GLASS_WINDOW.apply(window), events, watcher);
    panels::register(window, events)
}
