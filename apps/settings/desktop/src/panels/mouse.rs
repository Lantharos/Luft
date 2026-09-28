use std::fs;

use sabine::SabineWindow;
use serde_json::Value;

use crate::bridge::Commands;
use crate::events::Events;

const UDEV_DATA: &str = "/run/udev/data";
const INPUT_DEVICE_PREFIX: &str = "c13:";
const TOUCHPAD_PROPERTY: &str = "E:ID_INPUT_TOUCHPAD=1";

fn has_touchpad() -> bool {
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
        .any(|entry| {
            fs::read_to_string(entry.path())
                .is_ok_and(|data| data.lines().any(|line| line == TOUCHPAD_PROPERTY))
        })
}

pub fn register(window: SabineWindow, _events: &Events) -> SabineWindow {
    window.command("mouse_has_touchpad", |_: Value| Ok(has_touchpad()))
}
