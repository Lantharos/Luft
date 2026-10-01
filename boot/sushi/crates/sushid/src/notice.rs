use std::os::unix::net::UnixStream;
use std::time::{Duration, Instant};

use sushi::scene::Notice;

const LIMIT: Duration = Duration::from_secs(240);

pub struct Shown {
    pub notice: Notice,
    waiting: Option<UnixStream>,
    since: Instant,
}

fn spaced(code: &str) -> String {
    let (first, second) = code.split_at(code.len() / 2);
    format!("{first} {second}")
}

pub fn key_enrollment(code: &str) -> Notice {
    Notice {
        title: "One more step after the restart".to_owned(),
        body: vec![
            "A blue screen will ask about adding a key. It only waits 10 seconds,".to_owned(),
            "so press any key as soon as it appears. Then:".to_owned(),
        ],
        steps: vec![
            "Choose Enroll MOK, then Continue".to_owned(),
            "Choose Yes".to_owned(),
            format!("Type {} and press Enter", spaced(code)),
            "Choose Reboot".to_owned(),
        ],
        footer: "Press Enter to restart".to_owned(),
    }
}

impl Shown {
    pub fn new(notice: Notice, waiting: UnixStream) -> Self {
        Self {
            notice,
            waiting: Some(waiting),
            since: Instant::now(),
        }
    }

    pub fn expired(&self) -> bool {
        self.since.elapsed() > LIMIT
    }

    pub fn dismiss(&mut self) -> Option<UnixStream> {
        self.waiting.take()
    }
}
