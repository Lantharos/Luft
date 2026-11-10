use std::os::fd::{AsFd, BorrowedFd};
use std::os::unix::net::UnixListener;
use std::path::{Path, PathBuf};

/// The display number apps see. No X server of the session listens on it,
/// so X11 libraries, refused the session's abstract socket, find no server
/// there and connect through the socket file the sandbox binds instead.
pub const DISPLAY: &str = ":99";
pub const SOCKET: &str = "/tmp/.X11-unix/X99";
const NUMBER: &[u8] = b"99";

/// What the app finds as display 99: the session's X11 display when you
/// gave it that, and otherwise a socket nobody answers, which tells the
/// launcher the app looked for one.
pub struct Display {
    pub socket: PathBuf,
    pub authority: Option<PathBuf>,
    asked_at: Option<UnixListener>,
}

struct Cookie<'a> {
    family: [u8; 2],
    address: &'a [u8],
    number: &'a [u8],
    name: &'a [u8],
    data: &'a [u8],
}

fn field(bytes: &[u8]) -> Option<(&[u8], &[u8])> {
    let (length, rest) = bytes.split_first_chunk::<2>()?;
    rest.split_at_checked(u16::from_be_bytes(*length).into())
}

fn cookie(bytes: &[u8]) -> Option<(Cookie<'_>, &[u8])> {
    let (family, rest) = bytes.split_first_chunk::<2>()?;
    let (address, rest) = field(rest)?;
    let (number, rest) = field(rest)?;
    let (name, rest) = field(rest)?;
    let (data, rest) = field(rest)?;
    let cookie = Cookie {
        family: *family,
        address,
        number,
        name,
        data,
    };
    Some((cookie, rest))
}

fn push_field(file: &mut Vec<u8>, value: &[u8]) {
    file.extend((value.len() as u16).to_be_bytes());
    file.extend(value);
}

/// The cookies of display `number` and of every display, as cookies of
/// display 99.
fn renumbered(mut cookies: &[u8], number: &[u8]) -> Vec<u8> {
    let mut file = Vec::new();
    while let Some((cookie, rest)) = cookie(cookies) {
        if cookie.number.is_empty() || cookie.number == number {
            file.extend(cookie.family);
            for value in [cookie.address, NUMBER, cookie.name, cookie.data] {
                push_field(&mut file, value);
            }
        }
        cookies = rest;
    }
    file
}

impl Display {
    /// The session's display, with its cookies written to `authority` for
    /// display 99, or `None` when the session has no X11 display.
    pub fn of_session(authority: &Path) -> Option<Self> {
        let display = std::env::var("DISPLAY").ok()?;
        let number = display.strip_prefix(':')?.split('.').next()?;
        let socket = PathBuf::from(format!("/tmp/.X11-unix/X{number}"));
        let authority = std::env::var_os("XAUTHORITY")
            .and_then(|path| std::fs::read(path).ok())
            .and_then(|cookies| {
                std::fs::write(authority, renumbered(&cookies, number.as_bytes())).ok()
            })
            .map(|()| authority.to_path_buf());
        Some(Self {
            socket,
            authority,
            asked_at: None,
        })
    }

    /// A socket at `socket` that hangs up on whoever connects.
    pub fn stand_in(socket: &Path) -> Result<Self, String> {
        let listener = UnixListener::bind(socket).map_err(|error| error.to_string())?;
        listener
            .set_nonblocking(true)
            .map_err(|error| error.to_string())?;
        Ok(Self {
            socket: socket.to_path_buf(),
            authority: None,
            asked_at: Some(listener),
        })
    }

    /// What to watch to learn that the app looked for an X11 display.
    pub fn asked_fd(&self) -> Option<BorrowedFd<'_>> {
        self.asked_at.as_ref().map(UnixListener::as_fd)
    }

    /// Hangs up on the app's connections, and says whether there were any.
    pub fn asked(&self) -> bool {
        let Some(listener) = &self.asked_at else {
            return false;
        };
        let mut asked = false;
        while listener.accept().is_ok() {
            asked = true;
        }
        asked
    }
}
