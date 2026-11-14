mod bridge;
mod camera;
mod document;
mod export;
mod imaging;
mod scanners;
mod settings;
mod state;

use std::sync::LazyLock;

use luft_app::{Backdrop, Events, GlassWindow};
use sabine::SabineWindow;

pub use scanners::sane::{SANE_HELPER, run_helper as run_sane_helper};

pub const APP_ID: &str = "com.lantharos.flatbed";

const WINDOW: GlassWindow = GlassWindow {
    title: "Flatbed",
    size: (1180, 780),
    min_size: (720, 520),
    sidebar_width: 280,
    single_instance: Some(APP_ID),
    backdrop: Backdrop::WINDOW,
};

pub static EVENTS: LazyLock<Events> = LazyLock::new(Events::default);

fn window(window: SabineWindow) -> SabineWindow {
    bridge::register(WINDOW.apply(window))
}

pub fn run_app() -> ! {
    luft_app::run(&EVENTS, window, |_| {
        document::restore();
        scanners::start();
    })
}
