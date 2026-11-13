use std::io::Read;
use std::process::{Command, Stdio};

pub enum Key {
    Up,
    Down,
    Return,
    Interrupt,
    Other,
}

fn byte() -> Option<u8> {
    let mut buffer = [0u8];
    std::io::stdin()
        .read_exact(&mut buffer)
        .ok()
        .map(|()| buffer[0])
}

/// The terminal handing over every key as it's pressed, until dropped.
pub struct RawMode {
    #[cfg(unix)]
    saved: Option<libc::termios>,
}

impl RawMode {
    #[cfg(unix)]
    pub fn enter() -> Self {
        let mut current = std::mem::MaybeUninit::<libc::termios>::uninit();
        let saved = (unsafe { libc::tcgetattr(libc::STDIN_FILENO, current.as_mut_ptr()) } == 0)
            .then(|| unsafe { current.assume_init() });
        if let Some(saved) = saved {
            let mut raw = saved;
            unsafe { libc::cfmakeraw(&mut raw) };
            unsafe { libc::tcsetattr(libc::STDIN_FILENO, libc::TCSANOW, &raw) };
        }
        Self { saved }
    }

    #[cfg(not(unix))]
    pub fn enter() -> Self {
        Self {}
    }

    pub fn key(&self) -> Key {
        match byte() {
            None | Some(3) => Key::Interrupt,
            Some(b'\r' | b'\n') => Key::Return,
            Some(0x1b) => match (byte(), byte()) {
                (Some(b'['), Some(b'A')) => Key::Up,
                (Some(b'['), Some(b'B')) => Key::Down,
                _ => Key::Other,
            },
            Some(_) => Key::Other,
        }
    }
}

#[cfg(unix)]
impl Drop for RawMode {
    fn drop(&mut self) {
        if let Some(saved) = &self.saved {
            unsafe { libc::tcsetattr(libc::STDIN_FILENO, libc::TCSANOW, saved) };
        }
    }
}

/// This computer's name, which approvals show so you know where they came from.
#[cfg(unix)]
pub fn hostname() -> String {
    let mut buffer = [0u8; 256];
    let found = unsafe { libc::gethostname(buffer.as_mut_ptr().cast(), buffer.len()) } == 0;
    let end = buffer.iter().position(|byte| *byte == 0).unwrap_or(0);
    if found {
        String::from_utf8_lossy(&buffer[..end]).into_owned()
    } else {
        String::new()
    }
}

#[cfg(not(unix))]
pub fn hostname() -> String {
    std::env::var("COMPUTERNAME").unwrap_or_default()
}

/// Whether the environment variable is set to something, as JavaScript's
/// `process.env.NAME` is truthy.
pub fn set(name: &str) -> bool {
    std::env::var_os(name).is_some_and(|value| !value.is_empty())
}

pub fn open_browser(url: &str) {
    if set("CI") || set("SCHELF_NO_BROWSER") {
        return;
    }
    let command: &[&str] = if cfg!(target_os = "macos") {
        &["open"]
    } else if cfg!(windows) {
        &["cmd", "/c", "start", ""]
    } else {
        &["xdg-open"]
    };
    let _ = Command::new(command[0])
        .args(&command[1..])
        .arg(url)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn();
}
