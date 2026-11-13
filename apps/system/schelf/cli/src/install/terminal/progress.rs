use luft_software::progress::{Progress, Stage};

use super::{Ink, Line, truncate};
use crate::install::perform::Verb;

const BAR: usize = 24;
const TEXT_COLUMN: usize = 44;
const FILLED: char = '━';
const EMPTY: char = '─';

pub enum Update {
    Queued,
    Progress(Progress),
}

pub struct Status<'a> {
    line: Line,
    ink: Ink,
    verb: Verb,
    name: &'a str,
}

impl<'a> Status<'a> {
    pub fn new(verb: Verb, name: &'a str) -> Self {
        Self {
            line: Line::default(),
            ink: Ink::stderr(),
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
        let ink = self.ink;
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
        match fraction {
            Some(fraction) => {
                let room = super::width().saturating_sub(BAR + 8).min(TEXT_COLUMN);
                let bar = self.bar(fraction);
                self.line
                    .show(format!("{:<room$}  {bar}", truncate(&text, room)));
            }
            None => self.line.say(&text),
        }
    }

    pub fn clear(&self) {
        self.line.clear();
    }
}
