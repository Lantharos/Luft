use std::time::{Duration, Instant};

use luft_software::progress::{Progress, Stage};

use super::super::{Ink, Look, bytes, truncate};
use crate::install::perform::{Plan, Verb};

const BAR: usize = 24;
const TEXT_COLUMN: usize = 44;
const DETAIL_COLUMN: usize = 20;
const NARROWEST_TEXT: usize = 16;
const FILLED: char = '━';
const EMPTY: char = '─';
const SAMPLE: Duration = Duration::from_millis(500);

pub enum Update {
    Queued,
    Progress(Progress),
}

pub enum Outcome {
    Done(Vec<String>),
    Failed(String),
    Stopped,
}

pub enum State {
    Waiting,
    Queued,
    Working(Progress),
    Finished(Outcome),
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Stream {
    Out,
    Err,
}

/// How fast a download goes, measured over the last half second or so.
#[derive(Default)]
struct Rate {
    mark: Option<(Instant, u64)>,
    per_second: Option<f64>,
}

impl Rate {
    fn sample(&mut self, done: u64) {
        let now = Instant::now();
        match self.mark {
            Some((at, before)) if now - at >= SAMPLE => {
                let elapsed = (now - at).as_secs_f64();
                self.per_second = Some(done.saturating_sub(before) as f64 / elapsed);
                self.mark = Some((now, done));
            }
            Some(_) => {}
            None => self.mark = Some((now, done)),
        }
    }
}

/// One thing being installed, updated or removed, on a line of its own.
pub struct Row {
    verb: Verb,
    name: String,
    from: Option<String>,
    pub state: State,
    rate: Rate,
}

/// Paints `parts`, cut off with an ellipsis where they'd run past `room`.
fn fit(ink: Ink, parts: &[(Look, &str)], room: usize) -> String {
    let mut left = room;
    let mut line = String::new();
    for (look, text) in parts {
        if left == 0 {
            break;
        }
        let count = text.chars().count();
        let shown = if count > left {
            truncate(text, left)
        } else {
            (*text).to_owned()
        };
        left = left.saturating_sub(count);
        line.push_str(&look.paint(ink, &shown));
    }
    line
}

impl Row {
    pub fn new(plan: &Plan) -> Self {
        Self {
            verb: plan.verb,
            name: plan.name().to_owned(),
            from: plan.from.clone(),
            state: State::Waiting,
            rate: Rate::default(),
        }
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn finished(&self) -> bool {
        matches!(self.state, State::Finished(_))
    }

    pub fn update(&mut self, update: Update) {
        self.state = match update {
            Update::Queued => State::Queued,
            Update::Progress(progress) => {
                if let Some(transfer) = progress.transfer {
                    self.rate.sample(transfer.done);
                }
                State::Working(progress)
            }
        };
    }

    fn doing(&self, stage: Stage) -> String {
        let name = &self.name;
        match stage {
            Stage::Waiting => format!(
                "Waiting to {} {name} until another change to software finishes",
                self.verb.base()
            ),
            Stage::Preparing => format!("Getting {name} ready"),
            Stage::Downloading => format!("Downloading {name}"),
            Stage::Installing => format!("{} {name}", self.verb.doing()),
            Stage::Removing => format!("Removing {name}"),
            Stage::Finishing => format!("Finishing {name}"),
        }
    }

    fn waiting(&self) -> String {
        format!("Waiting to {} {}", self.verb.base(), self.name)
    }

    fn queued(&self) -> String {
        format!("Waiting for Schelf to {} {}", self.verb.base(), self.name)
    }

    /// What this row says while it's going, in a few words, for a line of its
    /// own or a log.
    pub fn said(&self) -> Option<String> {
        match &self.state {
            State::Waiting | State::Finished(_) => None,
            State::Queued => Some(self.queued()),
            State::Working(progress) => {
                let doing = self.doing(progress.stage);
                Some(match progress.transfer {
                    Some(transfer) if progress.stage == Stage::Downloading => {
                        format!("{doing}, {}", bytes(transfer.total))
                    }
                    _ => doing,
                })
            }
        }
    }

    fn detail(&self, progress: &Progress) -> String {
        let Some(transfer) = progress.transfer else {
            return String::new();
        };
        match self.rate.per_second {
            Some(speed) => format!("{}  {}/s", bytes(transfer.total), bytes(speed as u64)),
            None => bytes(transfer.total),
        }
    }

    fn bar(ink: Ink, fraction: f32) -> String {
        let filled = ((fraction * BAR as f32).round() as usize).min(BAR);
        format!(
            "{}{}  {:>3}%",
            ink.bold(FILLED.to_string().repeat(filled)),
            ink.dim(EMPTY.to_string().repeat(BAR - filled)),
            (fraction * 100.0).round() as u32
        )
    }

    fn working(&self, ink: Ink, progress: &Progress, frame: char, width: usize) -> String {
        let text = self.doing(progress.stage);
        let Some(fraction) = progress.fraction else {
            return format!("{} {}", ink.bold(frame), truncate(&text, width - 2));
        };
        let gauge = 2 + 2 + BAR + 6;
        let detail = self.detail(progress);
        let with_detail = width.saturating_sub(gauge + 2 + DETAIL_COLUMN);
        let (room, detail) = if detail.is_empty() || with_detail < NARROWEST_TEXT {
            (width.saturating_sub(gauge).min(TEXT_COLUMN), String::new())
        } else {
            (
                with_detail.min(TEXT_COLUMN),
                format!("  {}", ink.dim(detail)),
            )
        };
        format!(
            "{} {:<room$}  {}{detail}",
            ink.bold(frame),
            truncate(&text, room),
            Self::bar(ink, fraction)
        )
    }

    /// The row as one line no wider than `width`, while the set is going.
    pub fn line(&self, ink: Ink, frame: char, width: usize) -> String {
        match &self.state {
            State::Waiting => format!("  {}", ink.dim(truncate(&self.waiting(), width - 2))),
            State::Queued => format!(
                "{} {}",
                ink.bold(frame),
                truncate(&self.queued(), width - 2)
            ),
            State::Working(progress) => self.working(ink, progress, frame, width),
            State::Finished(outcome) => self.ended(ink, outcome, width),
        }
    }

    fn origin(&self) -> String {
        self.from
            .as_ref()
            .map(|from| format!(" from {from}"))
            .unwrap_or_default()
    }

    fn ended(&self, ink: Ink, outcome: &Outcome, width: usize) -> String {
        let from = self.origin();
        let failed = format!("Couldn't {}", self.verb.base());
        let stopped = self.stopped();
        let parts: Vec<(Look, &str)> = match outcome {
            Outcome::Done(_) => vec![
                (Look::Done, self.verb.done()),
                (Look::Plain, " "),
                (Look::Bold, &self.name),
                (Look::Plain, &from),
            ],
            Outcome::Failed(error) => vec![
                (Look::Failed, &failed),
                (Look::Plain, " "),
                (Look::Bold, &self.name),
                (Look::Plain, ": "),
                (Look::Plain, error),
            ],
            Outcome::Stopped => vec![(Look::Plain, &stopped)],
        };
        fit(ink, &parts, width)
    }

    fn stopped(&self) -> String {
        format!(
            "Stopped {} {}.",
            self.verb.doing().to_lowercase(),
            self.name
        )
    }

    /// The lines left behind once the row finished, in full, and where they go:
    /// what was done to stdout with its notes, and what wasn't to stderr.
    pub fn ending(&self, outcome: &Outcome, out: Ink, err: Ink) -> (Stream, Vec<String>) {
        let name = &self.name;
        match outcome {
            Outcome::Done(notes) => {
                let mut lines = vec![format!(
                    "{} {}{}",
                    out.done(self.verb.done()),
                    out.bold(name),
                    self.origin()
                )];
                lines.extend(notes.iter().map(|note| format!("  {note}")));
                (Stream::Out, lines)
            }
            Outcome::Failed(error) => (
                Stream::Err,
                vec![format!(
                    "{} {}: {error}",
                    err.failed(format!("Couldn't {}", self.verb.base())),
                    err.bold(name)
                )],
            ),
            Outcome::Stopped => (Stream::Err, vec![self.stopped()]),
        }
    }
}
