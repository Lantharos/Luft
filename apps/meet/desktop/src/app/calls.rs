use std::collections::HashMap;
use std::io::{BufRead, BufReader, Read, Write};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::mpsc::{Sender, channel};
use std::sync::{Arc, Mutex};

use luft_i18n::t;
use serde_json::Value;

use super::job::Failed;
use super::{Events, PROGRESS};
use crate::L10N;
use crate::protocol::{Call, Reply, Request};

type Waiting = Arc<Mutex<HashMap<u64, Sender<Result<Value, Failed>>>>>;

pub struct Helper {
    calls: Box<dyn Write + Send>,
    waiting: Waiting,
}

static HELPER: Mutex<Option<Helper>> = Mutex::new(None);
static NEXT: AtomicU64 = AtomicU64::new(1);

pub fn next_number() -> u64 {
    NEXT.fetch_add(1, Ordering::Relaxed)
}

impl Helper {
    pub fn new(
        calls: impl Write + Send + 'static,
        replies: impl Read + Send + 'static,
        events: &Events,
        stopped: impl FnOnce() -> Failed + Send + 'static,
    ) -> Self {
        let waiting = Waiting::default();
        read_replies(replies, waiting.clone(), events.clone(), stopped);
        Self {
            calls: Box::new(calls),
            waiting,
        }
    }
}

fn answer(waiting: &Waiting, id: u64, result: Result<Value, Failed>) {
    if let Some(waiter) = waiting.lock().expect("waiting lock").remove(&id) {
        let _ = waiter.send(result);
    }
}

fn read_replies(
    replies: impl Read + Send + 'static,
    waiting: Waiting,
    events: Events,
    stopped: impl FnOnce() -> Failed + Send + 'static,
) {
    std::thread::spawn(move || {
        for line in BufReader::new(replies).lines() {
            let Ok(line) = line else { break };
            match serde_json::from_str::<Reply>(&line) {
                Ok(Reply::Progress(progress)) => events.emit(PROGRESS, progress),
                Ok(Reply::Done { id, value }) => answer(&waiting, id, Ok(value)),
                Ok(Reply::Failed { id, error }) => answer(&waiting, id, Err(Failed::from(error))),
                Err(_) => {}
            }
        }
        *HELPER.lock().expect("helper lock") = None;
        let failed = stopped();
        for (_, waiter) in waiting.lock().expect("waiting lock").drain() {
            let _ = waiter.send(Err(failed.clone()));
        }
    });
}

pub fn call(
    events: &Events,
    call: Call,
    start: impl FnOnce(&Events) -> Result<Helper, Failed>,
) -> Result<Value, Failed> {
    let id = next_number();
    let (sender, receiver) = channel();
    {
        let mut helper = HELPER.lock().expect("helper lock");
        if helper.is_none() {
            *helper = Some(start(events)?);
        }
        let helper = helper.as_mut().expect("helper just started");
        helper
            .waiting
            .lock()
            .expect("waiting lock")
            .insert(id, sender);
        let mut line =
            serde_json::to_vec(&Request { id, call }).map_err(|error| error.to_string())?;
        line.push(b'\n');
        helper
            .calls
            .write_all(&line)
            .and_then(|()| helper.calls.flush())
            .map_err(|error| t!(L10N, "helper-stopped-because", error = error.to_string()))?;
    }
    receiver
        .recv()
        .map_err(|_| Failed::from(t!(L10N, "helper-stopped")))?
}
