use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::{self, Read};
use std::os::unix::fs::OpenOptionsExt;

use futures_util::{Stream, stream};
use tokio::io::Interest;
use tokio::io::unix::AsyncFd;

const DEVICE: &str = "/dev/rfkill";
const BLUETOOTH: u8 = 2;
const ADD: u8 = 0;
const DELETE: u8 = 1;
const CHANGE: u8 = 2;

#[derive(Default)]
struct Switches(HashMap<u32, bool>);

impl Switches {
    fn apply(&mut self, event: [u8; 8]) {
        let [a, b, c, d, kind, operation, _soft, hard] = event;
        if kind != BLUETOOTH {
            return;
        }
        let index = u32::from_ne_bytes([a, b, c, d]);
        match operation {
            ADD | CHANGE => {
                self.0.insert(index, hard != 0);
            }
            DELETE => {
                self.0.remove(&index);
            }
            _ => {}
        }
    }

    fn hard_blocked(&self) -> bool {
        self.0.values().any(|hard| *hard)
    }
}

fn drain(file: &mut File, switches: &mut Switches) {
    let mut event = [0; 8];
    while file.read_exact(&mut event).is_ok() {
        switches.apply(event);
    }
}

fn open() -> io::Result<File> {
    OpenOptions::new()
        .read(true)
        .custom_flags(libc::O_NONBLOCK)
        .open(DEVICE)
}

pub fn hard_blocked() -> bool {
    let Ok(mut file) = open() else {
        return false;
    };
    let mut switches = Switches::default();
    drain(&mut file, &mut switches);
    switches.hard_blocked()
}

struct Watch {
    device: AsyncFd<File>,
    switches: Switches,
    blocked: bool,
}

impl Watch {
    async fn flipped(&mut self) -> Option<()> {
        let mut event = [0; 8];
        loop {
            let mut ready = self.device.readable_mut().await.ok()?;
            let Ok(read) = ready.try_io(|device| device.get_mut().read_exact(&mut event)) else {
                continue;
            };
            read.ok()?;
            self.switches.apply(event);
            if self.switches.hard_blocked() != self.blocked {
                self.blocked = !self.blocked;
                return Some(());
            }
        }
    }
}

pub fn changes() -> impl Stream<Item = ()> {
    let watch = open()
        .ok()
        .and_then(|device| {
            unsafe { AsyncFd::register_with_interest(device, Interest::READABLE) }.ok()
        })
        .map(|device| Watch {
            device,
            switches: Switches::default(),
            blocked: false,
        });
    stream::unfold(watch, |watch| async move {
        let mut watch = watch?;
        watch.flipped().await.map(|()| ((), Some(watch)))
    })
}
