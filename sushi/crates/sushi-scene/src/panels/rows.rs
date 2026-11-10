use alloc::format;
use alloc::string::String;

use tiny_skia::{FillRule, PixmapMut, Rect as SkRect, Transform};

use crate::{pill, text, white};

pub const HEIGHT: f32 = 44.0;
pub const WIDTH: f32 = 420.0;
const PADDING: f32 = 24.0;
const LABEL_SIZE: f32 = 15.0;

fn shortened(label: &str, size: f32, room: f32) -> String {
    let mut kept = String::from(label);
    while !kept.is_empty() {
        kept.pop();
        let candidate = format!("{}…", kept.trim_end());
        if text::width(&candidate, size) <= room {
            return candidate;
        }
    }
    kept
}

pub fn draw<'a>(
    pixmap: &mut PixmapMut,
    view: Transform,
    (left, top, width): (f32, f32, f32),
    scale: f32,
    labels: impl IntoIterator<Item = &'a str>,
    selected: usize,
    alpha: f32,
) {
    let height = HEIGHT * scale;
    let size = LABEL_SIZE * scale;
    let room = width - 2.0 * PADDING * scale;
    for (index, label) in labels.into_iter().enumerate() {
        let y = top + index as f32 * height;
        if index == selected
            && let Some(shape) = SkRect::from_xywh(left, y, width, height).and_then(pill)
        {
            let paint = white(0.16 * alpha);
            pixmap.fill_path(&shape, &paint, FillRule::Winding, view, None);
        }
        let brightness = if index == selected { 1.0 } else { 0.72 };
        let (center, baseline) = (left + width / 2.0, y + height / 2.0 + size * 0.36);
        let opacity = brightness * alpha;
        let wide = text::width(label, size);
        if wide <= room {
            let at = (center - wide / 2.0, baseline);
            text::draw(pixmap, view, label, at, size, opacity);
        } else {
            let label = shortened(label, size, room);
            text::centered(pixmap, view, &label, (center, baseline), size, opacity);
        }
    }
}
