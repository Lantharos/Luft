use std::os::unix::net::UnixStream;
use std::time::{Duration, Instant};

use sushi::ipc::control::KeyEnrollment;
use sushi::notice_file::{NoticeFile, SECONDS};
use sushi::scene::Notice;
use sushi::terminal::Key;

const LIMIT: Duration = Duration::from_secs(240);
const KEY_ENROLLMENT_SHOWN: Duration = Duration::from_secs(30);

pub struct Shown {
    pub notice: Notice,
    waiting: Option<UnixStream>,
    since: Instant,
    footer: String,
    countdown: Option<Duration>,
    keys: Vec<char>,
}

pub fn key_enrollment(enrollment: &KeyEnrollment, waiting: UnixStream) -> Shown {
    let retry = enrollment
        .again
        .then(|| "The blue screen went by last time, so here it is again.".to_owned());
    let notice = Notice {
        title: "Finish setting up Secure Boot after the restart".to_owned(),
        body: retry
            .into_iter()
            .chain([
                "A blue screen says \u{201c}Press any key to perform MOK management\u{201d}"
                    .to_owned(),
                "and waits a minute. Press any key, then:".to_owned(),
            ])
            .collect(),
        steps: vec![
            "Choose \u{201c}Enroll MOK\u{201d}".to_owned(),
            "Choose \u{201c}Continue\u{201d}".to_owned(),
            "At \u{201c}Enroll the key(s)?\u{201d}, choose \u{201c}Yes\u{201d}".to_owned(),
            "At \u{201c}Password:\u{201d}, type this code and press Enter".to_owned(),
            "Choose \u{201c}Reboot\u{201d}".to_owned(),
        ],
        code: Some((
            enrollment.code.clone(),
            "All eight digits, no space. Nothing shows while you type.".to_owned(),
        )),
        footer: format!(
            "If it goes by, Luft starts anyway and you can try again. Restarting in {SECONDS} seconds, or press Enter."
        ),
    };
    let mut shown = Shown::new(notice, waiting);
    shown.countdown = Some(KEY_ENROLLMENT_SHOWN);
    shown.count();
    shown
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
