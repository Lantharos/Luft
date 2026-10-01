use std::os::unix::net::UnixStream;
use std::time::{Duration, Instant};

use sushi::control::KeyEnrollment;
use sushi::notice_file::{NoticeFile, SECONDS};
use sushi::scene::Notice;
use sushi::terminal::Key;

const LIMIT: Duration = Duration::from_secs(240);

pub struct Shown {
    pub notice: Notice,
    waiting: Option<UnixStream>,
    since: Instant,
    footer: String,
    countdown: Option<Duration>,
    keys: Vec<char>,
}

fn spaced(code: &str) -> String {
    let (first, second) = code.split_at(code.len() / 2);
    format!("{first} {second}")
}

pub fn key_enrollment(enrollment: &KeyEnrollment) -> Notice {
    let retry = enrollment
        .again
        .then(|| "Luft's key wasn't added last time. Let's try again.".to_owned());
    Notice {
        title: "One more step after the restart".to_owned(),
        body: retry
            .into_iter()
            .chain([
                "A blue screen will ask about adding a key. It only waits 10 seconds,".to_owned(),
                "so press any key as soon as it appears. Then:".to_owned(),
            ])
            .collect(),
        steps: vec![
            "Choose Enroll MOK, then Continue".to_owned(),
            "Choose Yes".to_owned(),
            format!("Type {} and press Enter", spaced(&enrollment.code)),
            "Choose Reboot".to_owned(),
        ],
        footer: "Press Enter to restart".to_owned(),
    }
}

impl Shown {
    pub fn new(notice: Notice, waiting: UnixStream) -> Self {
        Self {
            footer: notice.footer.clone(),
            notice,
            waiting: Some(waiting),
            since: Instant::now(),
            countdown: None,
            keys: Vec::new(),
        }
    }

    pub fn counting_down(file: NoticeFile, waiting: UnixStream) -> Self {
        let mut shown = Self::new(file.notice, waiting);
        shown.countdown = file
            .countdown
            .map(|seconds| Duration::from_secs(seconds.into()));
        shown.keys = file.keys;
        shown.count();
        shown
    }

    fn count(&mut self) {
        if let Some(countdown) = self.countdown {
            let left = countdown.saturating_sub(self.since.elapsed()).as_secs_f32();
            self.notice.footer = self
                .footer
                .replace(SECONDS, &format!("{}", left.ceil() as u32));
        }
    }

    pub fn answer(&mut self, keys: &[Key]) -> Option<String> {
        self.count();
        let chosen = keys.iter().find_map(|key| match key {
            Key::Text(typed) => {
                let typed = typed.to_ascii_lowercase();
                self.keys.contains(&typed).then(|| format!("key {typed}"))
            }
            _ => None,
        });
        let expired = self.since.elapsed() > self.countdown.unwrap_or(LIMIT);
        chosen.or_else(|| (keys.contains(&Key::Enter) || expired).then(|| "ok".to_owned()))
    }

    pub fn dismiss(&mut self) -> Option<UnixStream> {
        self.waiting.take()
    }
}
