mod app;
pub mod engine;
mod l10n;
mod queue;
pub mod worker;

use app::bridge::{self, AppContext};
use luft_app::{Backdrop, Events, GlassWindow};

const WINDOW: GlassWindow = GlassWindow {
    title: "Convertible",
    size: (1080, 740),
    min_size: (640, 480),
    sidebar_width: 280,
    single_instance: Some("com.lantharos.convertible"),
    backdrop: Backdrop::WINDOW,
};

pub fn run_app() -> ! {
    let events = Events::default();
    let context = AppContext::new(&events);
    luft_app::run(
        &events,
        |window| bridge::register(WINDOW.apply_with_page_close(window), &context),
        |_| {},
    )
}
