use alloc::format;
use alloc::string::String;

use sushi_scene::panels::rows;
use sushi_scene::tiny_skia::{PixmapMut, Transform};
use sushi_scene::{Layout, Rect, text};

use crate::entries::{Catalog, Row};

const VISIBLE_ROWS: usize = 6;
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
    pub notice: Option<String>,
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
        if self.notice.is_some() {
            return self.notice.clone();
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
        let visible = self
            .catalog
            .main
            .len()
            .max(self.catalog.previous.len())
            .min(VISIBLE_ROWS) as f32;
        let height = (visible * rows::HEIGHT + HINT_GAP) * scale;
        let width = rows::WIDTH * scale;
        let below_logo = layout
            .logo
            .map_or(0.0, |logo| logo.bottom() as f32 + EDGE * scale);
        let top = (layout.loader_center.1 - rows::HEIGHT * scale / 2.0)
            .min(layout.height as f32 - height - EDGE * scale)
            .max(below_logo);
        Rect {
            x: (layout.loader_center.0 - width / 2.0) as i32,
            y: top as i32,
            width: width as u32 + 1,
            height: height as u32 + 1,
        }
    }

    pub fn draw(&self, canvas: &mut PixmapMut, layout: &Layout, view: Transform, alpha: f32) {
        let scale = layout.scale;
        let area = self.area(layout);
        let left = area.x as f32;
        let top = area.y as f32;
        let width = area.width as f32 - 1.0;
        let first = self.selected.saturating_sub(VISIBLE_ROWS - 1);
        let shown = self.len().min(VISIBLE_ROWS);
        rows::draw(
            canvas,
            view,
            (left, top, width),
            scale,
            (first..first + shown).map(|index| self.title(index)),
            self.selected - first,
            alpha,
        );
        if let Some(hint) = self.hint() {
            let size = HINT_SIZE * scale;
            let baseline = top + shown as f32 * rows::HEIGHT * scale + 34.0 * scale;
            text::centered(
                canvas,
                view,
                &hint,
                (left + width / 2.0, baseline),
                size,
                0.6 * alpha,
            );
        }
    }
}
