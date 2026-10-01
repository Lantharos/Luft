use std::sync::Arc;

use sushi::display::{Display, ModeHints};
use sushi::render::Logo;
use sushi::scene::FirmwareLogo;
use sushi::scene::tiny_skia::Pixmap;

/// What the firmware left on screen: its logo, the framebuffer it handed over, and the monitor that shows it.
pub struct Firmware {
    logo: Option<Logo>,
    framebuffer: (u32, u32),
    monitor: Option<(u32, u32)>,
}

fn native_size(display: &Display) -> (u32, u32) {
    display
        .card()
        .monitor()
        .map_or(display.sizes()[0], |monitor| monitor.native)
}

impl Firmware {
    pub fn left_on(display: &Display, logo: Option<Logo>, hints: &ModeHints) -> Self {
        let monitor = display
            .card()
            .monitor()
            .map(|monitor| monitor.native)
            .or_else(|| hints.only_size());
        Self {
            logo,
            framebuffer: display.sizes()[0],
            monitor,
        }
    }

    pub fn logo_on(&self, display: &Display) -> Option<(Arc<Pixmap>, FirmwareLogo)> {
        let monitor = self
            .monitor
            .or_else(|| (!display.card().is_firmware_framebuffer()).then(|| native_size(display)));
        let logo = self.logo.as_ref()?;
        Some(logo.drawn_on(self.framebuffer, monitor))
    }

    pub fn stretched_over(&self, display: &Display) -> Option<(u32, u32)> {
        self.monitor.filter(|monitor| {
            display.card().is_firmware_framebuffer() && display.sizes() != [*monitor]
        })
    }
}
