//! What the service keeps for the person, in `~/.local/state`: their choice,
//! the install's random ID once a report was sent, the crashes already
//! asked about in this version of Luft, and the reports waiting for an
//! answer or to be sent.

use std::path::{Path, PathBuf};

use luft_crash_report::{Body, Crash, Sent};
use serde::{Deserialize, Serialize};

const FOLDER: &str = "luft-crash-reports";
const FILE: &str = "state.json";
const WEEK_SECONDS: u64 = 7 * 24 * 3600;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, Default, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Choice {
    #[default]
    Ask,
    Always,
    Never,
}

impl Choice {
    pub fn parse(choice: &str) -> Option<Self> {
        serde_json::from_value(serde_json::Value::String(choice.into())).ok()
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Ask => "ask",
            Self::Always => "always",
            Self::Never => "never",
        }
    }
}

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct Saved {
    choice: Choice,
    install: Option<String>,
    asked: Vec<(String, String)>,
    waiting: Vec<Crash>,
    queue: Vec<Crash>,
    blocked: Option<String>,
}

pub struct State {
    path: PathBuf,
    saved: Saved,
    next_install: String,
}

fn new_install() -> String {
    let mut bytes = [0u8; 16];
    getrandom::fill(&mut bytes).expect("the system's random generator is always available");
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    let hex: String = bytes.iter().map(|byte| format!("{byte:02x}")).collect();
    format!(
        "{}-{}-{}-{}-{}",
        &hex[..8],
        &hex[8..12],
        &hex[12..16],
        &hex[16..20],
        &hex[20..]
    )
}

fn recent(crash: &Crash, now: u64) -> bool {
    now.saturating_sub(crash.at) <= WEEK_SECONDS
}

impl State {
    pub fn open(folder: &Path) -> Self {
        let path = folder.join(FOLDER).join(FILE);
        let saved = std::fs::read_to_string(&path)
            .ok()
            .and_then(|saved| serde_json::from_str(&saved).ok())
            .unwrap_or_default();
        Self {
            path,
            saved,
            next_install: new_install(),
        }
    }

    fn save(&self) {
        let written = self.path.with_extension("new");
        let saved = serde_json::to_string(&self.saved).expect("the state always serializes");
        let stored = self
            .path
            .parent()
            .map_or(Ok(()), std::fs::create_dir_all)
            .and_then(|()| std::fs::write(&written, saved))
            .and_then(|()| std::fs::rename(&written, &self.path));
        if let Err(error) = stored {
            eprintln!("Couldn't keep the crash reports' state: {error}");
        }
    }

    pub fn choice(&self) -> Choice {
        self.saved.choice
    }

    pub fn waiting(&self) -> Option<&Crash> {
        self.saved.waiting.first()
    }

    pub fn queue(&self) -> &[Crash] {
        &self.saved.queue
    }

    pub fn is_blocked(&self, image: &str) -> bool {
        self.saved.blocked.as_deref() == Some(image)
    }

    /// Takes crashes the collector found: each crash is dealt with once per
    /// version of Luft, by asking, sending or dropping it as the person chose.
    pub fn take(&mut self, crashes: Vec<Crash>, image: &str, now: u64) {
        self.saved.asked.retain(|(asked_in, _)| asked_in == image);
        for crash in crashes {
            let key = (crash.report.image.clone(), crash.report.signature.clone());
            if !recent(&crash, now) || self.saved.asked.contains(&key) {
                continue;
            }
            self.saved.asked.push(key);
            match self.saved.choice {
                Choice::Ask => self.saved.waiting.push(crash),
                Choice::Always => self.saved.queue.push(crash),
                Choice::Never => {}
            }
        }
        self.saved.waiting.retain(|crash| recent(crash, now));
        self.saved.queue.retain(|crash| recent(crash, now));
        self.save();
    }

    pub fn answer(&mut self, signature: &str, send: bool, remember: bool) -> bool {
        let Some(at) = self
            .saved
            .waiting
            .iter()
            .position(|crash| crash.report.signature == signature)
        else {
            return false;
        };
        let crash = self.saved.waiting.remove(at);
        if send {
            self.saved.queue.push(crash);
        }
        if remember {
            self.choose(if send { Choice::Always } else { Choice::Never });
        }
        self.save();
        true
    }

    pub fn choose(&mut self, choice: Choice) {
        self.saved.choice = choice;
        match choice {
            Choice::Always => self.saved.queue.append(&mut self.saved.waiting),
            Choice::Never => self.saved.waiting.clear(),
            Choice::Ask => {}
        }
        self.save();
    }

    pub fn reset_install(&mut self) {
        self.saved.install = None;
        self.next_install = new_install();
        self.save();
    }

    /// The install's ID: the saved one, or the one the first report sent
    /// will save.
    pub fn install(&self) -> &str {
        self.saved.install.as_deref().unwrap_or(&self.next_install)
    }

    /// Exactly what is sent for a crash: the body of the post.
    pub fn body<'a>(&'a self, crash: &'a Crash) -> Body<'a> {
        Body {
            data: Sent {
                report: &crash.report,
                install: self.install(),
            },
        }
    }

    pub fn sent(&mut self, signature: &str) {
        if self.saved.install.is_none() {
            self.saved.install = Some(self.next_install.clone());
        }
        self.drop_queued(signature);
    }

    pub fn drop_queued(&mut self, signature: &str) {
        self.saved
            .queue
            .retain(|crash| crash.report.signature != signature);
        self.save();
    }

    pub fn block(&mut self, image: &str) {
        self.saved.blocked = Some(image.to_owned());
        self.save();
    }
}

#[cfg(test)]
mod tests {
    use luft_crash_report::{Crash, Kind, Report};

    use super::{Choice, State};

    fn crash(signature: &str, at: u64) -> Crash {
        Crash {
            at,
            report: Report {
                signature: signature.into(),
                program: "luft-crash-fixture".into(),
                build: None,
                summary: "SIGSEGV".into(),
                kind: Kind::Signal,
                signal: Some("SIGSEGV".into()),
                message: None,
                location: None,
                frames: Vec::new(),
                script: Vec::new(),
                image: "1.2-nightly.21".into(),
                channel: "nightly".into(),
                graphics: Vec::new(),
                nvidia_driver: false,
            },
        }
    }

    #[test]
    fn asks_once_about_a_crash_that_keeps_happening() {
        let folder = tempfile::tempdir().unwrap();
        let mut state = State::open(folder.path());
        state.take(
            vec![crash("a", 1000), crash("a", 1001)],
            "1.2-nightly.21",
            1002,
        );
        assert!(state.answer("a", false, false));
        state.take(vec![crash("a", 1003)], "1.2-nightly.21", 1004);
        assert!(state.waiting().is_none());
    }

    #[test]
    fn remembers_always_and_drops_week_old_crashes() {
        let folder = tempfile::tempdir().unwrap();
        let mut state = State::open(folder.path());
        state.take(vec![crash("a", 1000)], "1.2-nightly.21", 1000);
        state.answer("a", true, true);
        assert_eq!(state.choice(), Choice::Always);
        state.take(
            vec![crash("b", 0), crash("c", 8 * 24 * 3600)],
            "1.2-nightly.21",
            8 * 24 * 3600,
        );
        let queued: Vec<&str> = state
            .queue()
            .iter()
            .map(|crash| crash.report.signature.as_str())
            .collect();
        assert_eq!(queued, ["c"]);
    }
}
