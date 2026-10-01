mod app;
mod gsettings;
mod panels;

use luft_app::{Events, GlassWindow};
use sabine::SabineWindow;

use gsettings::Watcher;

const GLASS_WINDOW: GlassWindow = GlassWindow {
    title: "Settings",
    size: (1040, 720),
    min_size: (760, 520),
    sidebar_width: 280,
    single_instance: Some("com.lantharos.settings"),
};

pub fn run() {
    if std::env::args().any(|argument| argument == panels::CHECK_ARGUMENT) {
        panels::check_in_background();
    } else {
        run_app();
    }
}

fn run_app() -> ! {
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
