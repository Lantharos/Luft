use std::collections::HashMap;
use std::io::{self, Read, Write};
use std::os::fd::OwnedFd;

use rustix::fs::{Mode, OFlags};
use rustix::ioctl::{NoArg, opcode};
use tokio::io::unix::AsyncFd;

const DEVICE: &str = "/dev/rfkill";
const EVENT_SIZE: usize = 8;
const NO_INPUT: rustix::ioctl::Opcode = opcode::none(b'R', 1);

pub const ALL: u8 = 0;
pub const BLUETOOTH: u8 = 2;
pub const WWAN: u8 = 5;

const ADD: u8 = 0;
const DELETE: u8 = 1;
const CHANGE: u8 = 2;
const CHANGE_ALL: u8 = 3;

#[derive(Clone, Copy, PartialEq)]
pub enum Block {
    None,
    Soft,
    Hard,
}

pub struct Switch {
    pub kind: u8,
    pub block: Block,
}

pub struct Rfkill {
    device: AsyncFd<std::fs::File>,
    input_inhibitor: Option<OwnedFd>,
}

impl Rfkill {
    pub fn open() -> io::Result<Self> {
        let flags = OFlags::RDWR | OFlags::NONBLOCK | OFlags::CLOEXEC;
        let device = rustix::fs::open(DEVICE, flags, Mode::empty())?;
        Ok(Self {
            device: AsyncFd::new(std::fs::File::from(device))?,
            input_inhibitor: None,
        })
    }

    pub fn drain(&mut self, switches: &mut HashMap<u32, Switch>) -> io::Result<()> {
        let mut event = [0; EVENT_SIZE];
        loop {
            match self.device.get_mut().read(&mut event) {
                Ok(EVENT_SIZE) => apply(&event, switches),
                Ok(_) => return Err(io::Error::other("The radio switch device closed")),
                Err(error) if error.kind() == io::ErrorKind::WouldBlock => return Ok(()),
                Err(error) => return Err(error),
            }
        }
    }

    pub async fn changes(&mut self, switches: &mut HashMap<u32, Switch>) -> io::Result<()> {
        self.device.readable_mut().await?.clear_ready();
        self.drain(switches)
    }

    pub fn block_all(&mut self, kind: u8, blocked: bool) -> io::Result<()> {
        let event = [0, 0, 0, 0, kind, CHANGE_ALL, u8::from(blocked), 0];
        self.device.get_mut().write_all(&event)
    }

    pub fn take_radio_keys(&mut self, take: bool) -> io::Result<()> {
        if !take {
            self.input_inhibitor = None;
            return Ok(());
        }
        if self.input_inhibitor.is_none() {
            let inhibitor =
                rustix::fs::open(DEVICE, OFlags::WRONLY | OFlags::CLOEXEC, Mode::empty())?;
            unsafe { rustix::ioctl::ioctl(&inhibitor, NoArg::<NO_INPUT>::new()) }?;
            self.input_inhibitor = Some(inhibitor);
        }
        Ok(())
    }
}

fn apply(event: &[u8; EVENT_SIZE], switches: &mut HashMap<u32, Switch>) {
    let index = u32::from_ne_bytes([event[0], event[1], event[2], event[3]]);
    let (kind, operation, soft, hard) = (event[4], event[5], event[6], event[7]);
    let block = match (hard, soft) {
        (0, 0) => Block::None,
        (0, _) => Block::Soft,
        _ => Block::Hard,
    };
    match operation {
        ADD | CHANGE => {
            switches.insert(index, Switch { kind, block });
        }
        DELETE => {
            switches.remove(&index);
        }
        _ => {}
    }
}
