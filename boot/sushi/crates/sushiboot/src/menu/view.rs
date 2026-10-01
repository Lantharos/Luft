use alloc::format;
use alloc::string::String;

use sushi_scene::tiny_skia::{FillRule, Paint, PixmapMut, Rect as SkRect, Transform};
use sushi_scene::{Layout, Rect, pill, text};

use crate::entries::{Catalog, Row};

const ROW_HEIGHT: f32 = 44.0;
const ROW_WIDTH: f32 = 420.0;
const ROW_PADDING: f32 = 24.0;
const VISIBLE_ROWS: usize = 6;
const TITLE_SIZE: f32 = 15.0;
const HINT_SIZE: f32 = 13.0;
const HINT_GAP: f32 = 56.0;
const EDGE: f32 = 24.0;

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum List {
    Main,
    Previous,
}

pub struct View<'a> {
    pub catalog: &'a Catalog,
    pub list: List,
    pub selected: usize,
    pub countdown: Option<f32>,
}

fn fitted(title: &str, size: f32, room: f32) -> String {
    if text::width(title, size) <= room {
        return String::from(title);
    }
    let mut shortened = String::from(title);
    while !shortened.is_empty() {
        shortened.pop();
        let candidate = format!("{}…", shortened.trim_end());
        if text::width(&candidate, size) <= room {
            return candidate;
        }
    }
    shortened
}

impl View<'_> {
    pub fn len(&self) -> usize {
        match self.list {
            List::Main => self.catalog.main.len(),
            List::Previous => self.catalog.previous.len(),
        }
    }

    pub fn row(&self, index: usize) -> Row {
        match self.list {
            List::Main => self.catalog.main[index],
            List::Previous => Row::Entry(self.catalog.previous[index]),
        }
    }

    fn title(&self, index: usize) -> &str {
        match self.row(index) {
            Row::Entry(entry) => &self.catalog.entries[entry].title,
            Row::Previous => "Previous versions",
        }
    }

    fn hint(&self) -> Option<String> {
        if self.list == List::Previous {
            return Some(String::from("Press Esc to go back"));
        }
        let seconds = libm::ceilf(self.countdown?).max(1.0) as u32;
        Some(if seconds == 1 {
            String::from("Starts in 1 second")
        } else {
            format!("Starts in {seconds} seconds")
        })
    }

    pub fn area(&self, layout: &Layout) -> Rect {
        let scale = layout.scale;
        let rows = self
            .catalog
            .main
            .len()
            .max(self.catalog.previous.len())
            .min(VISIBLE_ROWS) as f32;
        let height = (rows * ROW_HEIGHT + HINT_GAP) * scale;
        let width = ROW_WIDTH * scale;
        let below_logo = layout
            .logo
            .map_or(0.0, |logo| logo.bottom() as f32 + EDGE * scale);
        let top = (layout.loader_center.1 - ROW_HEIGHT * scale / 2.0)
            .min(layout.height as f32 - height - EDGE * scale)
            .max(below_logo);
        Rect {
            x: (layout.loader_center.0 - width / 2.0) as i32,
            y: top as i32,
            width: width as u32 + 1,
            height: height as u32 + 1,
        }
    }

    pub fn draw(&self, canvas: &mut PixmapMut, layout: &Layout, origin: (i32, i32), alpha: f32) {
        let scale = layout.scale;
        let area = self.area(layout);
        let left = (area.x - origin.0) as f32;
        let top = (area.y - origin.1) as f32;
        let width = area.width as f32 - 1.0;
        let row_height = ROW_HEIGHT * scale;
        let first = self.selected.saturating_sub(VISIBLE_ROWS - 1);
        let shown = self.len().min(VISIBLE_ROWS);
        for (slot, index) in (first..first + shown).enumerate() {
            let y = top + slot as f32 * row_height;
            if index == self.selected
                && let Some(shape) = SkRect::from_xywh(left, y, width, row_height).and_then(pill)
            {
                let mut paint = Paint {
                    anti_alias: true,
                    ..Paint::default()
                };
                paint.set_color_rgba8(255, 255, 255, (0.16 * alpha * 255.0) as u8);
                canvas.fill_path(
                    &shape,
                    &paint,
                    FillRule::Winding,
                    Transform::identity(),
                    None,
                );
            }
            let size = TITLE_SIZE * scale;
            let title = fitted(self.title(index), size, width - 2.0 * ROW_PADDING * scale);
            let brightness = if index == self.selected { 1.0 } else { 0.72 };
            text::centered(
                canvas,
                &title,
                (left + width / 2.0, y + row_height / 2.0 + size * 0.36),
                size,
                brightness * alpha,
            );
        }
        if let Some(hint) = self.hint() {
            let size = HINT_SIZE * scale;
            let baseline = top + shown as f32 * row_height + 34.0 * scale;
            text::centered(
                canvas,
                &hint,
                (left + width / 2.0, baseline),
                size,
                0.6 * alpha,
            );
        }
    }
}
