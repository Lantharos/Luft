mod app;
mod gsettings;
mod panels;
mod parse;

use luft_app::{Events, GlassWindow};
use luft_i18n::{Localizer, localizer, t};
use sabine::SabineWindow;

use gsettings::Watcher;

pub static L10N: Localizer = localizer!("locales", ["desktop"]);

pub fn run() {
    let given = |wanted: &str| std::env::args().any(|argument| argument == wanted);
    if given(panels::CHECK_ARGUMENT) {
        panels::check_in_background();
    } else if given(panels::CHECK_GRAPHICS_ARGUMENT) {
        panels::check_graphics();
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
    let title = t!(L10N, "desktop-app-name");
    let glass = GlassWindow {
        title: &title,
        size: (1040, 720),
        min_size: (760, 520),
        sidebar_width: 280,
        single_instance: Some("com.lantharos.settings"),
    };
    let window = app::register(glass.apply(window), events, watcher);
    panels::register(window, events)
}
