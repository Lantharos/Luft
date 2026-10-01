use alloc::sync::Arc;

use tiny_skia::{Color, Pixmap, PixmapPaint, Rect as Area, Transform};

use crate::image::resized;
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

#[derive(Clone)]
struct Logo {
    source: Arc<Pixmap>,
    on_canvas: Area,
    area: Rect,
    image: Arc<Pixmap>,
}

/// The splash laid out on a canvas the size of the picture the monitor shows, drawn onto a
/// framebuffer that may have fewer pixels, or pixels of another shape, when the monitor stretches it.
#[derive(Clone)]
pub struct Scene {
    pub layout: Layout,
    size: (u32, u32),
    logo: Option<Logo>,
}

fn rounded(area: Area) -> Rect {
    Rect {
        x: libm::roundf(area.x()) as i32,
        y: libm::roundf(area.y()) as i32,
        width: libm::roundf(area.width()).max(1.0) as u32,
        height: libm::roundf(area.height()).max(1.0) as u32,
    }
}

impl Scene {
    pub fn new(
        size: (u32, u32),
        canvas: (u32, u32),
        logo: Option<(Arc<Pixmap>, FirmwareLogo)>,
    ) -> Self {
        let logo =
            logo.and_then(|(image, firmware)| Some((image, firmware.area_on(size, canvas)?)));
        let layout = Layout::new(
            canvas.0,
            canvas.1,
            logo.as_ref().map(|(_, area)| rounded(*area)),
        );
        Self::arranged(layout, size, logo)
    }

    fn arranged(layout: Layout, size: (u32, u32), logo: Option<(Arc<Pixmap>, Area)>) -> Self {
        let mut scene = Self {
            layout,
            size,
            logo: None,
        };
        scene.logo = logo.and_then(|(source, on_canvas)| {
            let area = rounded(on_canvas.transform(scene.scale())?);
            let image = if (area.width, area.height) == (source.width(), source.height()) {
                source.clone()
            } else {
                Arc::new(resized(&source, area.width, area.height)?)
            };
            Some(Logo {
                source,
                on_canvas,
                area,
                image,
            })
        });
        scene
    }

    /// This scene as it looks once the monitor stretches it over a framebuffer of another size.
    pub fn stretched_to(&self, size: (u32, u32)) -> Self {
        let logo = self
            .logo
            .as_ref()
            .map(|logo| (logo.source.clone(), logo.on_canvas));
        Self::arranged(self.layout, size, logo)
    }

    pub fn size(&self) -> (u32, u32) {
        self.size
    }

    fn scale(&self) -> Transform {
        Transform::from_scale(
            self.size.0 as f32 / self.layout.width as f32,
            self.size.1 as f32 / self.layout.height as f32,
        )
    }

    fn is_square(&self) -> bool {
        self.size == (self.layout.width, self.layout.height)
    }

    pub fn view(&self, area: Rect) -> Transform {
        self.scale().post_translate(-area.x as f32, -area.y as f32)
    }

    pub fn project(&self, area: Rect) -> Rect {
        if self.is_square() {
            return area;
        }
        let scale = self.scale();
        let (left, top) = (area.x as f32 * scale.sx, area.y as f32 * scale.sy);
        let (right, bottom) = (
            area.right() as f32 * scale.sx,
            area.bottom() as f32 * scale.sy,
        );
        let (x, y) = (libm::floorf(left) as i32, libm::floorf(top) as i32);
        Rect {
            x,
            y,
            width: (libm::ceilf(right) as i32 - x) as u32,
            height: (libm::ceilf(bottom) as i32 - y) as u32,
        }
    }

    pub fn everything(&self) -> Rect {
        Rect {
            x: 0,
            y: 0,
            width: self.size.0,
            height: self.size.1,
        }
    }

    pub fn logo_area(&self) -> Option<Rect> {
        self.logo.as_ref().map(|logo| logo.area)
    }

    pub fn loader_area(&self) -> Rect {
        self.project(self.layout.loader_bounds())
    }

    pub fn prompt_area(&self) -> Rect {
        self.project(prompt::bounds(&self.layout))
    }

    pub fn status_area(&self) -> Rect {
        self.project(status::bounds(&self.layout))
    }

    pub fn notice_area(&self) -> Rect {
        self.project(notice::bounds(&self.layout))
    }

    pub fn content_area(&self, visuals: &Visuals) -> Option<Rect> {
        [
            self.logo_area().filter(|_| visuals.logo > 0.0),
            (visuals.loader > 0.0).then(|| self.loader_area()),
            visuals.prompt.map(|_| self.prompt_area()),
            visuals.status.map(|_| self.status_area()),
            visuals.notice.map(|_| self.notice_area()),
        ]
        .into_iter()
        .flatten()
        .reduce(|all, area| all.union(&area))
    }

    pub fn looks_like(&self, other: &Scene) -> bool {
        let near = |a: Rect, b: Rect| {
            (a.x - b.x).abs() <= 1
                && (a.y - b.y).abs() <= 1
                && a.width.abs_diff(b.width) <= 1
                && a.height.abs_diff(b.height) <= 1
        };
        let logos = match (self.logo_area(), other.logo_area()) {
            (Some(a), Some(b)) => near(a, b),
            (a, b) => a.is_none() && b.is_none(),
        };
        logos && near(self.loader_area(), other.loader_area())
    }

    pub fn render(&self, area: Rect, visuals: &Visuals) -> Option<Pixmap> {
        let area = area.clamp_to(self.size.0, self.size.1)?;
        let mut pixmap = Pixmap::new(area.width, area.height)?;
        pixmap.fill(Color::BLACK);

        if let Some(logo) = &self.logo
            && visuals.logo > 0.0
        {
            let paint = PixmapPaint {
                opacity: visuals.logo,
                ..PixmapPaint::default()
            };
            pixmap.draw_pixmap(
                logo.area.x - area.x,
                logo.area.y - area.y,
                logo.image.as_ref().as_ref(),
                &paint,
                Transform::identity(),
                None,
            );
        }
        let view = self.view(area);
        let mut canvas = pixmap.as_mut();
        loader::draw(
            &mut canvas,
            &self.layout,
            view,
            visuals.seconds,
            visuals.loader,
        );
        if let Some((prompt, alpha)) = visuals.prompt {
            prompt::draw(
                &mut canvas,
                &self.layout,
                view,
                prompt,
                visuals.seconds,
                alpha,
            );
        }
        if let Some((status, alpha)) = visuals.status {
            status::draw(&mut canvas, &self.layout, view, status, alpha);
        }
        if let Some((notice, alpha)) = visuals.notice {
            notice::draw(&mut canvas, &self.layout, view, notice, alpha);
        }
        Some(pixmap)
    }
}
