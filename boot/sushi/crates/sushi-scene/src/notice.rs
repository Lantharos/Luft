use alloc::string::String;
use alloc::vec::Vec;

use tiny_skia::PixmapMut;

use crate::{Layout, Rect, text};

const TITLE_SIZE: f32 = 20.0;
const BODY_SIZE: f32 = 15.0;
const FOOTER_SIZE: f32 = 13.0;
const BODY_LINE: f32 = 23.0;
const STEP_LINE: f32 = 28.0;
const NUMBER_GAP: f32 = 26.0;

#[derive(Debug, Clone, Default, PartialEq)]
pub struct Notice {
    pub title: String,
    pub body: Vec<String>,
    pub steps: Vec<String>,
    pub footer: String,
}

fn top(layout: &Layout) -> f32 {
    let scale = layout.scale;
    match layout.logo {
        Some(logo) => logo.bottom() as f32 + 64.0 * scale,
        None => layout.height as f32 * 0.35,
    }
}

fn height(notice_lines: (usize, usize), scale: f32) -> f32 {
    let (body, steps) = notice_lines;
    (36.0 + body as f32 * BODY_LINE + 18.0 + steps as f32 * STEP_LINE + 30.0) * scale
}

pub fn bounds(layout: &Layout) -> Rect {
    let top = top(layout) - TITLE_SIZE * layout.scale * 1.4;
    let bottom =
        (top + height((3, 6), layout.scale) + 40.0 * layout.scale).min(layout.height as f32);
    Rect {
        x: 0,
        y: top as i32,
        width: layout.width,
        height: libm::ceilf(bottom - top) as u32,
    }
}

pub fn draw(
    pixmap: &mut PixmapMut,
    layout: &Layout,
    origin: (i32, i32),
    notice: &Notice,
    alpha: f32,
) {
    let scale = layout.scale;
    let center = layout.loader_center.0 - origin.0 as f32;
    let mut baseline = top(layout) - origin.1 as f32;
    text::centered(
        pixmap,
        &notice.title,
        (center, baseline),
        TITLE_SIZE * scale,
        0.95 * alpha,
    );
    baseline += 36.0 * scale;
    for line in &notice.body {
        text::centered(
            pixmap,
            line,
            (center, baseline),
            BODY_SIZE * scale,
            0.7 * alpha,
        );
        baseline += BODY_LINE * scale;
    }
    baseline += 18.0 * scale;
    let widest = notice
        .steps
        .iter()
        .map(|step| text::width(step, BODY_SIZE * scale))
        .fold(0.0, f32::max);
    let left = center - (widest + NUMBER_GAP * scale) / 2.0;
    for (index, step) in notice.steps.iter().enumerate() {
        let number = [b'1' + index as u8];
        let number = core::str::from_utf8(&number).unwrap_or_default();
        text::draw(
            pixmap,
            number,
            (left, baseline),
            BODY_SIZE * scale,
            0.5 * alpha,
        );
        text::draw(
            pixmap,
            step,
            (left + NUMBER_GAP * scale, baseline),
            BODY_SIZE * scale,
            0.92 * alpha,
        );
        baseline += STEP_LINE * scale;
    }
    baseline += 30.0 * scale - STEP_LINE * scale + 14.0 * scale;
    text::centered(
        pixmap,
        &notice.footer,
        (center, baseline),
        FOOTER_SIZE * scale,
        0.5 * alpha,
    );
}
