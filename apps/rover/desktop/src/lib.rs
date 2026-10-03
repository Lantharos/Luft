mod archives;
mod bridge;
mod drives;
mod events;
mod files;
mod history;
mod inspect;
mod integration;
mod network;
mod places;
mod properties;
mod search;
mod settings;
mod state;
mod text;
mod vcs;

use luft_app::GlassWindow;
use sabine::SabineWindow;
use state::RoverState;

pub use integration::file_manager_bus::{
    install as install_file_manager_bus, run as run_file_manager_bus,
};
pub use integration::portal::{install as install_file_chooser_portal, run as run_portal_backend};

const APP_NAME: &str = "Rover";
const APP_ID: &str = "com.lantharos.rover";

pub fn run_app() -> ! {
    let state = RoverState::new();
    luft_app::run(
        &state.events,
        |window| build_window(window, &state),
        drives::watch_mounts,
    )
}

fn build_window(window: SabineWindow, state: &RoverState) -> SabineWindow {
    let title = state.title();
    let glass = GlassWindow {
        title: &title,
        size: (1200, 800),
        min_size: (800, 600),
        sidebar_width: 260,
        single_instance: state.chooser.is_none().then_some(APP_ID),
    };
    bridge::register(glass.apply(window), state)
}
