use alloc::string::String;
use alloc::vec::Vec;

use tiny_skia::{FillRule, Paint, PathBuilder, PixmapMut, Rect as SkRect, Transform};

use crate::text;

pub const LETTERS_HEIGHT: f32 = 96.0;
pub const WORDS_HEIGHT: f32 = 184.0;
const LETTER_SIZE: f32 = 19.0;
const LETTER_ROWS: usize = 2;
const LETTER_GROUPS_PER_ROW: usize = 4;
const LETTER_GROUP: usize = 8;
const LETTER_CELL: f32 = 14.0;
const LETTER_GROUP_GAP: f32 = 18.0;
const LETTER_ROW_GAP: f32 = 36.0;
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
pub enum ShownKey {
    Letters(Shown),
    Words { slots: Vec<Slot>, current: usize },
}

impl core::fmt::Debug for ShownKey {
    fn fmt(&self, formatter: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match self {
            Self::Letters(letters) => {
                write!(formatter, "Letters({} typed)", letters.0.chars().count())
            }
            Self::Words { slots, current } => {
                write!(formatter, "Words({} typed, at {current})", slots.len())
            }
        }
    }
}

impl ShownKey {
    pub fn height(&self) -> f32 {
        match self {
            Self::Letters(_) => LETTERS_HEIGHT,
            Self::Words { .. } => WORDS_HEIGHT,
        }
    }
}

fn paint(alpha: f32) -> Paint<'static> {
    let mut paint = Paint {
        anti_alias: true,
        ..Paint::default()
    };
    paint.set_color_rgba8(255, 255, 255, (alpha.clamp(0.0, 1.0) * 255.0) as u8);
    paint
}

pub fn draw(
    pixmap: &mut PixmapMut,
    field: SkRect,
    scale: f32,
    shift: Transform,
    key: &ShownKey,
    alpha: f32,
) {
    match key {
        ShownKey::Letters(letters) => draw_letters(pixmap, field, scale, shift, &letters.0, alpha),
        ShownKey::Words { slots, current } => {
            draw_words(pixmap, field, scale, shift, slots, *current, alpha)
        }
    }
}

fn draw_letters(
    pixmap: &mut PixmapMut,
    field: SkRect,
    scale: f32,
    shift: Transform,
    letters: &str,
    alpha: f32,
) {
    let cell = LETTER_CELL * scale;
    let group = LETTER_GROUP as f32 * cell;
    let row_width = LETTER_GROUPS_PER_ROW as f32 * group
        + (LETTER_GROUPS_PER_ROW - 1) as f32 * LETTER_GROUP_GAP * scale;
    let left = field.left() + (field.width() - row_width) / 2.0;
    let middle = field.top() + field.height() / 2.0;
    let first_row = middle - LETTER_ROW_GAP * scale / 2.0;
    let mut letters = letters.chars().flat_map(char::to_uppercase);
    let mut empty = PathBuilder::new();
    for index in 0..LETTER_ROWS * LETTER_GROUPS_PER_ROW * LETTER_GROUP {
        let row = index / (LETTER_GROUPS_PER_ROW * LETTER_GROUP);
        let in_row = index % (LETTER_GROUPS_PER_ROW * LETTER_GROUP);
        let gaps = (in_row / LETTER_GROUP) as f32 * LETTER_GROUP_GAP * scale;
        let center = left + gaps + in_row as f32 * cell + cell / 2.0;
        let line = first_row + row as f32 * LETTER_ROW_GAP * scale;
        match letters.next() {
            Some(letter) => {
                let mut encoded = [0u8; 4];
                text::centered(
                    pixmap,
                    shift,
                    letter.encode_utf8(&mut encoded),
                    (center, line + LETTER_SIZE * scale * 0.36),
                    LETTER_SIZE * scale,
                    alpha,
                );
            }
            None => empty.push_circle(center, line, EMPTY_CELL_RADIUS * scale),
        }
    }
    if let Some(empty) = empty.finish() {
        pixmap.fill_path(&empty, &paint(0.35 * alpha), FillRule::Winding, shift, None);
    }
}

fn draw_words(
    pixmap: &mut PixmapMut,
    field: SkRect,
    scale: f32,
    shift: Transform,
    slots: &[Slot],
    current: usize,
    alpha: f32,
) {
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
                        pixmap.fill_rect(mistake, &paint(0.7 * alpha), shift, None);
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
                pixmap.fill_rect(caret, &paint(0.9 * alpha), shift, None);
            }
        }
    }
    if let Some(empty) = empty.finish() {
        pixmap.fill_path(&empty, &paint(0.35 * alpha), FillRule::Winding, shift, None);
    }
}
