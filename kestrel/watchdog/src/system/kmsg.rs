use std::collections::VecDeque;
use std::fs::File;
use std::io::{self, Read};
use std::sync::{Arc, Mutex};
use std::time::Duration;

const KEPT_LINES: usize = 400;
const RELEVANT: [&str; 7] = [
    "NVRM",
    "nvidia",
    "drm",
    "GPU",
    "Xid",
    "clocksource",
    "amdgpu",
];
const FAILURES: [&str; 10] = [
    "NVRM: Xid",
    "GPU is probably locked",
    "TLB invalidation failed",
    "fallen off the bus",
    "flip_done timed out",
    "hw_done timed out",
    "GPU HANG",
    "GPU reset begin",
    "ring gfx",
    "GPU recovery action",
];

#[derive(Clone)]
pub struct Line {
    pub at: Duration,
    pub text: String,
}

impl Line {
    pub fn is_failure(&self) -> bool {
        FAILURES.iter().any(|marker| self.text.contains(marker))
    }

    pub fn format(&self) -> String {
        format!(
            "[{:>5}.{:06}] {}",
            self.at.as_secs(),
            self.at.subsec_micros(),
            self.text
        )
    }
}

#[derive(Clone)]
pub struct KernelLog {
    lines: Arc<Mutex<VecDeque<Line>>>,
}

fn parse(record: &str) -> Option<Line> {
    let (header, message) = record.split_once(';')?;
    let micros: u64 = header.split(',').nth(2)?.parse().ok()?;
    let text = message.lines().next()?.to_owned();
    RELEVANT
        .iter()
        .any(|word| text.contains(word))
        .then_some(Line {
            at: Duration::from_micros(micros),
            text,
        })
}

fn follow(mut kmsg: File, lines: Arc<Mutex<VecDeque<Line>>>) {
    let mut buffer = vec![0; 8192];
    loop {
        match kmsg.read(&mut buffer) {
            Ok(0) => return,
            Ok(length) => {
                let Some(line) = parse(&String::from_utf8_lossy(&buffer[..length])) else {
                    continue;
                };
                let mut kept = lines
                    .lock()
                    .unwrap_or_else(|poisoned| poisoned.into_inner());
                if kept.len() == KEPT_LINES {
                    kept.pop_front();
                }
                kept.push_back(line);
            }
            Err(error) if error.raw_os_error() == Some(rustix::io::Errno::PIPE.raw_os_error()) => {}
            Err(error) if error.kind() == io::ErrorKind::Interrupted => {}
            Err(error) => {
                eprintln!("Stopped reading the kernel log: {error}");
                return;
            }
        }
    }
}

impl KernelLog {
    pub fn watch() -> io::Result<Self> {
        let kmsg = File::open("/dev/kmsg")?;
        let log = Self {
            lines: Arc::default(),
        };
        let lines = log.lines.clone();
        std::thread::Builder::new()
            .name("kernel log".into())
            .spawn(move || follow(kmsg, lines))?;
        Ok(log)
    }

    pub fn lines(&self) -> Vec<Line> {
        self.lines
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .iter()
            .cloned()
            .collect()
    }

    pub fn failures_since(&self, at: Duration) -> Vec<Line> {
        self.lines()
            .into_iter()
            .filter(|line| line.at >= at && line.is_failure())
            .collect()
    }
}

pub fn now() -> Duration {
    let time = rustix::time::clock_gettime(rustix::time::ClockId::Monotonic);
    Duration::new(time.tv_sec as u64, time.tv_nsec as u32)
}
