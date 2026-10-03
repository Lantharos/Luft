mod app;
mod characters;
mod compose;
mod engine;
mod ibus;
mod layout;
mod method;
mod paths;
mod sources;

use luft_app::{Events, GlassWindow};
use sabine::SabineWindow;

const GLASS_WINDOW: GlassWindow = GlassWindow {
    title: "Keys",
    size: (1180, 780),
    min_size: (900, 600),
    sidebar_width: 260,
    single_instance: Some("com.lantharos.keys"),
};

pub fn run() {
    if std::env::args().any(|argument| argument == method::SERVE_FLAG) {
        if let Err(error) = ibus::serve() {
            eprintln!("Keys input methods stopped: {error}");
            std::process::exit(1);
        }
    } else {
        run_app();
    }
}

fn run_app() -> ! {
    let events = Events::default();
    luft_app::run(&events, build_window, |_| {})
}

fn build_window(window: SabineWindow) -> SabineWindow {
    let reloader = compose::Reloader::start();
    let window = app::register(GLASS_WINDOW.apply(window), &reloader);
    method::register(layout::register(window, &reloader))
}
