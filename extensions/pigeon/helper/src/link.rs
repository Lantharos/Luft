use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines, Stdin};
use tokio::sync::mpsc;

/// A device as the extension shows it.
#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub struct Peer {
    pub id: String,
    pub alias: String,
    pub kind: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
    /// Whether its certificate proved `id`, which trusting it needs.
    pub verified: bool,
}

#[derive(Debug, Serialize)]
pub struct Offered {
    pub name: String,
    pub size: u64,
    #[serde(rename = "type")]
    pub kind: String,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Direction {
    In,
    Out,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum Stage {
    Waiting,
    Pin,
    WrongPin,
    Moving,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum Outcome {
    Done,
    Declined,
    Cancelled,
    CancelledThere,
    Busy,
    Unreachable,
    Failed,
}

/// What the helper tells the extension, one JSON object per line.
#[derive(Debug, Serialize)]
#[serde(tag = "event", rename_all = "kebab-case")]
pub enum Event {
    Ready { fingerprint: String, alias: String },
    Listening { listening: bool },
    Devices { devices: Vec<Peer> },
    Scanning { scanning: bool },
    Text { from: Peer, text: String, trusted: bool },
    Offer { id: String, from: Peer, files: Vec<Offered>, size: u64 },
    Transfer { id: String, direction: Direction, device: String, stage: Stage, done: u64, size: u64, files: usize },
    Finished { id: String, direction: Direction, device: String, outcome: Outcome, saved: Vec<PathBuf> },
}

/// What the extension asks of the helper.
#[derive(Debug, Deserialize)]
#[serde(tag = "command", rename_all = "kebab-case")]
pub enum Command {
    Configure(crate::config::Config),
    Scan,
    Send { device: String, paths: Vec<PathBuf> },
    SendText { device: String, text: String },
    Accept { id: String },
    Decline { id: String },
    Cancel { id: String },
    Pin { id: String, pin: String },
}

#[derive(Clone)]
pub struct Link(mpsc::UnboundedSender<Event>);

impl Link {
    /// Writes events to standard output, in order, from a task of its own.
    pub fn start() -> Self {
        let (sender, mut events) = mpsc::unbounded_channel::<Event>();
        tokio::spawn(async move {
            let mut output = tokio::io::stdout();
            while let Some(event) = events.recv().await {
                let mut line = serde_json::to_vec(&event).expect("events serialize");
                line.push(b'\n');
                if output.write_all(&line).await.is_err() || output.flush().await.is_err() {
                    return;
                }
            }
        });
        Self(sender)
    }

    pub fn send(&self, event: Event) {
        let _ = self.0.send(event);
    }
}

/// Commands from standard input, until the extension closes it, which ends the helper.
pub struct Commands(Lines<BufReader<Stdin>>);

impl Commands {
    pub fn stdin() -> Self {
        Self(BufReader::new(tokio::io::stdin()).lines())
    }

    pub async fn next(&mut self) -> Option<Command> {
        loop {
            let line = self.0.next_line().await.ok()??;
            match serde_json::from_str(&line) {
                Ok(command) => return Some(command),
                Err(error) => eprintln!("pigeon: ignoring a command it doesn't understand: {error}"),
            }
        }
    }
}
