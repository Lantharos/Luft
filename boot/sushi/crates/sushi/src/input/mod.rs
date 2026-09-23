//! Non-blocking keyboard input from evdev (F1 debug, unlock field).

use std::collections::HashSet;
use std::fs::{self, File, OpenOptions};
use std::io::Read;
use std::os::unix::io::AsRawFd;
use std::path::{Path, PathBuf};

const EV_KEY: u16 = 1;
const KEY_F1: u16 = 59;
const KEY_ENTER: u16 = 28;
const KEY_BACKSPACE: u16 = 14;
const KEY_SPACE: u16 = 57;
const KEY_A: u16 = 30;
const EVIOCGRAB: libc::c_ulong = 0x4004_4590;

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

enum InputKind {
    Evdev,
    Tty,
}

struct InputDevice {
    path: PathBuf,
    label: String,
    file: File,
    kind: InputKind,
}

pub struct Keyboard {
    devices: Vec<InputDevice>,
}

impl Keyboard {
    pub fn open() -> Self {
        let mut keyboard = Self { devices: Vec::new() };
        keyboard.refresh();
        keyboard
    }

    /// Merge any newly enumerated input nodes (USB keyboards often appear after PS/2).
    pub fn refresh(&mut self) -> bool {
        let discovered = discover_input_devices();
        let known: HashSet<_> = self.devices.iter().map(|d| d.path.clone()).collect();
        let mut changed = false;
        for device in discovered {
            if known.contains(&device.path) {
                continue;
            }
            changed = true;
            self.devices.push(device);
        }
        changed
    }

    pub fn reopen(&mut self) {
        self.devices = discover_input_devices();
    }

    pub fn is_connected(&self) -> bool {
        !self.devices.is_empty()
    }

    pub fn source_label(&self) -> String {
        if self.devices.is_empty() {
            return "none".to_string();
        }
        self.devices
            .iter()
            .map(|device| device.label.as_str())
            .collect::<Vec<_>>()
            .join(", ")
    }

    pub fn poll(&mut self) -> Option<KeyAction> {
        for device in &mut self.devices {
            let action = match device.kind {
                InputKind::Evdev => poll_evdev(&mut device.file),
                InputKind::Tty => poll_tty(&mut device.file),
            };
            if action.is_some() {
                return action;
            }
        }
        None
    }
}

fn poll_evdev(device: &mut File) -> Option<KeyAction> {
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
                if event.type_ != EV_KEY || event.value == 0 {
                    continue;
                }
                if event.value != 1 && event.value != 2 {
                    continue;
                }
                let Some(action) = key_action(event.code) else {
                    continue;
                };
                if event.value == 2 {
                    match action {
                        KeyAction::Backspace | KeyAction::Char(_) => return Some(action),
                        _ => continue,
                    }
                }
                return Some(action);
            }
            Ok(_) => return None,
            Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => return None,
            Err(_) => return None,
        }
    }
}

fn poll_tty(tty: &mut File) -> Option<KeyAction> {
    let mut byte = [0u8; 1];
    match tty.read(&mut byte) {
        Ok(1) => tty_byte_action(byte[0]),
        Ok(_) => None,
        Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => None,
        Err(_) => None,
    }
}

fn tty_byte_action(byte: u8) -> Option<KeyAction> {
    match byte {
        b'\n' | b'\r' => Some(KeyAction::Submit),
        0x7f | 0x08 => Some(KeyAction::Backspace),
        b' ' => Some(KeyAction::Char(' ')),
        b'0'..=b'9' | b'a'..=b'z' | b'A'..=b'Z' => Some(KeyAction::Char(byte as char)),
        _ => None,
    }
}

