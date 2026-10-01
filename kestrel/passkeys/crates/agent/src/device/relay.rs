use std::io;

use ctap::hid::REPORT;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::UnixStream;
use tokio::net::unix::{OwnedReadHalf, OwnedWriteHalf};
use tokio::sync::mpsc;

const SOCKET: &str = "/run/luft-passkeys/relay";
const REPORT_FRAME: u8 = 0;
const ATTACHED_FRAME: u8 = 1;
const CLOSED_FRAME: u8 = 3;

pub enum Frame {
    Report(Box<[u8; REPORT]>),
    Attached(String),
    Closed,
    Detached,
}

pub struct Relay {
    pub frames: mpsc::Receiver<Frame>,
    writer: OwnedWriteHalf,
}

impl Relay {
    pub async fn connect() -> io::Result<Self> {
        let (reader, writer) = UnixStream::connect(SOCKET).await?.into_split();
        let (sender, frames) = mpsc::channel(32);
        tokio::spawn(read_frames(reader, sender));
        Ok(Self { frames, writer })
    }

    pub async fn send(&mut self, report: &[u8; REPORT]) -> io::Result<()> {
        self.writer.write_all(report).await
    }
}

async fn read_frames(mut reader: OwnedReadHalf, sender: mpsc::Sender<Frame>) {
    let mut frame = [0; REPORT + 1];
    while reader.read_exact(&mut frame).await.is_ok() {
        let payload = &frame[1..];
        let parsed = match frame[0] {
            REPORT_FRAME => Frame::Report(Box::new(payload.try_into().expect("a full report"))),
            ATTACHED_FRAME => {
                let end = payload
                    .iter()
                    .position(|byte| *byte == 0)
                    .unwrap_or(payload.len());
                Frame::Attached(String::from_utf8_lossy(&payload[..end]).into_owned())
            }
            CLOSED_FRAME => Frame::Closed,
            _ => Frame::Detached,
        };
        if sender.send(parsed).await.is_err() {
            return;
        }
    }
}
