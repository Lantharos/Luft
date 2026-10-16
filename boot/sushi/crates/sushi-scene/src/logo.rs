use tiny_skia::Rect as Area;

const CENTERED_WITHIN: i32 = 2;

/// Where the firmware drew its logo, and on which screen size.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct FirmwareLogo {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub screen: (u32, u32),
}

impl FirmwareLogo {
    /// The screen the firmware drew its logo on: the framebuffer it handed over, or the screen the logo is centered on.
    pub fn infer(
        (x, y): (i32, i32),
        (width, height): (u32, u32),
        framebuffer: (u32, u32),
        monitor: Option<(u32, u32)>,
    ) -> Self {
        let on = |screen| Self {
            x,
            y,
            width,
            height,
            screen,
        };
        let spanned = x * 2 + width as i32;
        let centered_on =
            |screen_width: u32| (spanned - screen_width as i32).abs() <= CENTERED_WITHIN;
        let fits =
            x + width as i32 <= framebuffer.0 as i32 && y + height as i32 <= framebuffer.1 as i32;
        if fits && centered_on(framebuffer.0) {
            return on(framebuffer);
        }
        if let Some(monitor) = monitor.filter(|monitor| centered_on(monitor.0)) {
            return on(monitor);
        }
        let (aspect_width, aspect_height) = monitor.unwrap_or(framebuffer);
        let screen_width = (spanned + (spanned & 1)).max(2) as u32;
        let screen_height = (u64::from(screen_width) * u64::from(aspect_height)
            / u64::from(aspect_width.max(1))) as u32;
        on((screen_width, screen_height))
    }

    /// Where the logo goes on a canvas the size of the picture the monitor shows: the firmware's screen fitted into
    /// the canvas without stretching it, so the logo keeps its shape whether or not the monitor stretched it.
    pub fn area_on(&self, canvas: (u32, u32)) -> Option<Area> {
        let (screen_width, screen_height) =
            (self.screen.0.max(1) as f32, self.screen.1.max(1) as f32);
        let scale = (canvas.0 as f32 / screen_width).min(canvas.1 as f32 / screen_height);
        let left = (canvas.0 as f32 - screen_width * scale) / 2.0;
        let top = (canvas.1 as f32 - screen_height * scale) / 2.0;
        Area::from_xywh(
            left + self.x as f32 * scale,
            top + self.y as f32 * scale,
            self.width as f32 * scale,
            self.height as f32 * scale,
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const ULTRAWIDE: (u32, u32) = (3440, 1440);

    fn ultrawide_logo(framebuffer: (u32, u32), monitor: Option<(u32, u32)>) -> FirmwareLogo {
        FirmwareLogo::infer((1573, 350), (293, 400), framebuffer, monitor)
    }

    #[test]
    fn a_logo_drawn_on_the_framebuffer_stays_where_it_is() {
        let logo = ultrawide_logo(ULTRAWIDE, Some(ULTRAWIDE));
        assert_eq!(logo.screen, ULTRAWIDE);
        let area = logo.area_on(ULTRAWIDE).unwrap();
        assert_eq!((area.x(), area.y(), area.width()), (1573.0, 350.0, 293.0));
    }

    #[test]
    fn a_smaller_framebuffer_takes_the_screen_from_the_monitor() {
        let logo = ultrawide_logo((1024, 768), Some(ULTRAWIDE));
        assert_eq!(logo.screen, ULTRAWIDE);
        let area = logo.area_on(ULTRAWIDE).unwrap();
        assert_eq!((area.x(), area.y(), area.height()), (1573.0, 350.0, 400.0));
    }

    #[test]
    fn a_logo_centered_on_a_wider_screen_moves_to_the_middle() {
        let logo = FirmwareLogo::infer((543, 371), (193, 58), (1024, 768), None);
        assert_eq!(logo.screen, (1280, 960));
    }

    #[test]
    fn without_a_monitor_the_width_comes_from_centering() {
        let logo = ultrawide_logo((1024, 768), None);
        assert_eq!(logo.screen, (3440, 2580));
        let area = logo.area_on((1024, 768)).unwrap();
        assert!(libm::fabsf(area.x() + area.width() / 2.0 - 512.0) < 0.5);
        assert!(area.bottom() < 768.0);
    }

    #[test]
    fn a_logo_on_a_stretched_framebuffer_keeps_its_shape_on_the_panel() {
        let logo = FirmwareLogo::infer((700, 282), (520, 260), (1920, 1080), Some((1920, 1200)));
        assert_eq!(logo.screen, (1920, 1080));
        let area = logo.area_on((1920, 1200)).unwrap();
        assert_eq!(
            (area.x(), area.y(), area.width(), area.height()),
            (700.0, 342.0, 520.0, 260.0)
        );
    }
}
