mod bridge;
mod drives;
mod events;
mod files;
mod integration;
mod settings;
mod state;
mod vcs;

use sabine::{
    SabineLifecyclePolicy, SabineWindow, SabineWindowControlAction, SingleInstancePolicy,
    WindowRegion, WindowRegionRect,
};
use state::RoverState;

pub use integration::file_manager_bus::{
    install as install_file_manager_bus, run as run_file_manager_bus,
};
pub use integration::portal::{install as install_file_chooser_portal, run as run_portal_backend};

const APP_NAME: &str = "Rover";
const APP_ID: &str = "dev.kristof.rover";
const WINDOW_WIDTH: u32 = 1200;
const WINDOW_HEIGHT: u32 = 800;
const MIN_WINDOW_WIDTH: u32 = 800;
const MIN_WINDOW_HEIGHT: u32 = 600;
const SIDEBAR_WIDTH: i32 = 260;
const WINDOW_RADIUS: i32 = 16;
const CONTROL_SIZE: i32 = 28;
const CONTROL_TOP: i32 = 12;
const CONTROL_OFFSETS: [(SabineWindowControlAction, i32); 3] = [
    (SabineWindowControlAction::Minimize, -108),
    (SabineWindowControlAction::Maximize, -76),
    (SabineWindowControlAction::Close, -44),
];

pub fn run_app() -> ! {
    let state = RoverState::new();
    let events = state.events.clone();
    SabineWindow::main_with_process(
        move |window| Ok(build_window(window, &state)),
        move |process| {
            if let Some(emitter) = process.bridge_event_emitter() {
                events.attach(emitter);
            }
            drives::watch_mounts(events);
        },
    )
}

fn build_window(window: SabineWindow, state: &RoverState) -> SabineWindow {
    let mut window = window
        .title(state.title())
        .size(WINDOW_WIDTH, WINDOW_HEIGHT)
        .min_size(MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT)
        .frameless()
        .glass()
        .lifecycle_policy(SabineLifecyclePolicy::browser_tab())
        .blur_region(WindowRegion::adaptive_rounded_left(
            SIDEBAR_WIDTH,
            WINDOW_RADIUS,
        ))
        .opaque_region(WindowRegion::adaptive_content_after_sidebar_rounded_right(
            SIDEBAR_WIDTH,
            0,
            WINDOW_RADIUS,
        ))
        .input_region(WindowRegion::adaptive_rounded_rect(WINDOW_RADIUS));

    for (action, offset) in CONTROL_OFFSETS {
        window = window.control_region(
            action,
            WindowRegionRect::new(offset, CONTROL_TOP, CONTROL_SIZE, CONTROL_SIZE),
        );
    }

    if state.chooser.is_none() {
        window = window
            .single_instance_id(APP_ID)
            .single_instance(SingleInstancePolicy::FocusExisting);
    }

    bridge::register(window, state)
}
