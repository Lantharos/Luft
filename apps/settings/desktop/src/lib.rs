mod app;
mod bridge;
mod dbus;
mod events;
mod gsettings;
mod kestrel;
mod panels;
mod portal;

use sabine::{
    SabineLifecyclePolicy, SabineWindow, SabineWindowControlAction, SingleInstancePolicy,
    WindowRegion, WindowRegionRect,
};

use events::Events;
use gsettings::Watcher;

const APP_ID: &str = "dev.lantharos.settings";
const WINDOW_WIDTH: u32 = 1040;
const WINDOW_HEIGHT: u32 = 720;
const MIN_WINDOW_WIDTH: u32 = 760;
const MIN_WINDOW_HEIGHT: u32 = 520;
const SIDEBAR_WIDTH: i32 = 280;
const WINDOW_RADIUS: i32 = 16;
const CONTROL_SIZE: i32 = 28;
const CONTROL_TOP: i32 = 12;
const CONTROL_OFFSETS: [(SabineWindowControlAction, i32); 3] = [
    (SabineWindowControlAction::Minimize, -108),
    (SabineWindowControlAction::Maximize, -76),
    (SabineWindowControlAction::Close, -44),
];

pub fn run_app() -> ! {
    let events = Events::default();
    let watcher = Watcher::start();
    let process_events = events.clone();
    SabineWindow::main_with_process(
        move |window| Ok(build_window(window, &events, &watcher)),
        move |process| {
            if let Some(emitter) = process.bridge_event_emitter() {
                process_events.attach(emitter);
            }
            kestrel::watch_accent(process_events);
        },
    )
}

fn build_window(window: SabineWindow, events: &Events, watcher: &Watcher) -> SabineWindow {
    let mut window = window
        .title("Settings")
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
        .input_region(WindowRegion::adaptive_rounded_rect(WINDOW_RADIUS))
        .single_instance_id(APP_ID)
        .single_instance(SingleInstancePolicy::FocusExisting);

    for (action, offset) in CONTROL_OFFSETS {
        window = window.control_region(
            action,
            WindowRegionRect::new(offset, CONTROL_TOP, CONTROL_SIZE, CONTROL_SIZE),
        );
    }

    let window = app::register(window, events, watcher);
    panels::register(window, events)
}
