mod app;
mod catalog;
mod files;
mod library;
mod operations;
mod updates;

use luft_app::{Events, GlassWindow};
use sabine::SabineWindow;

use operations::Queue;

const GLASS_WINDOW: GlassWindow = GlassWindow {
    title: "Schelf",
    size: (1180, 780),
    min_size: (820, 560),
    sidebar_width: 280,
    single_instance: Some("com.lantharos.schelf"),
};

pub fn run_app() -> ! {
    let events = Events::default();
    let queue = Queue::start(events.clone());
    luft_app::run(&events, |window| build_window(window, &queue), |_| {})
}

fn build_window(window: SabineWindow, queue: &Queue) -> SabineWindow {
    let window = app::register(GLASS_WINDOW.apply(window));
    let window = catalog::register(window);
    let window = library::register(window);
    let window = files::register(window);
    let window = updates::register(window);
    operations::register(window, queue)
}
