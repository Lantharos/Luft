//! Non-blocking keyboard input from evdev (F1 debug, unlock field).

use std::fs::{File, OpenOptions};
use std::io::Read;
use std::os::unix::io::AsRawFd;
use std::path::Path;

const EV_KEY: u16 = 1;
const KEY_F1: u16 = 59;
const KEY_ENTER: u16 = 28;
const KEY_BACKSPACE: u16 = 14;
const KEY_SPACE: u16 = 57;

#[repr(C)]
struct InputEvent {
    tv_sec: i64,
    tv_usec: i64,
    type_: u16,
    code: u16,
    value: i32,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum KeyAction {
    ToggleDebug,
    Submit,
    Backspace,
    Char(char),
}

pub struct Keyboard {
    device: Option<File>,
}

impl Keyboard {
    pub fn open() -> Self {
        Self {
            device: open_input_device(),
        }
    }

    pub fn poll(&mut self) -> Option<KeyAction> {
        let device = self.device.as_mut()?;
        let mut event = InputEvent {
            tv_sec: 0,
            tv_usec: 0,
            type_: 0,
            code: 0,
            value: 0,
        };
        loop {
            let size = std::mem::size_of::<InputEvent>();
            let buf = unsafe {
                std::slice::from_raw_parts_mut(
                    &mut event as *mut InputEvent as *mut u8,
                    size,
                )
            };
            match device.read(buf) {
                Ok(n) if n == size => {
                    if event.type_ != EV_KEY || event.value != 1 {
                        continue;
                    }
                    return key_action(event.code);
                }
                Ok(_) => return None,
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => return None,
                Err(_) => {
                    self.device = None;
                    return None;
                }
            }
        }
    }
}

fn key_action(code: u16) -> Option<KeyAction> {
    match code {
        KEY_F1 => Some(KeyAction::ToggleDebug),
        KEY_ENTER => Some(KeyAction::Submit),
        KEY_BACKSPACE => Some(KeyAction::Backspace),
        KEY_SPACE => Some(KeyAction::Char(' ')),
        2..=10 => Some(KeyAction::Char(char::from_u32(b'1' as u32 + (code - 2) as u32)?)),
        11 => Some(KeyAction::Char('0')),
        16..=25 => Some(KeyAction::Char(char::from_u32(b'q' as u32 + (code - 16) as u32)?)),
        30..=38 => Some(KeyAction::Char(char::from_u32(b'a' as u32 + (code - 30) as u32)?)),
        44..=50 => Some(KeyAction::Char(char::from_u32(b'z' as u32 + (code - 44) as u32)?)),
        _ => None,
    }
}

fn open_input_device() -> Option<File> {
    for entry in std::fs::read_dir("/dev/input").ok()? {
        let entry = entry.ok()?;
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if !name.starts_with("event") {
            continue;
        }
        let path = entry.path();
        if let Some(file) = try_open_nonblocking(&path) {
            return Some(file);
        }
    }
    None
}

fn try_open_nonblocking(path: &Path) -> Option<File> {
    let file = OpenOptions::new().read(true).open(path).ok()?;
    let flags = unsafe { libc::fcntl(file.as_raw_fd(), libc::F_GETFL) };
    if flags < 0 {
        return None;
    }
    if unsafe { libc::fcntl(file.as_raw_fd(), libc::F_SETFL, flags | libc::O_NONBLOCK) } < 0 {
        return None;
    }
    Some(file)
}