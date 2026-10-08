use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::Read;
use std::os::unix::fs::OpenOptionsExt;
use std::sync::mpsc::Sender;

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

pub fn hard_blocked() -> bool {
    let Ok(mut file) = OpenOptions::new()
        .read(true)
        .custom_flags(libc::O_NONBLOCK)
        .open(DEVICE)
    else {
        return false;
    };
    let mut switches = Switches::default();
    drain(&mut file, &mut switches);
    switches.hard_blocked()
}

pub fn watch(changes: Sender<()>) {
    std::thread::spawn(move || {
        let Ok(mut file) = File::open(DEVICE) else {
            return;
        };
        let mut switches = Switches::default();
        let mut blocked = false;
        let mut event = [0; 8];
        while file.read_exact(&mut event).is_ok() {
            switches.apply(event);
            if switches.hard_blocked() != blocked {
                blocked = !blocked;
                if changes.send(()).is_err() {
                    return;
                }
            }
        }
    });
}