fn key_action(code: u16) -> Option<KeyAction> {
    match code {
        KEY_F1 => Some(KeyAction::ToggleDebug),
        KEY_ENTER => Some(KeyAction::Submit),
        KEY_BACKSPACE => Some(KeyAction::Backspace),
        KEY_SPACE => Some(KeyAction::Char(' ')),
        2 => Some(KeyAction::Char('1')),
        3 => Some(KeyAction::Char('2')),
        4 => Some(KeyAction::Char('3')),
        5 => Some(KeyAction::Char('4')),
        6 => Some(KeyAction::Char('5')),
        7 => Some(KeyAction::Char('6')),
        8 => Some(KeyAction::Char('7')),
        9 => Some(KeyAction::Char('8')),
        10 => Some(KeyAction::Char('9')),
        11 => Some(KeyAction::Char('0')),
        16 => Some(KeyAction::Char('q')),
        17 => Some(KeyAction::Char('w')),
        18 => Some(KeyAction::Char('e')),
        19 => Some(KeyAction::Char('r')),
        20 => Some(KeyAction::Char('t')),
        21 => Some(KeyAction::Char('y')),
        22 => Some(KeyAction::Char('u')),
        23 => Some(KeyAction::Char('i')),
        24 => Some(KeyAction::Char('o')),
        25 => Some(KeyAction::Char('p')),
        30 => Some(KeyAction::Char('a')),
        31 => Some(KeyAction::Char('s')),
        32 => Some(KeyAction::Char('d')),
        33 => Some(KeyAction::Char('f')),
        34 => Some(KeyAction::Char('g')),
        35 => Some(KeyAction::Char('h')),
        36 => Some(KeyAction::Char('j')),
        37 => Some(KeyAction::Char('k')),
        38 => Some(KeyAction::Char('l')),
        44 => Some(KeyAction::Char('z')),
        45 => Some(KeyAction::Char('x')),
        46 => Some(KeyAction::Char('c')),
        47 => Some(KeyAction::Char('v')),
        48 => Some(KeyAction::Char('b')),
        49 => Some(KeyAction::Char('n')),
        50 => Some(KeyAction::Char('m')),
        71 => Some(KeyAction::Char('7')),
        72 => Some(KeyAction::Char('8')),
        73 => Some(KeyAction::Char('9')),
        75 => Some(KeyAction::Char('4')),
        76 => Some(KeyAction::Char('5')),
        77 => Some(KeyAction::Char('6')),
        79 => Some(KeyAction::Char('1')),
        80 => Some(KeyAction::Char('2')),
        81 => Some(KeyAction::Char('3')),
        82 => Some(KeyAction::Char('0')),
        _ => None,
    }
}

fn discover_input_devices() -> Vec<InputDevice> {
    let mut devices = discover_keyboard_devices();
    devices.extend(discover_tty_devices());
    devices
}

fn discover_keyboard_devices() -> Vec<InputDevice> {
    let mut events = fs::read_dir("/dev/input")
        .ok()
        .into_iter()
        .flatten()
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .filter(|path| {
            path.file_name()
                .and_then(|name| name.to_str())
                .is_some_and(|name| name.starts_with("event"))
        })
        .collect::<Vec<_>>();

    events.sort_by(|left, right| keyboard_device_priority(left).cmp(&keyboard_device_priority(right)));

    let mut devices = Vec::new();
    for path in events {
        if !is_keyboard_device(&path) {
            continue;
        }
        let label = input_device_label(&path);
        if let Some(file) = try_open_evdev(&path) {
            devices.push(InputDevice {
                path,
                label,
                file,
                kind: InputKind::Evdev,
            });
        }
    }
    devices
}

fn keyboard_device_priority(path: &Path) -> (i32, String) {
    let event_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or_default()
        .to_string();
    let sysfs_link = format!("/sys/class/input/{event_name}");
    let bus = fs::read_link(&sysfs_link)
        .ok()
        .map(|link| link.to_string_lossy().to_ascii_lowercase())
        .unwrap_or_default();
    let usb_first = if bus.contains("/usb") { 0 } else { 1 };
    (usb_first, event_name)
}

fn discover_tty_devices() -> Vec<InputDevice> {
    let mut devices = Vec::new();
    for path in ["/dev/tty0", "/dev/tty1", "/dev/ttyS0", "/dev/console"] {
        let path_buf = PathBuf::from(path);
        if let Some(file) = try_open_nonblocking(&path_buf) {
            devices.push(InputDevice {
                path: path_buf,
                label: path.to_string(),
                file,
                kind: InputKind::Tty,
            });
        }
    }
    devices
}

