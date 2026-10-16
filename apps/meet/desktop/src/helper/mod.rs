mod drive;
mod live_system;
mod pack;
mod prepare;
mod refresh;
mod system;
mod undo;

use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::os::windows::io::AsRawHandle;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde_json::Value;
use windows::Win32::Foundation::HANDLE;
use windows::Win32::System::Pipes::GetNamedPipeServerProcessId;

use crate::protocol::{Call, Progress, Reply, Request, Stage};

pub const ARGUMENT: &str = "--meet-helper";
const PROGRESS_INTERVAL: Duration = Duration::from_millis(250);

pub struct Link {
    pipe: String,
    parent: u32,
}

pub fn requested() -> Option<Link> {
    let mut args = std::env::args().skip(1);
    (args.next()? == ARGUMENT).then_some(())?;
    Some(Link {
        pipe: args.next()?,
        parent: args.next()?.parse().ok()?,
    })
}

pub struct Context {
    replies: Mutex<File>,
    last: Mutex<Option<(Stage, Instant)>>,
}

impl Context {
    fn send(&self, reply: &Reply) {
        let mut line = serde_json::to_vec(reply).expect("replies always serialize");
        line.push(b'\n');
        let _ = self.replies.lock().expect("replies lock").write_all(&line);
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

fn server_is(pipe: &File, parent: u32) -> bool {
    let mut server = 0u32;
    unsafe { GetNamedPipeServerProcessId(HANDLE(pipe.as_raw_handle()), &mut server) }.is_ok()
        && server == parent
}

fn handle(context: &Context, call: Call) -> Result<Value, String> {
    let value = match call {
        Call::Check { source } => serde_json::to_value(prepare::check(&source)?),
        Call::Prepare { luft, source } => {
            serde_json::to_value(prepare::prepare(context, luft, &source)?)
        }
        Call::Refresh { source } => serde_json::to_value(refresh::refresh(context, &source)?),
        Call::Pack { belongings } => serde_json::to_value(pack::pack(context, &belongings)?),
        Call::Restart { intent, windows } => {
            serde_json::to_value(drive::state::restart(intent, windows)?)
        }
        Call::Tidy => serde_json::to_value(prepare::tidy()?),
        Call::FirmwareSettings => serde_json::to_value(system::firmware::restart_into_settings()?),
        Call::Undo => serde_json::to_value(undo::undo(context)?),
    };
    value.map_err(|error| error.to_string())
}

pub fn serve(link: Link) {
    let calls = OpenOptions::new()
        .read(true)
        .open(format!("{}-calls", link.pipe));
    let replies = OpenOptions::new()
        .write(true)
        .open(format!("{}-replies", link.pipe));
    let (Ok(calls), Ok(replies)) = (calls, replies) else {
        return;
    };
    if !server_is(&calls, link.parent) || !server_is(&replies, link.parent) {
        return;
    }
    let context = Context {
        replies: Mutex::new(replies),
        last: Mutex::new(None),
    };
    for line in BufReader::new(calls).lines() {
        let Ok(line) = line else { break };
        let Ok(request) = serde_json::from_str::<Request>(&line) else {
            continue;
        };
        let reply = match handle(&context, request.call) {
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
