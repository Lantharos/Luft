use std::io::{BufRead, BufReader, Read, Write};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde_json::Value;

use crate::protocol::{Call, Progress, Reply, Request, Stage};

const PROGRESS_INTERVAL: Duration = Duration::from_millis(250);

pub struct Context {
    replies: Mutex<Box<dyn Write + Send>>,
    last: Mutex<Option<(Stage, Instant)>>,
}

impl Context {
    pub fn new(replies: impl Write + Send + 'static) -> Self {
        Self {
            replies: Mutex::new(Box::new(replies)),
            last: Mutex::new(None),
        }
    }

    fn send(&self, reply: &Reply) {
        let mut line = serde_json::to_vec(reply).expect("replies always serialize");
        line.push(b'\n');
        let mut replies = self.replies.lock().expect("replies lock");
        let _ = replies.write_all(&line).and_then(|()| replies.flush());
    }

    pub fn progress(&self, stage: Stage, done: u64, total: u64) {
        let mut last = self.last.lock().expect("progress lock");
        let due = last
            .is_none_or(|(previous, at)| previous != stage || at.elapsed() >= PROGRESS_INTERVAL);
        if due || done == total {
            *last = Some((stage, Instant::now()));
            self.send(&Reply::Progress(Progress { stage, done, total }));
        }
    }
}

pub fn serve(
    calls: impl Read,
    context: &Context,
    handle: impl Fn(&Context, Call) -> Result<Value, String>,
) {
    for line in BufReader::new(calls).lines() {
        let Ok(line) = line else { break };
        let Ok(request) = serde_json::from_str::<Request>(&line) else {
            continue;
        };
        let reply = match handle(context, request.call) {
            Ok(value) => Reply::Done {
                id: request.id,
                value,
            },
            Err(error) => Reply::Failed {
                id: request.id,
                error,
            },
        };
        context.send(&reply);
    }
}
