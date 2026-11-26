//! Lets the desktop's headless checks find elements on the app's page, so
//! they click what a person would see instead of fixed points. It only runs
//! when the check session names an abstract socket in `LUFT_APP_PROBE`.

use std::collections::HashMap;
use std::io::{self, BufRead, BufReader, Write};
use std::os::linux::net::SocketAddrExt;
use std::os::unix::net::{SocketAddr, UnixListener, UnixStream};
use std::sync::mpsc::{self, Sender};
use std::sync::{Arc, Mutex, PoisonError};
use std::time::Duration;

use sabine::{BridgeError, BridgeEventEmitter, BridgeResponse, SabineWindow};
use serde::Deserialize;
use serde_json::{Value, json};

const SOCKET: &str = "LUFT_APP_PROBE";
const ASKED: &str = "probe.asked";
const ANSWER: &str = "probe.answer";
const PATIENCE: Duration = Duration::from_secs(5);
const UNANSWERED: &str = r#"{"error":"the page did not answer"}"#;

#[derive(Default)]
struct Waiting {
    next: u64,
    replies: HashMap<u64, Sender<String>>,
}

#[derive(Clone)]
pub struct Probe {
    socket: String,
    waiting: Arc<Mutex<Waiting>>,
}

#[derive(Deserialize)]
struct Answer {
    id: u64,
    reply: String,
}

impl Probe {
    pub fn from_environment() -> Option<Self> {
        std::env::var(SOCKET).ok().map(|socket| Self {
            socket,
            waiting: Arc::default(),
        })
    }

    pub fn declare(&self, window: SabineWindow) -> SabineWindow {
        let waiting = self.waiting.clone();
        window.bridge_handler(ANSWER, move |command| {
            let answer: Answer = serde_json::from_value(command.params)
                .map_err(|error| BridgeError::new(error.to_string()))?;
            let reply = lock(&waiting).replies.remove(&answer.id);
            if let Some(reply) = reply {
                reply.send(answer.reply).ok();
            }
            Ok(BridgeResponse::json(Value::Null))
        })
    }

    pub fn serve(self, emitter: BridgeEventEmitter) {
        std::thread::spawn(move || {
            let listener = SocketAddr::from_abstract_name(&self.socket)
                .and_then(|address| UnixListener::bind_addr(&address))
                .expect("the probe socket is free");
            for stream in listener.incoming().flatten() {
                let probe = self.clone();
                let emitter = emitter.clone();
                std::thread::spawn(move || probe.answer(stream, &emitter));
            }
        });
    }

    fn answer(&self, stream: UnixStream, emitter: &BridgeEventEmitter) -> io::Result<()> {
        let mut writer = stream.try_clone()?;
        for line in BufReader::new(stream).lines() {
            let query: Value = serde_json::from_str(&line?)?;
            let (reply, replied) = mpsc::channel();
            let id = {
                let mut waiting = lock(&self.waiting);
                waiting.next += 1;
                let id = waiting.next;
                waiting.replies.insert(id, reply);
                id
            };
            emitter.emit(ASKED, json!({"id": id, "query": query}));
            let reply = replied.recv_timeout(PATIENCE).unwrap_or_else(|_| {
                lock(&self.waiting).replies.remove(&id);
                UNANSWERED.to_owned()
            });
            writeln!(writer, "{reply}")?;
        }
        Ok(())
    }
}

fn lock(waiting: &Mutex<Waiting>) -> std::sync::MutexGuard<'_, Waiting> {
    waiting.lock().unwrap_or_else(PoisonError::into_inner)
}
