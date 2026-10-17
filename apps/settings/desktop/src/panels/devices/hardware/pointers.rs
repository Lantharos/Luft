use std::fs;
use std::future::ready;
use std::io;

use futures_util::{Stream, StreamExt, stream};
use inotify::{EventOwned, EventStream, Inotify, WatchMask};

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

fn events() -> io::Result<EventStream<[u8; EVENT_BUFFER]>> {
    let inotify = Inotify::init()?;
    inotify.watches().add(
        UDEV_DATA,
        WatchMask::CREATE | WatchMask::CLOSE_WRITE | WatchMask::MOVED_TO | WatchMask::DELETE,
    )?;
    inotify.into_event_stream([0; EVENT_BUFFER])
}

fn is_input(event: &EventOwned) -> bool {
    event
        .name
        .as_ref()
        .is_some_and(|name| name.to_string_lossy().starts_with(INPUT_DEVICE_PREFIX))
}

pub fn changes() -> impl Stream<Item = ()> {
    let events = events()
        .inspect_err(|error| eprintln!("hardware: {error}"))
        .ok();
    stream::iter(events)
        .flatten()
        .take_while(|event| ready(event.is_ok()))
        .filter_map(|event| ready(event.ok().filter(is_input).map(drop)))
}
