use sabine::{
    BackdropPreference, BackdropRole, SabineLifecyclePolicy, SabineWindow, SingleInstancePolicy,
    WindowInsets, WindowRegion,
};
use serde::Serialize;
use specta::Type;

use crate::bridge::events::Events;
use crate::desktop::palette::{self, Palette};
use crate::desktop::{
    self, corners::Corners, lines::Lines, motion::Motion, posture::Posture, typography::Typography,
};
use crate::probe::Probe;

// Kestrel rounds windows to 15px, so the blur and input regions follow it
const WINDOW_RADIUS: i32 = 15;
const SHEET_INSET: i32 = 8;
const SHEET_RADIUS: i32 = 9;

#[derive(Clone, Copy)]
pub struct Backdrop {
    pub role: BackdropRole,
    pub preference: BackdropPreference,
}

impl Backdrop {
    pub const WINDOW: Self = Self {
        role: BackdropRole::Window,
        preference: BackdropPreference::User,
    };
}

pub struct GlassWindow<'a> {
    pub title: &'a str,
    pub size: (u32, u32),
    pub min_size: (u32, u32),
    pub sidebar_width: i32,
    pub single_instance: Option<&'a str>,
    pub backdrop: Backdrop,
}

impl GlassWindow<'_> {
    pub fn apply(&self, window: SabineWindow) -> SabineWindow {
        let window = self.glass_regions(
            window
                .title(self.title)
                .size(self.size.0, self.size.1)
                .min_size(self.min_size.0, self.min_size.1)
                .frameless()
                .glass()
                .backdrop(self.backdrop.role, self.backdrop.preference)
                .lifecycle_policy(SabineLifecyclePolicy::browser_tab())
                .input_region(WindowRegion::rounded_rect(WINDOW_RADIUS)),
        );

        match self.single_instance {
            Some(id) => window
                .single_instance_id(id)
                .single_instance(SingleInstancePolicy::FocusExisting),
            None => window,
        }
    }

    fn glass_regions(&self, window: SabineWindow) -> SabineWindow {
        if self.sidebar_width == 0 {
            return window
                .blur_region(WindowRegion::empty())
                .opaque_region(WindowRegion::rounded_rect(WINDOW_RADIUS));
        }
        let sheet = WindowInsets::new(self.sidebar_width, SHEET_INSET, SHEET_INSET, SHEET_INSET);
        window
            .blur_region(WindowRegion::around_inset(
                WINDOW_RADIUS,
                sheet,
                SHEET_RADIUS,
            ))
            .opaque_region(WindowRegion::inset(sheet, SHEET_RADIUS))
    }
}

#[derive(Serialize, Type)]
pub struct Locale {
    languages: Vec<String>,
    formats: String,
    fixed: bool,
}

#[derive(Serialize, Type)]
pub struct Appearance {
    palette: Option<Palette>,
    typography: Typography,
    motion: Motion,
    corners: Corners,
    lines: Lines,
    posture: Posture,
    keyboard: bool,
    locale: Locale,
}

impl Appearance {
    pub async fn current() -> Self {
        Self {
            palette: palette::palette().await,
            typography: Typography::current().await,
            motion: Motion::current().await,
            corners: Corners::current().await,
            lines: Lines::current().await,
            posture: Posture::current().await,
            keyboard: desktop::keyboard::current().await,
            locale: Locale {
                languages: luft_i18n::requested(),
                formats: luft_i18n::formats(),
                fixed: luft_i18n::overridden(),
            },
        }
    }
}

pub fn run(
    events: &Events,
    build: impl FnOnce(SabineWindow) -> SabineWindow,
    started: impl FnOnce(Events),
) -> ! {
    luft_dbus::panics::report();
    let events = events.clone();
    let probe = Probe::from_environment();
    let declared = probe.clone();
    SabineWindow::main_with_process(
        move |window| {
            let window = desktop::declare_appearance(build(window));
            Ok(match &declared {
                Some(probe) => probe.declare(window),
                None => window,
            })
        },
        move |process| {
            events.attach(process.bridge_event_emitter());
            if let Some(probe) = probe {
                probe.serve(process.bridge_event_emitter());
            }
            crate::spawn(palette::watch_palette(events.clone()));
            crate::spawn(desktop::watch(events.clone()));
            started(events);
        },
    )
}
