use alloc::string::String;
use alloc::vec::Vec;

use tiny_skia::{PixmapMut, Transform};

use crate::{Layout, Rect, text};

const TITLE_SIZE: f32 = 20.0;
const BODY_SIZE: f32 = 15.0;
const FOOTER_SIZE: f32 = 13.0;
const CODE_SIZE: f32 = 34.0;
const BODY_LINE: f32 = 23.0;
const STEP_LINE: f32 = 28.0;
const NUMBER_GAP: f32 = 26.0;
const CODE_CELL: f32 = 26.0;
const CODE_GROUP_GAP: f32 = 22.0;
const CODE_GROUP: usize = 4;
const CODE_BLOCK: f32 = 92.0;
const MOST_BODY_LINES: usize = 3;
const MOST_STEPS: usize = 6;

#[derive(Debug, Clone, Default, PartialEq)]
pub struct Notice {
    pub title: String,
    pub body: Vec<String>,
    pub steps: Vec<String>,
    pub code: Option<(String, String)>,
    pub footer: String,
}

fn top(layout: &Layout) -> f32 {
    let scale = layout.scale;
    let below_logo = match layout.logo {
        Some(logo) => logo.bottom() as f32 + 64.0 * scale,
        None => layout.height as f32 * 0.3,
    };
    let room =
        layout.height as f32 - height(MOST_BODY_LINES, MOST_STEPS, true, scale) - 40.0 * scale;
    below_logo.min(room.max(TITLE_SIZE * scale * 1.4))
}

fn height(body: usize, steps: usize, code: bool, scale: f32) -> f32 {
    let code = if code { CODE_BLOCK } else { 0.0 };
    (36.0 + body as f32 * BODY_LINE + 18.0 + steps as f32 * STEP_LINE + code + 30.0) * scale
}

pub fn bounds(layout: &Layout) -> Rect {
    let top = top(layout) - TITLE_SIZE * layout.scale * 1.4;
    let bottom =
        (top + height(MOST_BODY_LINES, MOST_STEPS, true, layout.scale) + 40.0 * layout.scale)
            .min(layout.height as f32);
    Rect {
        x: 0,
        y: top as i32,
        width: layout.width,
        height: libm::ceilf(bottom - top) as u32,
    }
}

fn draw_code(
    pixmap: &mut PixmapMut,
    view: Transform,
    (code, caption): (&str, &str),
    (center, baseline): (f32, f32),
    scale: f32,
    alpha: f32,
) {
    let cell = CODE_CELL * scale;
    let digits = code.chars().count();
    let gaps = digits.saturating_sub(1) / CODE_GROUP;
    let width = digits as f32 * cell + gaps as f32 * CODE_GROUP_GAP * scale;
    let left = center - width / 2.0;
    for (index, digit) in code.chars().enumerate() {
        let gap = (index / CODE_GROUP) as f32 * CODE_GROUP_GAP * scale;
        let mut encoded = [0u8; 4];
        text::centered(
            pixmap,
            view,
            digit.encode_utf8(&mut encoded),
            (left + gap + index as f32 * cell + cell / 2.0, baseline),
            CODE_SIZE * scale,
            0.95 * alpha,
        );
    }
    text::centered(
        pixmap,
        view,
        caption,
        (center, baseline + 30.0 * scale),
        FOOTER_SIZE * scale,
        0.5 * alpha,
    );
}

pub fn draw(pixmap: &mut PixmapMut, layout: &Layout, view: Transform, notice: &Notice, alpha: f32) {
    let scale = layout.scale;
    let center = layout.loader_center.0;
    let mut baseline = top(layout);
    text::centered(
        pixmap,
        view,
        &notice.title,
        (center, baseline),
        TITLE_SIZE * scale,
        0.95 * alpha,
    );
    baseline += 36.0 * scale;
    for line in notice.body.iter().take(MOST_BODY_LINES) {
        text::centered(
            pixmap,
            view,
            line,
            (center, baseline),
            BODY_SIZE * scale,
            0.7 * alpha,
        );
        baseline += BODY_LINE * scale;
    }
    baseline += 18.0 * scale;
    let steps = &notice.steps[..notice.steps.len().min(MOST_STEPS)];
    let widest = steps
        .iter()
        .map(|step| text::width(step, BODY_SIZE * scale))
        .fold(0.0, f32::max);
    let left = center - (widest + NUMBER_GAP * scale) / 2.0;
    for (index, step) in steps.iter().enumerate() {
        let number = [b'1' + index as u8];
        let number = core::str::from_utf8(&number).unwrap_or_default();
        text::draw(
            pixmap,
            view,
            number,
            (left, baseline),
            BODY_SIZE * scale,
            0.5 * alpha,
        );
        text::draw(
            pixmap,
            view,
            step,
            (left + NUMBER_GAP * scale, baseline),
            BODY_SIZE * scale,
            0.92 * alpha,
        );
        baseline += STEP_LINE * scale;
    }
    if let Some((code, caption)) = &notice.code {
        baseline += 30.0 * scale;
        draw_code(
            pixmap,
            view,
            (code, caption),
            (center, baseline),
            scale,
            alpha,
        );
        baseline += CODE_BLOCK * scale - 30.0 * scale;
    }
    baseline += 30.0 * scale - STEP_LINE * scale + 14.0 * scale;
    text::centered(
        pixmap,
        view,
        &notice.footer,
        (center, baseline),
        FOOTER_SIZE * scale,
        0.5 * alpha,
    );
}
