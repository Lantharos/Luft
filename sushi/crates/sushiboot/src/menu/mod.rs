mod clock;
mod keys;
mod view;

use alloc::format;
use core::time::Duration;

use sushi_scene::{FADE_SECONDS, Visuals, ease};
use uefi::boot;
use uefi::proto::console::text::{Key, ScanCode};

use crate::entries::{Catalog, Row};
use crate::screen::Screen;
use clock::CycleClock;
use keys::Wait;
use view::{List, View};

const FRAME: Duration = Duration::from_micros(16_667);
const LONGEST_WAIT: Duration = Duration::from_millis(100);
const BACKSPACE: char = '\u{8}';

pub struct Choice {
    pub entry: usize,
    pub picked: bool,
}

impl Choice {
    pub fn unasked(entry: usize) -> Self {
        Self {
            entry,
            picked: false,
        }
    }
}

fn until_the_countdown_changes(remaining: f32) -> Duration {
    Duration::from_secs_f32((remaining - libm::ceilf(remaining) + 1.0).max(0.0))
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

pub fn choose(
    screen: &mut Screen,
    catalog: &Catalog,
    default: usize,
    timeout: u32,
    failed: Option<&str>,
) -> Choice {
    let asked = keys::read().is_some() || failed.is_some();
    if failed.is_none() && (catalog.main.len() < 2 || (timeout == 0 && !asked)) {
        return Choice::unasked(default);
    }
    if failed.is_some() {
        screen.draw(
            screen.scene.everything(),
            &Visuals {
                logo: 1.0,
                ..Visuals::default()
            },
            |_, _| {},
        );
    }

    let mut view = View {
        catalog,
        list: List::Main,
        selected: main_row(catalog, default),
        countdown: (!asked).then_some(timeout as f32),
        notice: failed.map(|title| format!("{title} didn't start")),
    };
    let clock = CycleClock::calibrate();
    let wait = Wait::new();
    let mut chosen = None;
    let mut shown = 0.0f32;
    let mut opened = 0.0f32;
    let mut leaving: Option<f32> = None;
    let mut changed = true;
    loop {
        if changed {
            let alpha = match leaving {
                Some(since) => 1.0 - ease((shown - since) / FADE_SECONDS),
                None => ease(shown / FADE_SECONDS) * ease((shown - opened) / FADE_SECONDS),
            };
            let layout = screen.scene.layout;
            screen.draw(
                screen.scene.project(view.area(&layout)),
                &Visuals {
                    seconds: shown,
                    logo: 1.0,
                    ..Visuals::default()
                },
                |canvas, transform| view.draw(canvas, &layout, transform, alpha),
            );
        }
        if leaving.is_some_and(|since| shown - since >= FADE_SECONDS) {
            return Choice {
                entry: chosen.unwrap_or(default),
                picked: chosen.is_some(),
            };
        }
        let fading = leaving.is_some() || shown - opened < FADE_SECONDS;
        let limit = if fading {
            FRAME
        } else {
            view.countdown
                .map_or(LONGEST_WAIT, until_the_countdown_changes)
                .min(LONGEST_WAIT)
        };
        match &wait {
            Some(wait) if !fading => wait.for_a_key_or(limit),
            _ => boot::stall(limit),
        }
        let elapsed = clock
            .as_ref()
            .map_or(limit.as_secs_f32(), |clock| clock.seconds() - shown);
        shown += elapsed;
        changed = fading;
        if leaving.is_some() {
            continue;
        }

        if let Some(key) = keys::read() {
            changed = true;
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
            let seconds = libm::ceilf(*remaining);
            *remaining -= elapsed;
            changed |= libm::ceilf(*remaining) != seconds;
            if *remaining <= 0.0 {
                view.countdown = None;
                leaving = Some(shown);
            }
        }
    }
}
