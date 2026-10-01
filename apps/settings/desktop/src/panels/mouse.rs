use std::fs;

use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Serialize;
use serde_json::Value;

const UDEV_DATA: &str = "/run/udev/data";
const INPUT_DEVICE_PREFIX: &str = "c13:";
const MOUSE_PROPERTY: &str = "E:ID_INPUT_MOUSE=1";
const TOUCHPAD_PROPERTY: &str = "E:ID_INPUT_TOUCHPAD=1";

#[derive(Serialize, Default)]
struct Pointers {
    mouse: bool,
    touchpad: bool,
}

fn pointers() -> Pointers {
    fs::read_dir(UDEV_DATA)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| {
            entry
                .file_name()
                .to_string_lossy()
                .starts_with(INPUT_DEVICE_PREFIX)
        })
        .filter_map(|entry| fs::read_to_string(entry.path()).ok())
        .fold(Pointers::default(), |found, data| {
            let touchpad = data.lines().any(|line| line == TOUCHPAD_PROPERTY);
            let mouse = !touchpad && data.lines().any(|line| line == MOUSE_PROPERTY);
            Pointers {
                mouse: found.mouse || mouse,
                touchpad: found.touchpad || touchpad,
            }
        })
}

pub fn register(window: SabineWindow, _events: &Events) -> SabineWindow {
    window.command("mouse_pointers", |_: Value| Ok(pointers()))
}
