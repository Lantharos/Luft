use std::io::Write;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use luft_software::progress::{Progress, Stage};

use super::{Ink, truncate};
use crate::cli::perform::Verb;

const BAR: usize = 24;
const TEXT_COLUMN: usize = 44;
const FILLED: char = '━';
const EMPTY: char = '─';
const REDRAW: Duration = Duration::from_millis(50);
const CLEAR_LINE: &str = "\r\x1b[2K";

pub enum Update {
    Queued,
    Progress(Progress),
}

pub struct Line {
    ink: Ink,
    live: bool,
    drawn: Mutex<Option<(Instant, String)>>,
}

impl Default for Line {
    fn default() -> Self {
        Self {
            ink: Ink::stderr(),
            live: super::stderr_is_terminal(),
            drawn: Mutex::new(None),
        }
    }
}

impl Line {
    pub fn say(&self, text: &str) {
        self.draw(text.to_owned(), true);
    }

    pub fn clear(&self) {
        let mut drawn = self
            .drawn
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        if drawn.take().is_some() {
            eprint!("{CLEAR_LINE}");
            let _ = std::io::stderr().flush();
        }
    }

    fn draw(&self, line: String, urgent: bool) {
        if !self.live {
            return;
        }
        let mut drawn = self
            .drawn
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        if let Some((at, previous)) = drawn.as_ref()
            && (*previous == line || (!urgent && at.elapsed() < REDRAW))
        {
            return;
        }
        eprint!("{CLEAR_LINE}{line}");
        let _ = std::io::stderr().flush();
        *drawn = Some((Instant::now(), line));
    }
}

pub struct Status<'a> {
    line: Line,
    verb: Verb,
    name: &'a str,
}

impl<'a> Status<'a> {
    pub fn new(verb: Verb, name: &'a str) -> Self {
        Self {
            line: Line::default(),
            verb,
            name,
        }
    }

    fn doing(&self, stage: Stage) -> String {
        let name = self.name;
        match stage {
            Stage::Waiting => "Waiting for another change to software to finish".into(),
            Stage::Preparing => format!("Getting {name} ready"),
            Stage::Downloading => format!("Downloading {name}"),
            Stage::Installing => format!("{} {name}", self.verb.doing()),
            Stage::Removing => format!("Removing {name}"),
            Stage::Finishing => format!("Finishing {name}"),
        }
    }

    fn bar(&self, fraction: f32) -> String {
        let filled = ((fraction * BAR as f32).round() as usize).min(BAR);
        let ink = self.line.ink;
        format!(
            "{}{}  {:>3}%",
            ink.bold(FILLED.to_string().repeat(filled)),
            ink.dim(EMPTY.to_string().repeat(BAR - filled)),
            (fraction * 100.0).round() as u32
        )
    }

    pub fn show(&self, update: Update) {
        let (text, fraction) = match update {
            Update::Queued => (
                format!("Waiting for Schelf to {} {}", self.verb.base(), self.name),
                None,
            ),
            Update::Progress(progress) => (self.doing(progress.stage), progress.fraction),
        };
        let line = match fraction {
            Some(fraction) => {
                let room = super::width().saturating_sub(BAR + 8).min(TEXT_COLUMN);
                format!("{:<room$}  {}", truncate(&text, room), self.bar(fraction))
            }
            None => truncate(&format!("{text}…"), super::width() - 1),
        };
        self.line.draw(line, false);
    }

    pub fn clear(&self) {
        self.line.clear();
    }
}
