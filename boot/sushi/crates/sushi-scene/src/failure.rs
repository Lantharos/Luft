use alloc::string::String;
use alloc::vec::Vec;

use tiny_skia::{FillRule, Paint, PixmapMut, Rect as SkRect, Transform};

use crate::{Layout, Rect, mark, pill, text};

const MARK_HEIGHT: f32 = 52.0;
const TITLE_SIZE: f32 = 22.0;
const REASON_SIZE: f32 = 15.0;
const ROW_HEIGHT: f32 = 44.0;
const ROW_WIDTH: f32 = 420.0;
const ROW_SIZE: f32 = 15.0;
const HINT_SIZE: f32 = 13.0;
const DETAILS_WIDTH: f32 = 760.0;
const DETAIL_SIZE: f32 = 13.0;
const DETAIL_LINE: f32 = 20.0;
const SCROLLBAR: f32 = 3.0;
const EDGE: f32 = 48.0;
const CHOICES_HINT: &str = "Choose with the arrow keys and press Enter";
const DETAILS_TITLE: &str = "Details";
const DETAILS_HINT: &str = "Scroll with the arrow keys. Press Esc to go back.";

#[derive(Debug, Clone, Default, PartialEq)]
pub struct Failure {
    pub title: String,
    pub reason: Option<String>,
    pub choices: Vec<String>,
    pub selected: usize,
    pub details: Vec<String>,
    pub reading: Option<usize>,
}

struct Choices {
    top: f32,
    title: f32,
    reason: f32,
    rows: f32,
    hint: f32,
}

fn choices(layout: &Layout, failure: &Failure) -> Choices {
    let scale = layout.scale;
    let reason = if failure.reason.is_some() { 30.0 } else { 0.0 };
    let rows = failure.choices.len() as f32 * ROW_HEIGHT;
    let height = (MARK_HEIGHT + 46.0 + reason + 30.0 + rows + 38.0) * scale;
    let top = (layout.height as f32 * 0.5 - height * 0.55).max(EDGE * scale);
    let title = top + (MARK_HEIGHT + 46.0) * scale;
    let reason = title + reason * scale;
    let rows_top = reason + 30.0 * scale;
    Choices {
        top,
        title,
        reason,
        rows: rows_top,
        hint: rows_top + (rows + 38.0) * scale,
    }
}

struct Reading {
    title: f32,
    lines: f32,
    hint: f32,
    visible: usize,
}

fn reading(layout: &Layout) -> Reading {
    let scale = layout.scale;
    let margin = (layout.height as f32 * 0.08).max(EDGE * scale);
    let title = margin + TITLE_SIZE * scale;
    let lines = title + 40.0 * scale;
    let hint = layout.height as f32 - margin;
    let room = hint - 36.0 * scale - lines;
    Reading {
        title,
        lines,
        hint,
        visible: libm::floorf(room / (DETAIL_LINE * scale)).max(1.0) as usize,
    }
}

pub fn visible_lines(layout: &Layout) -> usize {
    reading(layout).visible
}

pub fn wrap<'a>(lines: impl IntoIterator<Item = &'a str>) -> Vec<String> {
    let room = DETAILS_WIDTH - 4.0 * SCROLLBAR;
    let fits = |line: &str| text::width(line, DETAIL_SIZE) <= room;
    let mut wrapped = Vec::new();
    for line in lines {
        let text = line.trim_start_matches(' ');
        let indent = &line[..line.len() - text.len()];
        let mut current = String::from(indent);
        for word in text.split(' ') {
            let joined = if current.trim_start().is_empty() {
                alloc::format!("{current}{word}")
            } else {
                alloc::format!("{current} {word}")
            };
            if fits(&joined) {
                current = joined;
                continue;
            }
            if !current.trim_start().is_empty() {
                wrapped.push(core::mem::replace(&mut current, String::from(indent)));
            }
            for character in word.chars() {
                current.push(character);
                if !fits(&current) {
                    current.pop();
                    wrapped.push(core::mem::replace(&mut current, String::from(indent)));
                    current.push(character);
                }
            }
        }
        wrapped.push(current);
    }
    wrapped
}

pub fn bounds(layout: &Layout) -> Rect {
    let width = (DETAILS_WIDTH + 2.0 * EDGE) * layout.scale;
    Rect {
        x: libm::floorf(layout.loader_center.0 - width / 2.0) as i32,
        y: 0,
        width: libm::ceilf(width) as u32,
        height: layout.height,
    }
}

