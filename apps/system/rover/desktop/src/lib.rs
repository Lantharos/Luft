mod app;
mod archives;
mod details;
mod files;
mod history;
mod integration;
mod locations;
mod search;

use app::events::CLOSE_ASKED;
use app::state::RoverState;
use luft_app::{Backdrop, GlassWindow};
use sabine::SabineWindow;

pub use integration::file_manager_bus::{
    install as install_file_manager_bus, run as run_file_manager_bus,
};
pub use integration::portal::{install as install_file_chooser_portal, run as run_portal_backend};

const APP_NAME: &str = "Rover";
const APP_ID: &str = "com.lantharos.rover";

pub fn run_app() -> ! {
    integration::activation::claim_before_threads();
    let state = RoverState::new();
    luft_app::run(
        &state.events,
        |window| {
            let working = state.clone();
            let window =
                glass_window(window, APP_NAME, Some(APP_ID)).on_close_requested(move |_| {
                    let busy = working.queue.is_busy();
                    if busy {
                        working.events.emit(CLOSE_ASKED, ());
                    }
                    !busy
                });
            app::bridge::register(window, &state)
        },
        locations::drives::watch_mounts,
    )
}

fn glass_window(window: SabineWindow, title: &str, single_instance: Option<&str>) -> SabineWindow {
    GlassWindow {
        title,
        size: (1200, 800),
        min_size: (800, 600),
        sidebar_width: 260,
        single_instance,
        backdrop: Backdrop::WINDOW,
    }
    .apply(window)
}
