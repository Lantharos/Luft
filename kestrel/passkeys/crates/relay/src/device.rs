use std::fs::{File, OpenOptions};
use std::io::{self, Read, Write};
use std::os::fd::{AsFd, BorrowedFd};

pub const REPORT: usize = 64;

const EVENT: usize = 4 + 4372;
const DESTROY: u32 = 1;
const CLOSE: u32 = 5;
const OUTPUT: u32 = 6;
const GET_REPORT: u32 = 9;
const GET_REPORT_REPLY: u32 = 10;
const CREATE2: u32 = 11;
const INPUT2: u32 = 12;
const SET_REPORT: u32 = 13;
const SET_REPORT_REPLY: u32 = 14;

const BUS_USB: u16 = 0x03;
const VENDOR: u32 = 0x1209;
const PRODUCT: u32 = 0x4C46;
const NAME: &[u8] = b"Luft Passkeys";
const EIO: u16 = 5;

const DESCRIPTOR: [u8; 34] = [
    0x06, 0xD0, 0xF1, 0x09, 0x01, 0xA1, 0x01, 0x09, 0x20, 0x15, 0x00, 0x26, 0xFF, 0x00, 0x75, 0x08,
    0x95, 0x40, 0x81, 0x02, 0x09, 0x21, 0x15, 0x00, 0x26, 0xFF, 0x00, 0x75, 0x08, 0x95, 0x40, 0x91,
    0x02, 0xC0,
];

pub enum Event {
    Report([u8; REPORT]),
    Closed,
}

pub struct Device {
    uhid: File,
}

fn event(kind: u32) -> Box<[u8; EVENT]> {
    let mut event = Box::new([0; EVENT]);
    event[..4].copy_from_slice(&kind.to_ne_bytes());
    event
}

impl Device {
    pub fn create(uniq: &str) -> io::Result<Self> {
        let mut uhid = OpenOptions::new()
            .read(true)
            .write(true)
            .open("/dev/uhid")?;
        let mut create = event(CREATE2);
        let body = &mut create[4..];
        body[..NAME.len()].copy_from_slice(NAME);
        body[192..192 + uniq.len()].copy_from_slice(uniq.as_bytes());
        body[256..258].copy_from_slice(&(DESCRIPTOR.len() as u16).to_ne_bytes());
        body[258..260].copy_from_slice(&BUS_USB.to_ne_bytes());
        body[260..264].copy_from_slice(&VENDOR.to_ne_bytes());
        body[264..268].copy_from_slice(&PRODUCT.to_ne_bytes());
        body[276..276 + DESCRIPTOR.len()].copy_from_slice(&DESCRIPTOR);
        uhid.write_all(create.as_slice())?;
        Ok(Self { uhid })
    }

    pub fn send(&mut self, report: &[u8; REPORT]) -> io::Result<()> {
        let mut input = event(INPUT2);
        input[4..6].copy_from_slice(&(REPORT as u16).to_ne_bytes());
        input[6..6 + REPORT].copy_from_slice(report);
        self.uhid.write_all(input.as_slice())
    }

    pub fn receive(&mut self) -> io::Result<Option<Event>> {
        let mut event = Box::new([0; EVENT]);
        let length = self.uhid.read(event.as_mut_slice())?;
        if length < 4 {
            return Ok(None);
        }
        let body = &event[4..];
        match u32::from_ne_bytes(event[..4].try_into().expect("four bytes")) {
            OUTPUT => {
                let size = usize::from(u16::from_ne_bytes([body[4096], body[4097]]));
                let data = match &body[..size.min(4096)] {
                    [0, report @ ..] if report.len() == REPORT => report,
                    report => report,
                };
                Ok(data.try_into().ok().map(Event::Report))
            }
            GET_REPORT => {
                let mut reply = event_reply(GET_REPORT_REPLY, &body[..4]);
                reply[8..10].copy_from_slice(&EIO.to_ne_bytes());
                self.uhid.write_all(reply.as_slice()).map(|()| None)
            }
            SET_REPORT => {
                let mut reply = event_reply(SET_REPORT_REPLY, &body[..4]);
                reply[8..10].copy_from_slice(&EIO.to_ne_bytes());
                self.uhid.write_all(reply.as_slice()).map(|()| None)
            }
            CLOSE => Ok(Some(Event::Closed)),
            _ => Ok(None),
        }
    }
}

fn event_reply(kind: u32, id: &[u8]) -> Box<[u8; EVENT]> {
    let mut reply = event(kind);
    reply[4..8].copy_from_slice(id);
    reply
}

impl AsFd for Device {
    fn as_fd(&self) -> BorrowedFd<'_> {
        self.uhid.as_fd()
    }
}

impl Drop for Device {
    fn drop(&mut self) {
        let _ = self.uhid.write_all(event(DESTROY).as_slice());
    }
}
