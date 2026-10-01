use alloc::string::String;
use alloc::vec::Vec;

use tiny_skia::{FillRule, Paint, PathBuilder, PixmapMut, Rect as SkRect, Transform};

use crate::{Layout, Rect, text};

const FIELD_WIDTH: f32 = 340.0;
const FIELD_HEIGHT: f32 = 46.0;
const TITLE_SIZE: f32 = 17.0;
const EXPLANATION_SIZE: f32 = 14.0;
const NOTE_SIZE: f32 = 13.0;
const LINE_HEIGHT: f32 = 20.0;
const MOST_LINES: usize = 3;
const DOT_RADIUS: f32 = 3.5;
const DOT_SPACING: f32 = 14.0;
const PADDING: f32 = 20.0;
const SHAKE_SECONDS: f32 = 0.42;

#[derive(Debug, Clone, Default, PartialEq)]
pub struct Prompt {
    pub title: String,
    pub explanation: Vec<String>,
    pub placeholder: String,
    pub typed: usize,
    pub note: Option<(String, f32)>,
    pub shake_started: Option<f32>,
}

struct Geometry {
    field: SkRect,
    note_baseline: f32,
    scale: f32,
}

fn geometry(layout: &Layout) -> Geometry {
    let scale = layout.scale;
    let (cx, cy) = layout.loader_center;
    let (width, height) = (FIELD_WIDTH * scale, FIELD_HEIGHT * scale);
    let field = SkRect::from_xywh(cx - width / 2.0, cy - height / 2.0, width, height)
        .expect("the field has a size");
    Geometry {
        note_baseline: field.bottom() + 30.0 * scale,
        field,
        scale,
    }
}

fn explanation_baseline(geometry: &Geometry, lines: usize, index: usize) -> f32 {
    geometry.field.top()
        - 20.0 * geometry.scale
        - (lines - 1 - index) as f32 * LINE_HEIGHT * geometry.scale
}

fn title_baseline(geometry: &Geometry, lines: usize) -> f32 {
    let gap = if lines == 0 { 20.0 } else { 32.0 };
    geometry.field.top() - (gap + lines as f32 * LINE_HEIGHT) * geometry.scale
}

pub fn bounds(layout: &Layout) -> Rect {
    let geometry = geometry(layout);
    let top = title_baseline(&geometry, MOST_LINES) - TITLE_SIZE * geometry.scale * 1.4;
    let bottom = geometry.note_baseline + NOTE_SIZE * geometry.scale * 0.6;
    Rect {
        x: 0,
        y: top as i32,
        width: layout.width,
        height: libm::ceilf(bottom - top) as u32,
    }
}

fn shake_offset(prompt: &Prompt, seconds: f32, scale: f32) -> f32 {
    let Some(started) = prompt.shake_started else {
        return 0.0;
    };
    let progress = (seconds - started) / SHAKE_SECONDS;
    if !(0.0..1.0).contains(&progress) {
        return 0.0;
    }
    libm::sinf(progress * core::f32::consts::TAU * 3.0) * (1.0 - progress) * 10.0 * scale
}

pub fn is_shaking(prompt: &Prompt, seconds: f32) -> bool {
    prompt
        .shake_started
        .is_some_and(|started| seconds - started < SHAKE_SECONDS)
}

pub fn draw(
    pixmap: &mut PixmapMut,
    layout: &Layout,
    view: Transform,
    prompt: &Prompt,
    seconds: f32,
    alpha: f32,
) {
    let geometry = geometry(layout);
    let scale = geometry.scale;
    let shift = view.pre_translate(shake_offset(prompt, seconds, scale), 0.0);
    let center = layout.loader_center.0;
    let lines = prompt.explanation.len().min(MOST_LINES);

    text::centered(
        pixmap,
        view,
        &prompt.title,
        (center, title_baseline(&geometry, lines)),
        TITLE_SIZE * scale,
        0.92 * alpha,
    );
    for (index, line) in prompt.explanation.iter().take(MOST_LINES).enumerate() {
        text::centered(
            pixmap,
            view,
            line,
            (center, explanation_baseline(&geometry, lines, index)),
            EXPLANATION_SIZE * scale,
            0.6 * alpha,
        );
    }

    let field = geometry.field;
    let mut paint = Paint {
        anti_alias: true,
        ..Paint::default()
    };
    paint.set_color_rgba8(255, 255, 255, (0.18 * alpha * 255.0) as u8);
    if let Some(shape) = crate::pill(field) {
        pixmap.fill_path(&shape, &paint, FillRule::Winding, shift, None);
    }

    let dot_y = field.top() + field.height() / 2.0;
    let first_x = field.left() + PADDING * scale;
    let room =
        libm::floorf((field.width() - PADDING * 2.0 * scale) / (DOT_SPACING * scale)) as usize;
    if prompt.typed == 0 {
        text::draw(
            pixmap,
            shift,
            &prompt.placeholder,
            (first_x, dot_y + NOTE_SIZE * scale * 0.36),
            15.0 * scale,
            0.5 * alpha,
        );
    } else {
        paint.set_color_rgba8(255, 255, 255, (alpha * 255.0) as u8);
        let mut dots = PathBuilder::new();
        for index in 0..prompt.typed.min(room) {
            dots.push_circle(
                first_x + DOT_RADIUS * scale + index as f32 * DOT_SPACING * scale,
                dot_y,
                DOT_RADIUS * scale,
            );
        }
        if let Some(dots) = dots.finish() {
            pixmap.fill_path(&dots, &paint, FillRule::Winding, shift, None);
        }
    }

    if let Some((note, brightness)) = &prompt.note {
        text::centered(
            pixmap,
            view,
            note,
            (center, geometry.note_baseline),
            NOTE_SIZE * scale,
            brightness * alpha,
        );
    }
}
