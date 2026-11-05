use std::io::{self, BufRead, Write};
use std::path::PathBuf;
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant};

use landlock::{ABI, Access, AccessNet, Ruleset, RulesetAttr, RulesetStatus};
use serde::{Deserialize, Serialize};

use crate::engine::capabilities::{self, Capabilities};
use crate::engine::error::{Failure, Result};
use crate::engine::inspect::{self, Details, Proxy};
use crate::engine::job::Job;
use crate::engine::{self, Progress, publish};

pub const ARGUMENT: &str = "--convertible-worker";
const REPORT_EVERY: Duration = Duration::from_millis(200);

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "request")]
pub enum Request {
    Capabilities,
    Details {
        path: PathBuf,
    },
    Proxy {
        path: PathBuf,
        edge: u32,
        time: f64,
        out: PathBuf,
    },
    Peaks {
        path: PathBuf,
        duration: f64,
        buckets: usize,
    },
    Convert {
        job: Box<Job>,
    },
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Reply {
    Progress(f32),
    Capabilities(Capabilities),
    Details(Details),
    Proxy(Proxy),
    Peaks(Vec<f32>),
    Converted(PathBuf),
    Failed(String),
}

fn send(reply: &Reply) {
    let mut line = serde_json::to_vec(reply).expect("replies always serialize");
    line.push(b'\n');
    let mut out = io::stdout().lock();
    let _ = out.write_all(&line).and_then(|()| out.flush());
}

pub fn stay_offline() -> bool {
    let restricted = Ruleset::default()
        .handle_access(AccessNet::from_all(ABI::V4))
        .and_then(|ruleset| ruleset.create())
        .and_then(|ruleset| ruleset.restrict_self());
    restricted.is_ok_and(|status| status.ruleset == RulesetStatus::FullyEnforced)
}

fn block_termination() -> libc::sigset_t {
    unsafe {
        let mut signals = std::mem::zeroed();
        libc::sigemptyset(&raw mut signals);
        libc::sigaddset(&raw mut signals, libc::SIGTERM);
        libc::pthread_sigmask(libc::SIG_BLOCK, &raw const signals, std::ptr::null_mut());
        signals
    }
}

fn clean_up_when_told(job: Job, signals: libc::sigset_t) {
    thread::spawn(move || {
        let mut signal = 0;
        unsafe {
            libc::sigwait(&raw const signals, &raw mut signal);
        }
        publish::discard(&job);
        std::process::exit(1);
    });
}

fn convert(job: Job) -> Result<Reply> {
    clean_up_when_told(job.clone(), block_termination());
    let last = Mutex::new(Instant::now());
    let report = |fraction: f32| {
        let mut last = last.lock().expect("the clock isn't poisoned");
        if last.elapsed() >= REPORT_EVERY {
            *last = Instant::now();
            send(&Reply::Progress(fraction));
        }
    };
    engine::run(&job, &Progress::new(&report)).map(Reply::Converted)
}

fn answer(request: Request) -> Result<Reply> {
    Ok(match request {
        Request::Capabilities => Reply::Capabilities(capabilities::detect()),
        Request::Details { path } => {
            Reply::Details(inspect::details(&path, inspect::detected(&path)?)?)
        }
        Request::Proxy {
            path,
            edge,
            time,
            out,
        } => Reply::Proxy(inspect::proxy(
            &path,
            inspect::detected(&path)?,
            edge,
            time,
            &out,
        )?),
        Request::Peaks {
            path,
            duration,
            buckets,
        } => Reply::Peaks(inspect::peaks(&path, duration, buckets)?),
        Request::Convert { job } => convert(*job)?,
    })
}

fn read_request() -> Result<Request> {
    let mut line = String::new();
    io::stdin().lock().read_line(&mut line)?;
    serde_json::from_str(&line).map_err(Failure::damaged)
}

pub fn run() {
    stay_offline();
    let reply = read_request()
        .and_then(answer)
        .unwrap_or_else(|failure| Reply::Failed(failure.0));
    send(&reply);
}
