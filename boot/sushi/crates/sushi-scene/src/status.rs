use alloc::string::String;

use tiny_skia::{FillRule, Paint, PixmapMut, Rect as SkRect, Transform};

use crate::{Layout, Rect, text};

const TITLE_SIZE: f32 = 17.0;
const NOTE_SIZE: f32 = 13.0;
const BAR_WIDTH: f32 = 240.0;
const BAR_HEIGHT: f32 = 4.0;
const SWEEP_SECONDS: f32 = 1.6;
const SWEEP_SHARE: f32 = 0.3;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Progress {
    Known(f32),
    Waiting(f32),
}

#[derive(Debug, Clone, PartialEq)]
pub struct Status {
    pub title: String,
    pub progress: Progress,
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
    let title = layout.loader_center.1 - 30.0 * scale;
    Lines {
        title,
        bar: title + 22.0 * scale,
        note: title + 52.0 * scale,
        detail: title + 76.0 * scale,
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

fn fill_pill(pixmap: &mut PixmapMut, area: Option<SkRect>, alpha: f32, view: Transform) {
    let Some(shape) = area.and_then(crate::pill) else {
        return;
    };
    let mut paint = Paint {
        anti_alias: true,
        ..Paint::default()
    };
    paint.set_color_rgba8(255, 255, 255, libm::roundf(alpha * 255.0) as u8);
    pixmap.fill_path(&shape, &paint, FillRule::Winding, view, None);
}

fn filled_span(progress: Progress, width: f32, height: f32) -> Option<(f32, f32)> {
    match progress {
        Progress::Known(done) => {
            let filled = width * done.clamp(0.0, 1.0);
            (filled > 0.0).then(|| (0.0, filled.max(height)))
        }
        Progress::Waiting(seconds) => {
            let sweep = width * SWEEP_SHARE;
            let cycles = seconds / SWEEP_SECONDS;
            let travel = crate::ease(cycles - libm::floorf(cycles));
            let start = (width + sweep) * travel - sweep;
            let (from, to) = (start.max(0.0), (start + sweep).min(width));
            (to - from >= height).then_some((from, to - from))
        }
    }
}

fn draw_bar(
    pixmap: &mut PixmapMut,
    layout: &Layout,
    view: Transform,
    progress: Progress,
    alpha: f32,
) {
    let scale = layout.scale;
    let (width, height) = (BAR_WIDTH * scale, BAR_HEIGHT * scale);
    let left = layout.loader_center.0 - width / 2.0;
    let top = lines(layout).bar - height / 2.0;
    fill_pill(
        pixmap,
        SkRect::from_xywh(left, top, width, height),
        0.18 * alpha,
        view,
    );
    if let Some((offset, length)) = filled_span(progress, width, height) {
        fill_pill(
            pixmap,
            SkRect::from_xywh(left + offset, top, length, height),
            0.92 * alpha,
            view,
        );
    }
}

pub fn draw(pixmap: &mut PixmapMut, layout: &Layout, view: Transform, status: &Status, alpha: f32) {
    let scale = layout.scale;
    let lines = lines(layout);
    let at = |baseline: f32| (layout.loader_center.0, baseline);
    text::centered(
        pixmap,
        view,
        &status.title,
        at(lines.title),
        TITLE_SIZE * scale,
        0.92 * alpha,
    );
    draw_bar(pixmap, layout, view, status.progress, alpha);
    text::centered(
        pixmap,
        view,
        &status.note,
        at(lines.note),
        NOTE_SIZE * scale,
        0.6 * alpha,
    );
    if let Some(detail) = &status.detail {
        text::centered(
            pixmap,
            view,
            detail,
            at(lines.detail),
            NOTE_SIZE * scale,
            0.4 * alpha,
        );
    }
}
