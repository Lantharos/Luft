use alloc::sync::Arc;

use tiny_skia::{Color, Pixmap, PixmapPaint, Transform};

use crate::notice::{self, Notice};
use crate::prompt::{self, Prompt};
use crate::status::{self, Status};
use crate::{FirmwareLogo, Layout, Rect, loader};

#[derive(Clone, Copy, Default)]
pub struct Visuals<'a> {
    pub seconds: f32,
    pub logo: f32,
    pub loader: f32,
    pub prompt: Option<(&'a Prompt, f32)>,
    pub status: Option<(&'a Status, f32)>,
    pub notice: Option<(&'a Notice, f32)>,
}

pub struct Scene {
    pub layout: Layout,
    logo: Option<Arc<Pixmap>>,
}

impl Scene {
    pub fn new(width: u32, height: u32, logo: Option<(Arc<Pixmap>, FirmwareLogo)>) -> Self {
        let placed = logo
            .as_ref()
            .map(|(_, firmware)| firmware.placed_on(width, height));
        Self {
            layout: Layout::new(width, height, placed),
            logo: logo.map(|(image, _)| image),
        }
    }

    pub fn everything(&self) -> Rect {
        Rect {
            x: 0,
            y: 0,
            width: self.layout.width,
            height: self.layout.height,
        }
    }

    pub fn loader_area(&self) -> Rect {
        self.layout.loader_bounds()
    }

    pub fn prompt_area(&self) -> Rect {
        prompt::bounds(&self.layout)
    }

    pub fn status_area(&self) -> Rect {
        status::bounds(&self.layout)
    }

    pub fn notice_area(&self) -> Rect {
        notice::bounds(&self.layout)
    }

    pub fn render(&self, area: Rect, visuals: &Visuals) -> Option<Pixmap> {
        let area = area.clamp_to(self.layout.width, self.layout.height)?;
        let mut pixmap = Pixmap::new(area.width, area.height)?;
        pixmap.fill(Color::BLACK);
        let origin = (area.x, area.y);

        if let (Some(image), Some(place)) = (&self.logo, self.layout.logo)
            && visuals.logo > 0.0
        {
            let paint = PixmapPaint {
                opacity: visuals.logo,
                ..PixmapPaint::default()
            };
            pixmap.draw_pixmap(
                place.x - area.x,
                place.y - area.y,
                image.as_ref().as_ref(),
                &paint,
                Transform::identity(),
                None,
            );
        }
        let mut canvas = pixmap.as_mut();
        loader::draw(
            &mut canvas,
            &self.layout,
            origin,
            visuals.seconds,
            visuals.loader,
        );
        if let Some((prompt, alpha)) = visuals.prompt {
            prompt::draw(
                &mut canvas,
                &self.layout,
                origin,
                prompt,
                visuals.seconds,
                alpha,
            );
        }
        if let Some((status, alpha)) = visuals.status {
            status::draw(&mut canvas, &self.layout, origin, status, alpha);
        }
        if let Some((notice, alpha)) = visuals.notice {
            notice::draw(&mut canvas, &self.layout, origin, notice, alpha);
        }
        Some(pixmap)
    }
}
