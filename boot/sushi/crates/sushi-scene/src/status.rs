use alloc::string::String;

use tiny_skia::{FillRule, Paint, PixmapMut, Rect as SkRect, Transform};

use crate::{Layout, Rect, text};

const TITLE_SIZE: f32 = 17.0;
const NOTE_SIZE: f32 = 13.0;
const BAR_WIDTH: f32 = 240.0;
const BAR_HEIGHT: f32 = 4.0;

#[derive(Debug, Clone, Default, PartialEq)]
pub struct Status {
    pub title: String,
    pub progress: Option<f32>,
    pub note: String,
    pub detail: Option<String>,
}

struct Lines {
    title: f32,
    bar: f32,
    note: f32,
    detail: f32,
}

fn lines(layout: &Layout) -> Lines {
    let scale = layout.scale;
    let below_loader = layout.loader_center.1 + layout.loader_size / 2.0;
    Lines {
        title: below_loader + 48.0 * scale,
        bar: below_loader + 70.0 * scale,
        note: below_loader + 100.0 * scale,
        detail: below_loader + 124.0 * scale,
    }
}

pub fn bounds(layout: &Layout) -> Rect {
    let lines = lines(layout);
    let top = lines.title - TITLE_SIZE * layout.scale * 1.4;
    let bottom = lines.detail + NOTE_SIZE * layout.scale * 0.6;
    Rect {
        x: 0,
        y: top as i32,
        width: layout.width,
        height: libm::ceilf(bottom - top) as u32,
    }
}

fn fill_pill(pixmap: &mut PixmapMut, area: Option<SkRect>, alpha: f32, shift: Transform) {
    let Some(shape) = area.and_then(crate::pill) else {
        return;
    };
    let mut paint = Paint {
        anti_alias: true,
        ..Paint::default()
    };
    paint.set_color_rgba8(255, 255, 255, libm::roundf(alpha * 255.0) as u8);
    pixmap.fill_path(&shape, &paint, FillRule::Winding, shift, None);
}

fn draw_bar(
    pixmap: &mut PixmapMut,
    layout: &Layout,
    origin: (i32, i32),
    progress: f32,
    alpha: f32,
) {
    let scale = layout.scale;
    let (width, height) = (BAR_WIDTH * scale, BAR_HEIGHT * scale);
    let left = layout.loader_center.0 - width / 2.0;
    let top = lines(layout).bar - height / 2.0;
    let shift = Transform::from_translate(-origin.0 as f32, -origin.1 as f32);
    fill_pill(
        pixmap,
        SkRect::from_xywh(left, top, width, height),
        0.18 * alpha,
        shift,
    );
    let filled = width * progress.clamp(0.0, 1.0);
    if filled > 0.0 {
        fill_pill(
            pixmap,
            SkRect::from_xywh(left, top, filled.max(height), height),
            0.92 * alpha,
            shift,
        );
    }
}

pub fn draw(
    pixmap: &mut PixmapMut,
    layout: &Layout,
    origin: (i32, i32),
    status: &Status,
    alpha: f32,
) {
    let scale = layout.scale;
    let lines = lines(layout);
    let center = layout.loader_center.0 - origin.0 as f32;
    let at = |baseline: f32| (center, baseline - origin.1 as f32);
    text::centered(
        pixmap,
        &status.title,
        at(lines.title),
        TITLE_SIZE * scale,
        0.92 * alpha,
    );
    if let Some(progress) = status.progress {
        draw_bar(pixmap, layout, origin, progress, alpha);
    }
    text::centered(
        pixmap,
        &status.note,
        at(lines.note),
        NOTE_SIZE * scale,
        0.6 * alpha,
    );
    if let Some(detail) = &status.detail {
        text::centered(
            pixmap,
            detail,
            at(lines.detail),
            NOTE_SIZE * scale,
            0.4 * alpha,
        );
    }
}
