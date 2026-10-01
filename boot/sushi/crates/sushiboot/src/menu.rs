use alloc::format;
use alloc::string::String;
use core::time::Duration;

use sushi_scene::tiny_skia::{FillRule, Paint, PixmapMut, Rect as SkRect, Transform};
use sushi_scene::{FADE_SECONDS, Layout, Rect, Visuals, ease, pill, text};
use uefi::boot::{self, ScopedProtocol};
use uefi::proto::console::text::{Input, Key, ScanCode};

use crate::entries::{self, BootEntry};
use crate::loader_conf::LoaderConfig;
use crate::screen::Screen;

const FRAME: Duration = Duration::from_micros(16_667);
const ROW_HEIGHT: f32 = 44.0;
const ROW_WIDTH: f32 = 420.0;
const VISIBLE_ROWS: usize = 6;
const TITLE_SIZE: f32 = 15.0;
const HINT_SIZE: f32 = 13.0;

struct Menu<'a> {
    entries: &'a [BootEntry],
    selected: usize,
    countdown: Option<f32>,
}

fn open_input() -> Option<ScopedProtocol<Input>> {
    boot::open_protocol_exclusive::<Input>(boot::get_handle_for_protocol::<Input>().ok()?).ok()
}

fn read_key(input: &mut Option<ScopedProtocol<Input>>) -> Option<Key> {
    input.as_mut()?.read_key().ok().flatten()
}

fn is_enter(key: &Key) -> bool {
    matches!(key, Key::Printable(character) if matches!(char::from(*character), '\r' | '\n' | ' '))
}

impl Menu<'_> {
    fn area(&self, layout: &Layout) -> Rect {
        let scale = layout.scale;
        let rows = self.entries.len().min(VISIBLE_ROWS) as f32;
        let height = (rows * ROW_HEIGHT + 56.0) * scale;
        let width = ROW_WIDTH * scale;
        Rect {
            x: (layout.loader_center.0 - width / 2.0) as i32,
            y: (layout.loader_center.1 - ROW_HEIGHT * scale / 2.0) as i32,
            width: width as u32 + 1,
            height: height as u32 + 1,
        }
    }

    fn draw(
        &self,
        canvas: &mut PixmapMut,
        layout: &Layout,
        area: Rect,
        origin: (i32, i32),
        alpha: f32,
    ) {
        let scale = layout.scale;
        let left = (area.x - origin.0) as f32;
        let top = (area.y - origin.1) as f32;
        let width = area.width as f32 - 1.0;
        let first = self.selected.saturating_sub(VISIBLE_ROWS - 1);
        for (row, entry) in self
            .entries
            .iter()
            .enumerate()
            .skip(first)
            .take(VISIBLE_ROWS)
        {
            let y = top + (row - first) as f32 * ROW_HEIGHT * scale;
            if row == self.selected
                && let Some(shape) =
                    SkRect::from_xywh(left, y, width, ROW_HEIGHT * scale).and_then(pill)
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
            let brightness = if row == self.selected { 1.0 } else { 0.72 };
            let x = left + (width - text::width(&entry.title, size)) / 2.0;
            text::draw(
                canvas,
                &entry.title,
                (x, y + ROW_HEIGHT * scale / 2.0 + size * 0.36),
                size,
                brightness * alpha,
            );
        }
        if let Some(remaining) = self.countdown {
            let seconds = libm::ceilf(remaining).max(1.0) as u32;
            let hint: String = if seconds == 1 {
                "Starts in 1 second".into()
            } else {
                format!("Starts in {seconds} seconds")
            };
            let size = HINT_SIZE * scale;
            let baseline = top
                + self.entries.len().min(VISIBLE_ROWS) as f32 * ROW_HEIGHT * scale
                + 34.0 * scale;
            text::draw(
                canvas,
                &hint,
                (left + (width - text::width(&hint, size)) / 2.0, baseline),
                size,
                0.6 * alpha,
            );
        }
    }
}

pub fn choose(screen: &mut Screen, entries: &[BootEntry], config: &LoaderConfig) -> usize {
    let default = config
        .default_id
        .as_deref()
        .and_then(|id| entries::find_index_by_id(entries, id))
        .unwrap_or(0);
    let mut input = open_input();
    let asked = read_key(&mut input).is_some();
    if entries.len() < 2 || (config.timeout_secs == 0 && !asked) {
        return default;
    }

    let mut menu = Menu {
        entries,
        selected: default,
        countdown: (!asked).then_some(config.timeout_secs as f32),
    };
    let mut shown = 0.0f32;
    let mut leaving: Option<f32> = None;
    loop {
        let alpha = match leaving {
            Some(since) => 1.0 - ease((shown - since) / FADE_SECONDS),
            None => ease(shown / FADE_SECONDS),
        };
        let layout = screen.scene.layout;
        let area = menu.area(&layout);
        screen.draw(
            area,
            &Visuals {
                seconds: shown,
                logo: 1.0,
                ..Visuals::default()
            },
            |canvas, origin| {
                menu.draw(canvas, &layout, area, origin, alpha);
            },
        );
        if leaving.is_some_and(|since| shown - since >= FADE_SECONDS) {
            return menu.selected;
        }
        boot::stall(FRAME);
        shown += FRAME.as_secs_f32();

        if leaving.is_some() {
            continue;
        }
        if let Some(key) = read_key(&mut input) {
            menu.countdown = None;
            match key {
                Key::Special(ScanCode::UP) => {
                    menu.selected = menu.selected.checked_sub(1).unwrap_or(entries.len() - 1)
                }
                Key::Special(ScanCode::DOWN) => menu.selected = (menu.selected + 1) % entries.len(),
                key if is_enter(&key) => leaving = Some(shown),
                _ => {}
            }
        }
        if let Some(remaining) = menu.countdown.as_mut() {
            *remaining -= FRAME.as_secs_f32();
            if *remaining <= 0.0 {
                menu.countdown = None;
                leaving = Some(shown);
            }
        }
    }
}
