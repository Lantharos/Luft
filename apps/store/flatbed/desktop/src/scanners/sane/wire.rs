//! What Flatbed and its SANE helper say to each other: requests as lines of
//! JSON, and back frames of a kind byte, a little endian length and the bytes.

use std::io::{self, Read, Write};
use std::net::IpAddr;

use serde::{Deserialize, Serialize};

use crate::scanners::{Feed, ScanError};

pub const MESSAGE: u8 = 0;
pub const PIXELS: u8 = 1;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Request {
    List,
    Scan {
        device: String,
        feed: Feed,
        colour: bool,
        dpi: u32,
    },
    Cancel,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FoundDevice {
    pub name: String,
    pub title: String,
    pub feeds: Vec<Feed>,
    pub address: Option<IpAddr>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Reply {
    Devices(Vec<FoundDevice>),
    Page {
        width: u32,
        lines: i32,
        bytes_per_line: u32,
        depth: u32,
        colour: bool,
        dpi: f32,
    },
    PageDone,
    Done,
    Failed(ScanError),
}

pub fn send_reply(out: &mut impl Write, reply: &Reply) -> io::Result<()> {
    send(
        out,
        MESSAGE,
        &serde_json::to_vec(reply).map_err(io::Error::other)?,
    )
}

pub fn send(out: &mut impl Write, kind: u8, bytes: &[u8]) -> io::Result<()> {
    out.write_all(&[kind])?;
    out.write_all(&(bytes.len() as u32).to_le_bytes())?;
    out.write_all(bytes)?;
    out.flush()
}

pub enum Frame {
    Reply(Reply),
    Pixels(Vec<u8>),
}

pub fn receive(input: &mut impl Read) -> io::Result<Frame> {
    let mut header = [0; 5];
    input.read_exact(&mut header)?;
    let mut bytes =
        vec![0; u32::from_le_bytes(header[1..].try_into().expect("four bytes")) as usize];
    input.read_exact(&mut bytes)?;
    match header[0] {
        PIXELS => Ok(Frame::Pixels(bytes)),
        _ => serde_json::from_slice(&bytes)
            .map(Frame::Reply)
            .map_err(io::Error::other),
    }
}
