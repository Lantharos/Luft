use std::path::PathBuf;

use serde::Serialize;
use tokio::sync::mpsc;
use zbus::zvariant::Type;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Type)]
pub struct Peer {
    pub id: String,
    pub alias: String,
    pub kind: String,
    pub model: String,
    pub verified: bool,
}

#[derive(Clone, Debug, Serialize, Type)]
pub struct Offered {
    pub name: String,
    pub size: u64,
    pub kind: String,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Direction {
    In,
    Out,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Stage {
    Waiting,
    Pin,
    WrongPin,
    Moving,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Outcome {
    Done,
    Declined,
    Cancelled,
    CancelledThere,
    Busy,
    Unreachable,
    Failed,
}

impl Direction {
    pub fn name(self) -> &'static str {
        match self {
            Self::In => "in",
            Self::Out => "out",
        }
    }
}

impl Stage {
    pub fn name(self) -> &'static str {
        match self {
            Self::Waiting => "waiting",
            Self::Pin => "pin",
            Self::WrongPin => "wrong-pin",
            Self::Moving => "moving",
        }
    }
}

impl Outcome {
    pub fn name(self) -> &'static str {
        match self {
            Self::Done => "done",
            Self::Declined => "declined",
            Self::Cancelled => "cancelled",
            Self::CancelledThere => "cancelled-there",
            Self::Busy => "busy",
            Self::Unreachable => "unreachable",
            Self::Failed => "failed",
        }
    }
}

#[derive(Debug)]
pub enum Event {
    Ready { alias: String, folder: PathBuf },
    Listening { listening: bool },
    Devices { devices: Vec<Peer> },
    Scanning { scanning: bool },
    Text { from: Peer, text: String, trusted: bool },
    Offer { id: String, from: Peer, files: Vec<Offered>, size: u64 },
    Transfer { id: String, direction: Direction, device: String, stage: Stage, done: u64, size: u64, files: usize },
    Finished { id: String, direction: Direction, device: String, outcome: Outcome, saved: Vec<PathBuf> },
    Paired { device: Peer },
}

#[derive(Clone)]
pub struct Link(mpsc::UnboundedSender<Event>);

impl Link {
    pub fn new() -> (Self, mpsc::UnboundedReceiver<Event>) {
        let (sender, events) = mpsc::unbounded_channel();
        (Self(sender), events)
    }

    pub fn send(&self, event: Event) {
        let _ = self.0.send(event);
    }
}
