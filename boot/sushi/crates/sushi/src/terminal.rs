use std::fs::{File, OpenOptions};
use std::io::{self, Read, Write};
use std::os::fd::{AsFd, AsRawFd, BorrowedFd};
use std::os::unix::fs::OpenOptionsExt;
use std::path::PathBuf;

use rustix::termios::{
    LocalModes, OptionalActions, SpecialCodeIndex, Termios, tcgetattr, tcsetattr,
};

const KDSETMODE: libc::c_ulong = 0x4B3A;
const KDGKBLED: libc::c_ulong = 0x4B64;
const VT_SETMODE: libc::c_ulong = 0x5602;
const VT_RELDISP: libc::c_ulong = 0x5605;
const VT_AUTO: libc::c_char = 0;
const VT_PROCESS: libc::c_char = 1;
const VT_ACKACQ: libc::c_int = 2;
const KD_TEXT: libc::c_int = 0;
const KD_GRAPHICS: libc::c_int = 1;
const LED_CAPS_LOCK: libc::c_char = 0x04;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Key {
    Text(char),
    Erase,
    Clear,
    Enter,
}

#[repr(C)]
struct VtMode {
    mode: libc::c_char,
    waitv: libc::c_char,
    relsig: libc::c_short,
    acqsig: libc::c_short,
    frsig: libc::c_short,
}

pub const LEAVE_SIGNAL: libc::c_int = libc::SIGUSR1;
pub const RETURN_SIGNAL: libc::c_int = libc::SIGUSR2;

pub struct Terminal {
    file: File,
    saved: Termios,
    pending: Vec<u8>,
    escape: bool,
}

impl AsFd for Terminal {
    fn as_fd(&self) -> BorrowedFd<'_> {
        self.file.as_fd()
    }
}

fn active_console() -> PathBuf {
    let active = std::fs::read_to_string("/sys/class/tty/tty0/active").unwrap_or_default();
    let name = active
        .split_whitespace()
        .next()
        .filter(|name| name.starts_with("tty"))
        .unwrap_or("tty1");
    PathBuf::from("/dev").join(name)
}

fn key(character: char, escape: &mut bool) -> Option<Key> {
    if *escape {
        *escape = !(character.is_ascii_alphabetic() || character == '~');
        return None;
    }
    match character {
        '\u{1b}' => {
            *escape = true;
            None
        }
        '\r' | '\n' => Some(Key::Enter),
        '\u{7f}' | '\u{8}' => Some(Key::Erase),
        '\u{15}' => Some(Key::Clear),
        character if !character.is_control() => Some(Key::Text(character)),
        _ => None,
    }
}

fn decode(pending: &mut Vec<u8>, escape: &mut bool) -> Vec<Key> {
    let complete = match std::str::from_utf8(pending) {
        Err(error) if error.error_len().is_none() => error.valid_up_to(),
        _ => pending.len(),
    };
    let text = String::from_utf8_lossy(&pending[..complete]).into_owned();
    pending.drain(..complete);
    text.chars()
        .filter_map(|character| key(character, escape))
        .collect()
}

impl Terminal {
    pub fn open() -> io::Result<Self> {
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .custom_flags(libc::O_NOCTTY | libc::O_NONBLOCK | libc::O_CLOEXEC)
            .open(active_console())?;
        let saved = tcgetattr(&file)?;
        Ok(Self {
            file,
            saved,
            pending: Vec::new(),
            escape: false,
        })
    }

    fn set_vt_mode(&self, mode: libc::c_char) {
        let request = VtMode {
            mode,
            waitv: 0,
            relsig: LEAVE_SIGNAL as libc::c_short,
            acqsig: RETURN_SIGNAL as libc::c_short,
            frsig: 0,
        };
        unsafe { libc::ioctl(self.file.as_raw_fd(), VT_SETMODE, &request) };
    }

    pub fn hold(&self) {
        unsafe { libc::ioctl(self.file.as_raw_fd(), KDSETMODE, KD_GRAPHICS) };
        self.set_vt_mode(VT_PROCESS);
    }

    pub fn allow_leaving(&self) {
        unsafe { libc::ioctl(self.file.as_raw_fd(), VT_RELDISP, 1) };
    }

    pub fn accept_return(&self) {
        unsafe { libc::ioctl(self.file.as_raw_fd(), VT_RELDISP, VT_ACKACQ) };
    }

    pub fn give_back(&self) {
        self.set_vt_mode(VT_AUTO);
        unsafe { libc::ioctl(self.file.as_raw_fd(), KDSETMODE, KD_TEXT) };
    }

    pub fn clear(&self) {
        let _ = (&self.file).write_all(b"\x1b[H\x1b[2J\x1b[3J");
    }

    pub fn listen(&self) -> io::Result<()> {
        let mut raw = self.saved.clone();
        raw.local_modes
            .remove(LocalModes::ICANON | LocalModes::ECHO | LocalModes::ISIG | LocalModes::IEXTEN);
        raw.special_codes[SpecialCodeIndex::VMIN] = 0;
        raw.special_codes[SpecialCodeIndex::VTIME] = 0;
        tcsetattr(&self.file, OptionalActions::Flush, &raw)?;
        Ok(())
    }

    pub fn stop_listening(&self) {
        let _ = tcsetattr(&self.file, OptionalActions::Flush, &self.saved);
    }

    pub fn keys(&mut self) -> Vec<Key> {
        let mut buffer = [0u8; 256];
        while let Ok(length @ 1..) = self.file.read(&mut buffer) {
            self.pending.extend_from_slice(&buffer[..length]);
        }
        decode(&mut self.pending, &mut self.escape)
    }

    pub fn caps_lock(&self) -> bool {
        let mut leds: libc::c_char = 0;
        unsafe { libc::ioctl(self.file.as_raw_fd(), KDGKBLED, &mut leds) };
        leds & LED_CAPS_LOCK != 0
    }
}

impl Drop for Terminal {
    fn drop(&mut self) {
        self.stop_listening();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decodes_typing_and_skips_cursor_keys() {
        let mut bytes = "pä\u{1b}[Ds\u{7f}\r".as_bytes().to_vec();
        assert_eq!(
            decode(&mut bytes, &mut false),
            vec![
                Key::Text('p'),
                Key::Text('ä'),
                Key::Text('s'),
                Key::Erase,
                Key::Enter
            ]
        );
        assert!(bytes.is_empty());
    }

    #[test]
    fn keeps_a_character_split_across_reads() {
        let mut escape = false;
        let mut bytes = vec![b'a', 0xC3];
        assert_eq!(decode(&mut bytes, &mut escape), vec![Key::Text('a')]);
        bytes.push(0xAB);
        assert_eq!(decode(&mut bytes, &mut escape), vec![Key::Text('ë')]);
    }
}