fn fill(pixmap: &mut PixmapMut, view: Transform, area: Option<SkRect>, alpha: f32) {
    let Some(shape) = area.and_then(pill) else {
        return;
    };
    let mut paint = Paint {
        anti_alias: true,
        ..Paint::default()
    };
    paint.set_color_rgba8(
        255,
        255,
        255,
        libm::roundf(alpha.clamp(0.0, 1.0) * 255.0) as u8,
    );
    pixmap.fill_path(&shape, &paint, FillRule::Winding, view, None);
}

fn fill_bar(pixmap: &mut PixmapMut, view: Transform, area: Option<SkRect>, alpha: f32) {
    let Some(area) = area else {
        return;
    };
    let mut paint = Paint::default();
    paint.set_color_rgba8(
        255,
        255,
        255,
        libm::roundf(alpha.clamp(0.0, 1.0) * 255.0) as u8,
    );
    pixmap.fill_rect(area, &paint, view, None);
}

fn draw_choices(
    pixmap: &mut PixmapMut,
    layout: &Layout,
    view: Transform,
    failure: &Failure,
    alpha: f32,
) {
    let scale = layout.scale;
    let center = layout.loader_center.0;
    let at = choices(layout, failure);
    let mark_height = MARK_HEIGHT * scale;
    mark::draw(
        pixmap,
        view,
        (center - mark::width(mark_height) / 2.0, at.top),
        mark_height,
        alpha,
    );
    text::centered(
        pixmap,
        view,
        &failure.title,
        (center, at.title),
        TITLE_SIZE * scale,
        0.95 * alpha,
    );
    if let Some(reason) = &failure.reason {
        text::centered(
            pixmap,
            view,
            reason,
            (center, at.reason),
            REASON_SIZE * scale,
            0.65 * alpha,
        );
    }
    let (width, height) = (ROW_WIDTH * scale, ROW_HEIGHT * scale);
    let left = center - width / 2.0;
    for (index, choice) in failure.choices.iter().enumerate() {
        let y = at.rows + index as f32 * height;
        let selected = index == failure.selected;
        if selected {
            fill(
                pixmap,
                view,
                SkRect::from_xywh(left, y, width, height),
                0.16 * alpha,
            );
        }
        let size = ROW_SIZE * scale;
        text::centered(
            pixmap,
            view,
            choice,
            (center, y + height / 2.0 + size * 0.36),
            size,
            if selected { 1.0 } else { 0.72 } * alpha,
        );
    }
    text::centered(
        pixmap,
        view,
        CHOICES_HINT,
        (center, at.hint),
        HINT_SIZE * scale,
        0.5 * alpha,
    );
}

fn draw_details(
    pixmap: &mut PixmapMut,
    layout: &Layout,
    view: Transform,
    failure: &Failure,
    first: usize,
    alpha: f32,
) {
    let scale = layout.scale;
    let center = layout.loader_center.0;
    let at = reading(layout);
    let left = center - DETAILS_WIDTH * scale / 2.0;
    text::draw(
        pixmap,
        view,
        DETAILS_TITLE,
        (left, at.title),
        TITLE_SIZE * scale,
        0.95 * alpha,
    );
    let line_height = DETAIL_LINE * scale;
    let first = first.min(failure.details.len().saturating_sub(at.visible));
    for (slot, line) in failure
        .details
        .iter()
        .skip(first)
        .take(at.visible)
        .enumerate()
    {
        let baseline = at.lines + DETAIL_SIZE * scale + slot as f32 * line_height;
        text::draw(
            pixmap,
            view,
            line,
            (left, baseline),
            DETAIL_SIZE * scale,
            0.78 * alpha,
        );
    }
    let total = failure.details.len();
    if total > at.visible {
        let track = at.visible as f32 * line_height;
        let thumb = (track * at.visible as f32 / total as f32).max(24.0 * scale);
        let offset = (track - thumb) * first as f32 / (total - at.visible) as f32;
        let x = center + DETAILS_WIDTH * scale / 2.0 - SCROLLBAR * scale;
        let track_area = SkRect::from_xywh(x, at.lines, SCROLLBAR * scale, track);
        fill_bar(pixmap, view, track_area, 0.08 * alpha);
        let thumb_area = SkRect::from_xywh(x, at.lines + offset, SCROLLBAR * scale, thumb);
        fill_bar(pixmap, view, thumb_area, 0.4 * alpha);
    }
    text::draw(
        pixmap,
        view,
        DETAILS_HINT,
        (left, at.hint),
        HINT_SIZE * scale,
        0.5 * alpha,
    );
}

pub fn draw(
    pixmap: &mut PixmapMut,
    layout: &Layout,
    view: Transform,
    failure: &Failure,
    alpha: f32,
) {
    match failure.reading {
        Some(first) => draw_details(pixmap, layout, view, failure, first, alpha),
        None => draw_choices(pixmap, layout, view, failure, alpha),
    }
}
