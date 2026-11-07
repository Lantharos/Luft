use alloc::string::String;
use alloc::vec::Vec;

use tiny_skia::{FillRule, Paint, PathBuilder, PixmapMut, Rect as SkRect, Transform};

use crate::{Layout, Rect, text};

const FIELD_WIDTH: f32 = 340.0;
const FIELD_HEIGHT: f32 = 46.0;
const KEY_FIELD_WIDTH: f32 = 560.0;
const KEY_FIELD_HEIGHT: f32 = 96.0;
const TITLE_SIZE: f32 = 17.0;
const EXPLANATION_SIZE: f32 = 14.0;
const NOTE_SIZE: f32 = 13.0;
const KEY_SIZE: f32 = 19.0;
const LINE_HEIGHT: f32 = 20.0;
const MOST_LINES: usize = 3;
const DOT_RADIUS: f32 = 3.5;
const DOT_SPACING: f32 = 14.0;
const PADDING: f32 = 20.0;
const SHAKE_SECONDS: f32 = 0.42;
const KEY_ROWS: usize = 2;
const KEY_GROUPS_PER_ROW: usize = 4;
const KEY_GROUP_LETTERS: usize = 8;
const KEY_CELL: f32 = 14.0;
const KEY_GROUP_GAP: f32 = 18.0;
const KEY_ROW_GAP: f32 = 36.0;
const EMPTY_CELL_RADIUS: f32 = 1.8;

#[derive(Clone, Default, PartialEq)]
pub struct ShownKey(String);

impl ShownKey {
    pub fn new(letters: String) -> Self {
        Self(letters)
    }
}

impl core::fmt::Debug for ShownKey {
    fn fmt(&self, formatter: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        write!(formatter, "ShownKey({} letters)", self.0.chars().count())
    }
}

impl Drop for ShownKey {
    fn drop(&mut self) {
        for byte in unsafe { self.0.as_bytes_mut() } {
            unsafe { core::ptr::write_volatile(byte, 0) };
        }
    }
}

#[derive(Debug, Clone, Default, PartialEq)]
pub struct Prompt {
    pub title: String,
    pub explanation: Vec<String>,
    pub placeholder: String,
    pub typed: usize,
    pub key: Option<ShownKey>,
    pub note: Option<(String, f32)>,
    pub shake_started: Option<f32>,
}

struct Geometry {
    field: SkRect,
    note_baseline: f32,
    scale: f32,
}

fn geometry(layout: &Layout, for_key: bool) -> Geometry {
    let scale = layout.scale;
    let (cx, cy) = layout.loader_center;
    let (width, height) = if for_key {
        (KEY_FIELD_WIDTH * scale, KEY_FIELD_HEIGHT * scale)
    } else {
        (FIELD_WIDTH * scale, FIELD_HEIGHT * scale)
    };
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
    let geometry = geometry(layout, true);
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

fn draw_dots(
    pixmap: &mut PixmapMut,
    geometry: &Geometry,
    shift: Transform,
    typed: usize,
    alpha: f32,
) {
    let (field, scale) = (geometry.field, geometry.scale);
    let dot_y = field.top() + field.height() / 2.0;
    let first_x = field.left() + PADDING * scale;
    let room =
        libm::floorf((field.width() - PADDING * 2.0 * scale) / (DOT_SPACING * scale)) as usize;
    let mut paint = Paint {
        anti_alias: true,
        ..Paint::default()
    };
    paint.set_color_rgba8(255, 255, 255, (alpha * 255.0) as u8);
    let mut dots = PathBuilder::new();
    for index in 0..typed.min(room) {
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

fn draw_key(
    pixmap: &mut PixmapMut,
    geometry: &Geometry,
    shift: Transform,
    key: &ShownKey,
    alpha: f32,
) {
    let scale = geometry.scale;
    let cell = KEY_CELL * scale;
    let group = KEY_GROUP_LETTERS as f32 * cell;
    let row_width =
        KEY_GROUPS_PER_ROW as f32 * group + (KEY_GROUPS_PER_ROW - 1) as f32 * KEY_GROUP_GAP * scale;
    let left = geometry.field.left() + (geometry.field.width() - row_width) / 2.0;
    let middle = geometry.field.top() + geometry.field.height() / 2.0;
    let first_row = middle - KEY_ROW_GAP * scale / 2.0;
    let mut letters = key.0.chars();
    let mut empty = PathBuilder::new();
    for index in 0..KEY_ROWS * KEY_GROUPS_PER_ROW * KEY_GROUP_LETTERS {
        let row = index / (KEY_GROUPS_PER_ROW * KEY_GROUP_LETTERS);
        let in_row = index % (KEY_GROUPS_PER_ROW * KEY_GROUP_LETTERS);
        let gaps = (in_row / KEY_GROUP_LETTERS) as f32 * KEY_GROUP_GAP * scale;
        let center = left + gaps + in_row as f32 * cell + cell / 2.0;
        let line = first_row + row as f32 * KEY_ROW_GAP * scale;
        match letters.next() {
            Some(letter) => {
                let mut encoded = [0u8; 4];
                text::centered(
                    pixmap,
                    shift,
                    letter.encode_utf8(&mut encoded),
                    (center, line + KEY_SIZE * scale * 0.36),
                    KEY_SIZE * scale,
                    alpha,
                );
            }
            None => empty.push_circle(center, line, EMPTY_CELL_RADIUS * scale),
        }
    }
    let mut paint = Paint {
        anti_alias: true,
        ..Paint::default()
    };
    paint.set_color_rgba8(255, 255, 255, (0.35 * alpha * 255.0) as u8);
    if let Some(empty) = empty.finish() {
        pixmap.fill_path(&empty, &paint, FillRule::Winding, shift, None);
    }
}

pub fn draw(
    pixmap: &mut PixmapMut,
    layout: &Layout,
    view: Transform,
    prompt: &Prompt,
    seconds: f32,
    alpha: f32,
) {
    let geometry = geometry(layout, prompt.key.is_some());
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
    let corner_radius = (FIELD_HEIGHT / 2.0 * scale).min(field.height() / 2.0);
    if let Some(shape) = crate::rounded(field, corner_radius) {
        pixmap.fill_path(&shape, &paint, FillRule::Winding, shift, None);
    }

    match &prompt.key {
        Some(key) => draw_key(pixmap, &geometry, shift, key, alpha),
        None if prompt.typed == 0 => text::draw(
            pixmap,
            shift,
            &prompt.placeholder,
            (
                field.left() + PADDING * scale,
                field.top() + field.height() / 2.0 + NOTE_SIZE * scale * 0.36,
            ),
            15.0 * scale,
            0.5 * alpha,
        ),
        None => draw_dots(pixmap, &geometry, shift, prompt.typed, alpha),
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
