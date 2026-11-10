use alloc::string::String;
use alloc::vec::Vec;

use tiny_skia::{FillRule, PathBuilder, PixmapMut, Rect as SkRect, Transform};

use crate::{text, white};

pub const HEIGHT: f32 = 184.0;
const EMPTY_CELL_RADIUS: f32 = 1.8;
const WORD_SIZE: f32 = 19.0;
const NUMBER_SIZE: f32 = 13.0;
const WORD_COLUMNS: usize = 3;
const WORD_ROWS: usize = 4;
const WORD_COLUMN: f32 = 164.0;
const WORD_ROW_GAP: f32 = 38.0;
const NUMBER_WIDTH: f32 = 22.0;
const NUMBER_GAP: f32 = 10.0;
const CARET_WIDTH: f32 = 1.5;
const MISTAKE_HEIGHT: f32 = 1.5;

#[derive(Clone, Default, PartialEq)]
pub struct Shown(String);

impl Shown {
    pub fn new(text: String) -> Self {
        Self(text)
    }
}

impl Drop for Shown {
    fn drop(&mut self) {
        for byte in unsafe { self.0.as_bytes_mut() } {
            unsafe { core::ptr::write_volatile(byte, 0) };
        }
    }
}

#[derive(Clone, Default, PartialEq)]
pub struct Slot {
    pub typed: Shown,
    pub rest: Shown,
    pub known: bool,
}

#[derive(Clone, PartialEq)]
pub struct ShownKey {
    pub slots: Vec<Slot>,
    pub current: usize,
}

impl core::fmt::Debug for ShownKey {
    fn fmt(&self, formatter: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        write!(
            formatter,
            "ShownKey({} typed, at {})",
            self.slots.len(),
            self.current
        )
    }
}

pub fn draw(
    pixmap: &mut PixmapMut,
    field: SkRect,
    scale: f32,
    shift: Transform,
    key: &ShownKey,
    alpha: f32,
) {
    let ShownKey { slots, current } = key;
    let current = *current;
    let size = WORD_SIZE * scale;
    let left = field.left() + (field.width() - WORD_COLUMNS as f32 * WORD_COLUMN * scale) / 2.0;
    let first_row =
        field.top() + field.height() / 2.0 - (WORD_ROWS - 1) as f32 * WORD_ROW_GAP * scale / 2.0;
    let mut empty = PathBuilder::new();
    for index in 0..WORD_COLUMNS * WORD_ROWS {
        let column = left + (index % WORD_COLUMNS) as f32 * WORD_COLUMN * scale;
        let line = first_row + (index / WORD_COLUMNS) as f32 * WORD_ROW_GAP * scale;
        let baseline = line + size * 0.36;
        let number = alloc::format!("{}", index + 1);
        let number = number.as_str();
        let number_size = NUMBER_SIZE * scale;
        text::draw(
            pixmap,
            shift,
            number,
            (
                column + NUMBER_WIDTH * scale - text::width(number, number_size),
                baseline,
            ),
            number_size,
            0.42 * alpha,
        );
        let word_left = column + (NUMBER_WIDTH + NUMBER_GAP) * scale;
        let typed_width = match slots.get(index) {
            Some(slot) => {
                text::draw(
                    pixmap,
                    shift,
                    &slot.typed.0,
                    (word_left, baseline),
                    size,
                    alpha,
                );
                let width = text::width(&slot.typed.0, size);
                text::draw(
                    pixmap,
                    shift,
                    &slot.rest.0,
                    (word_left + width, baseline),
                    size,
                    0.38 * alpha,
                );
                if !slot.known {
                    let mistake = SkRect::from_xywh(
                        word_left,
                        baseline + 5.0 * scale,
                        width,
                        MISTAKE_HEIGHT * scale,
                    );
                    if let Some(mistake) = mistake {
                        pixmap.fill_rect(mistake, &white(0.7 * alpha), shift, None);
                    }
                }
                width
            }
            None => {
                if index != current {
                    empty.push_circle(
                        word_left + EMPTY_CELL_RADIUS * scale,
                        line,
                        EMPTY_CELL_RADIUS * scale,
                    );
                }
                0.0
            }
        };
        if index == current {
            let caret = SkRect::from_xywh(
                word_left + typed_width + scale,
                line - size * 0.42,
                CARET_WIDTH * scale,
                size * 0.84,
            );
            if let Some(caret) = caret {
                pixmap.fill_rect(caret, &white(0.9 * alpha), shift, None);
            }
        }
    }
    if let Some(empty) = empty.finish() {
        pixmap.fill_path(&empty, &white(0.35 * alpha), FillRule::Winding, shift, None);
    }
}
