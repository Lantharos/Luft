use std::cell::RefCell;
use std::collections::HashSet;
use std::fs::File;
use std::io::{Read, Write};
use std::os::fd::{AsFd, AsRawFd, BorrowedFd, OwnedFd};
use std::rc::Rc;
use std::thread::JoinHandle;

use pipewire as pw;
use pw::spa::utils::dict::DictRef;
use pw::types::ObjectType;

use super::fds;

const SANDBOX_INFO: &str = ".flatpak-info";
const RECORDER: &str = "Stream/Input/Audio";
const VIEWER: &str = "Stream/Input/Video";

/// What an app opens a stream to take in.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Kind {
    Sound,
    Video,
}

impl Kind {
    fn of(class: &str) -> Option<Self> {
        match class {
            RECORDER => Some(Self::Sound),
            VIEWER => Some(Self::Video),
            _ => None,
        }
    }

    fn byte(self) -> u8 {
        match self {
            Self::Sound => b's',
            Self::Video => b'v',
        }
    }

    fn from_byte(byte: u8) -> Option<Self> {
        [Self::Sound, Self::Video]
            .into_iter()
            .find(|kind| kind.byte() == byte)
    }
}

/// Follows the session's sound server and tells the launcher when the app
/// opens a stream that records sound or takes in video.
pub struct Watch {
    opened: File,
    _kept_open: OwnedFd,
    quit: pw::channel::Sender<()>,
    thread: Option<JoinHandle<()>>,
}

fn nonblocking(fd: &OwnedFd) -> Result<(), String> {
    let flags = unsafe { libc::fcntl(fd.as_raw_fd(), libc::F_GETFL) };
    if flags < 0
        || unsafe { libc::fcntl(fd.as_raw_fd(), libc::F_SETFL, flags | libc::O_NONBLOCK) } < 0
    {
        return Err(std::io::Error::last_os_error().to_string());
    }
    Ok(())
}

/// Whether the process is in a sandbox that carries `info`, as every
/// process of this launch's sandbox does.
fn in_sandbox(pid: &str, info: &[u8]) -> bool {
    std::fs::read(format!("/proc/{pid}/root/{SANDBOX_INFO}")).is_ok_and(|theirs| theirs == info)
}

fn follow(info: &[u8], opened: File, quit: pw::channel::Receiver<()>) -> Result<(), pw::Error> {
    pw::init();
    let mainloop = pw::main_loop::MainLoopRc::new(None)?;
    let context = pw::context::ContextRc::new(&mainloop, None)?;
    let core = context.connect_rc(None)?;
    let registry = core.get_registry_rc()?;
    let clients = Rc::new(RefCell::new(HashSet::new()));
    let _registry = registry
        .add_listener_local()
        .global({
            let clients = clients.clone();
            let info = info.to_vec();
            move |global| {
                let Some(props): Option<&DictRef> = global.props else {
                    return;
                };
                match global.type_ {
                    ObjectType::Client => {
                        if props
                            .get(*pw::keys::SEC_PID)
                            .is_some_and(|pid| in_sandbox(pid, &info))
                        {
                            clients.borrow_mut().insert(global.id);
                        }
                    }
                    ObjectType::Node => {
                        let ours = props
                            .get(*pw::keys::CLIENT_ID)
                            .and_then(|id| id.parse().ok())
                            .is_some_and(|id: u32| clients.borrow().contains(&id));
                        let kind = props.get(*pw::keys::MEDIA_CLASS).and_then(Kind::of);
                        if let Some(kind) = kind.filter(|_| ours) {
                            let _ = (&opened).write_all(&[kind.byte()]);
                        }
                    }
                    _ => {}
                }
            }
        })
        .global_remove(move |id| {
            clients.borrow_mut().remove(&id);
        })
        .register();
    let quitting = mainloop.clone();
    let _quit = quit.attach(mainloop.loop_(), move |()| quitting.quit());
    mainloop.run();
    Ok(())
}

impl Watch {
    /// Follows the streams of the sandbox whose info file reads `info`.
    pub fn start(info: Vec<u8>) -> Result<Self, String> {
        let (opened, writer) = fds::pipe()?;
        nonblocking(&opened)?;
        let kept_open = writer.try_clone().map_err(|error| error.to_string())?;
        let (quit, quit_receiver) = pw::channel::channel();
        let thread = std::thread::Builder::new()
            .name("capture".into())
            .spawn(move || {
                if let Err(error) = follow(&info, File::from(writer), quit_receiver) {
                    eprintln!("Couldn't follow what the app records: {error}");
                }
            })
            .map_err(|error| error.to_string())?;
        Ok(Self {
            opened: File::from(opened),
            _kept_open: kept_open,
            quit,
            thread: Some(thread),
        })
    }

    pub fn fd(&self) -> BorrowedFd<'_> {
        self.opened.as_fd()
    }

    /// What the app opened streams for since the last call.
    pub fn opened(&self) -> Vec<Kind> {
        let mut bytes = [0u8; 64];
        let read = (&self.opened).read(&mut bytes).unwrap_or(0);
        let mut kinds: Vec<Kind> = bytes[..read]
            .iter()
            .filter_map(|byte| Kind::from_byte(*byte))
            .collect();
        kinds.dedup();
        kinds
    }
}

impl Drop for Watch {
    fn drop(&mut self) {
        let _ = self.quit.send(());
        if let Some(thread) = self.thread.take() {
            let _ = thread.join();
        }
    }
}
