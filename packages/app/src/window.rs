use sabine::{
    SabineLifecyclePolicy, SabineWindow, SabineWindowControlAction, SingleInstancePolicy,
    WindowRegion, WindowRegionRect,
};
use serde::Serialize;

use crate::events::Events;
use crate::kestrel::{self, Accent};

const WINDOW_RADIUS: i32 = 16;
const CONTROL_SIZE: i32 = 28;
const CONTROL_TOP: i32 = 12;
const CONTROL_OFFSETS: [(SabineWindowControlAction, i32); 3] = [
    (SabineWindowControlAction::Minimize, -108),
    (SabineWindowControlAction::Maximize, -76),
    (SabineWindowControlAction::Close, -44),
];

pub struct GlassWindow<'a> {
    pub title: &'a str,
    pub size: (u32, u32),
    pub min_size: (u32, u32),
    pub sidebar_width: i32,
    pub single_instance: Option<&'a str>,
}

impl GlassWindow<'_> {
    pub fn apply(&self, window: SabineWindow) -> SabineWindow {
        let mut window = window
            .title(self.title)
            .size(self.size.0, self.size.1)
            .min_size(self.min_size.0, self.min_size.1)
            .frameless()
            .glass()
            .lifecycle_policy(SabineLifecyclePolicy::browser_tab())
            .blur_region(WindowRegion::adaptive_rounded_left(
                self.sidebar_width,
                WINDOW_RADIUS,
            ))
            .opaque_region(WindowRegion::adaptive_content_after_sidebar_rounded_right(
                self.sidebar_width,
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

        match self.single_instance {
            Some(id) => window
                .single_instance_id(id)
                .single_instance(SingleInstancePolicy::FocusExisting),
            None => window,
        }
    }
}

#[derive(Serialize)]
pub struct Appearance {
    translucent: bool,
    accent: Option<Accent>,
}

impl Appearance {
    pub fn current() -> Self {
        Self {
            translucent: std::env::var_os("WAYLAND_DISPLAY").is_some(),
            accent: kestrel::accent(),
        }
    }
}

pub fn run(
    events: &Events,
    build: impl FnOnce(SabineWindow) -> SabineWindow,
    started: impl FnOnce(Events),
) -> ! {
    let events = events.clone();
    SabineWindow::main_with_process(
        move |window| Ok(build(window)),
        move |process| {
            if let Some(emitter) = process.bridge_event_emitter() {
                events.attach(emitter);
            }
            kestrel::watch_accent(events.clone());
            started(events);
        },
    )
}
