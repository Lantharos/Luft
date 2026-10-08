use std::fs;
use std::sync::mpsc::Sender;

use inotify::{Inotify, WatchMask};

const UDEV_DATA: &str = "/run/udev/data";
const INPUT_DEVICE_PREFIX: &str = "c13:";
const MOUSE_PROPERTY: &str = "E:ID_INPUT_MOUSE=1";
const TOUCHPAD_PROPERTY: &str = "E:ID_INPUT_TOUCHPAD=1";
const EVENT_BUFFER: usize = 4096;

#[derive(Default)]
pub struct Pointers {
    pub mouse: bool,
    pub touchpad: bool,
}

pub fn detect() -> Pointers {
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

pub fn watch(changes: Sender<()>) {
    std::thread::spawn(move || {
        if let Err(error) = forward(&changes) {
            eprintln!("hardware: {error}");
        }
    });
}

fn forward(changes: &Sender<()>) -> std::io::Result<()> {
    let mut inotify = Inotify::init()?;
    inotify.watches().add(
        UDEV_DATA,
        WatchMask::CREATE | WatchMask::CLOSE_WRITE | WatchMask::MOVED_TO | WatchMask::DELETE,
    )?;
    let mut buffer = [0; EVENT_BUFFER];
    loop {
        let input = inotify.read_events_blocking(&mut buffer)?.any(|event| {
            event
                .name
                .is_some_and(|name| name.to_string_lossy().starts_with(INPUT_DEVICE_PREFIX))
        });
        if input && changes.send(()).is_err() {
            return Ok(());
        }
    }
}
