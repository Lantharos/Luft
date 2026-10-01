mod view;

use core::time::Duration;

use sushi_scene::{FADE_SECONDS, Visuals, ease};
use uefi::boot;
use uefi::proto::console::text::{Key, ScanCode};
use uefi::system;

use crate::entries::{Catalog, Row};
use crate::screen::Screen;
use view::{List, View};

const FRAME: Duration = Duration::from_micros(16_667);
const BACKSPACE: char = '\u{8}';

fn read_key() -> Option<Key> {
    system::with_stdin(|input| input.read_key().ok().flatten())
}

fn is_enter(key: &Key) -> bool {
    match key {
        Key::Printable(character) => matches!(char::from(*character), '\r' | '\n' | ' '),
        Key::Special(code) => *code == ScanCode::RIGHT,
    }
}

fn is_back(key: &Key) -> bool {
    match key {
        Key::Printable(character) => char::from(*character) == BACKSPACE,
        Key::Special(code) => matches!(*code, ScanCode::ESCAPE | ScanCode::LEFT),
    }
}

fn main_row(catalog: &Catalog, entry: usize) -> usize {
    let wanted = if catalog.previous.contains(&entry) {
        Row::Previous
    } else {
        Row::Entry(entry)
    };
    catalog
        .main
        .iter()
        .position(|row| *row == wanted)
        .unwrap_or(0)
}

pub fn choose(screen: &mut Screen, catalog: &Catalog, default: usize, timeout: u32) -> usize {
    let asked = read_key().is_some();
    if catalog.main.len() < 2 || (timeout == 0 && !asked) {
        return default;
    }

    let mut view = View {
        catalog,
        list: List::Main,
        selected: main_row(catalog, default),
        countdown: (!asked).then_some(timeout as f32),
    };
    let mut chosen = None;
    let mut shown = 0.0f32;
    let mut opened = 0.0f32;
    let mut leaving: Option<f32> = None;
    loop {
        let alpha = match leaving {
            Some(since) => 1.0 - ease((shown - since) / FADE_SECONDS),
            None => ease(shown / FADE_SECONDS) * ease((shown - opened) / FADE_SECONDS),
        };
        let layout = screen.scene.layout;
        screen.draw(
            view.area(&layout),
            &Visuals {
                seconds: shown,
                logo: 1.0,
                ..Visuals::default()
            },
            |canvas, origin| view.draw(canvas, &layout, origin, alpha),
        );
        if leaving.is_some_and(|since| shown - since >= FADE_SECONDS) {
            return chosen.unwrap_or(default);
        }
        boot::stall(FRAME);
        shown += FRAME.as_secs_f32();
        if leaving.is_some() {
            continue;
        }

        if let Some(key) = read_key() {
            view.countdown = None;
            let rows = view.len();
            match key {
                Key::Special(ScanCode::UP) => view.selected = (view.selected + rows - 1) % rows,
                Key::Special(ScanCode::DOWN) => view.selected = (view.selected + 1) % rows,
                key if is_back(&key) && view.list == List::Previous => {
                    view.list = List::Main;
                    view.selected = main_row(catalog, catalog.previous[0]);
                    opened = shown;
                }
                key if is_enter(&key) => match view.row(view.selected) {
                    Row::Previous => {
                        view.list = List::Previous;
                        view.selected = 0;
                        opened = shown;
                    }
                    Row::Entry(entry) => {
                        chosen = Some(entry);
                        leaving = Some(shown);
                    }
                },
                _ => {}
            }
        }
        if let Some(remaining) = view.countdown.as_mut() {
            *remaining -= FRAME.as_secs_f32();
            if *remaining <= 0.0 {
                view.countdown = None;
                leaving = Some(shown);
            }
        }
    }
}