fn is_keyboard_device(path: &Path) -> bool {
    let Some(event_name) = path.file_name().and_then(|name| name.to_str()) else {
        return false;
    };
    let sysfs = format!("/sys/class/input/{event_name}/device");

    if let Ok(name) = fs::read_to_string(format!("{sysfs}/name")) {
        let lower = name.trim().to_ascii_lowercase();
        if lower.contains("keyboard") {
            return true;
        }
        if lower.contains("mouse")
            || lower.contains("tablet")
            || lower.contains("touchpad")
            || lower.contains("power button")
            || lower.contains("sleep button")
            || lower.contains("lid")
        {
            return false;
        }
    }

    let Ok(keys) = fs::read_to_string(format!("{sysfs}/capabilities/key")) else {
        return false;
    };
    ev_key_supported(keys.trim(), KEY_A) && ev_key_supported(keys.trim(), KEY_ENTER)
}

fn input_device_label(path: &Path) -> String {
    let Some(event_name) = path.file_name().and_then(|name| name.to_str()) else {
        return path.display().to_string();
    };
    let name_path = format!("/sys/class/input/{event_name}/device/name");
    let bus_hint = keyboard_bus_hint(event_name);
    if let Ok(name) = fs::read_to_string(&name_path) {
        let name = name.trim();
        if !name.is_empty() {
            return format!("{event_name} ({name}{bus_hint})");
        }
    }
    format!("{event_name}{bus_hint}")
}

fn keyboard_bus_hint(event_name: &str) -> String {
    let sysfs_link = format!("/sys/class/input/{event_name}");
    let Ok(link) = fs::read_link(&sysfs_link) else {
        return String::new();
    };
    let path = link.to_string_lossy().to_ascii_lowercase();
    if path.contains("/usb") {
        ", usb".to_string()
    } else if path.contains("i8042") {
        ", ps2".to_string()
    } else {
        String::new()
    }
}

fn ev_key_supported(cap_hex: &str, code: u16) -> bool {
    let byte_index = (code / 8) as usize;
    let bit = code % 8;
    let bytes = parse_capability_hex(cap_hex);
    if byte_index >= bytes.len() {
        return false;
    }
    (bytes[byte_index] >> bit) & 1 == 1
}

fn parse_capability_hex(cap_hex: &str) -> Vec<u8> {
    let mut bytes = Vec::new();
    let mut digits = String::with_capacity(2);
    for ch in cap_hex.chars() {
        if ch.is_ascii_hexdigit() {
            digits.push(ch);
            if digits.len() == 2 {
                if let Ok(byte) = u8::from_str_radix(&digits, 16) {
                    bytes.push(byte);
                }
                digits.clear();
            }
        }
    }
    bytes
}

fn try_open_evdev(path: &Path) -> Option<File> {
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .open(path)
        .ok()?;
    set_nonblocking(&file)?;
    unsafe {
        let _ = libc::ioctl(file.as_raw_fd(), EVIOCGRAB, 1);
    }
    Some(file)
}

fn try_open_nonblocking(path: &Path) -> Option<File> {
    let file = OpenOptions::new().read(true).open(path).ok()?;
    set_nonblocking(&file)?;
    Some(file)
}

fn set_nonblocking(file: &File) -> Option<()> {
    let flags = unsafe { libc::fcntl(file.as_raw_fd(), libc::F_GETFL) };
    if flags < 0 {
        return None;
    }
    if unsafe { libc::fcntl(file.as_raw_fd(), libc::F_SETFL, flags | libc::O_NONBLOCK) } < 0 {
        return None;
    }
    Some(())
}

#[cfg(test)]
mod tests {
    use super::{ev_key_supported, key_action, parse_capability_hex};

    #[test]
    fn capability_hex_parses_pairs() {
        assert_eq!(parse_capability_hex("1f 00"), vec![0x1f, 0x00]);
        assert_eq!(parse_capability_hex("1f00"), vec![0x1f, 0x00]);
    }

    #[test]
    fn enter_and_a_supported_on_typical_keyboard_bitmap() {
        let keys = "ffffffffffffffffffffffffffffffffefffffffffffffffffffffffffffffff";
        assert!(ev_key_supported(keys, 28));
        assert!(ev_key_supported(keys, 30));
    }

    #[test]
    fn key_s_maps_to_s_not_b() {
        assert_eq!(key_action(31), Some(super::KeyAction::Char('s')));
    }

    #[test]
    fn numpad_and_number_row() {
        assert_eq!(key_action(2), Some(super::KeyAction::Char('1')));
        assert_eq!(key_action(79), Some(super::KeyAction::Char('1')));
        assert_eq!(key_action(82), Some(super::KeyAction::Char('0')));
    }
}