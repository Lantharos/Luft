use std::time::{Duration, Instant};

use luft_i18n::t;
use luft_software::progress::{Progress, Stage};

use super::super::{Ink, Look, bytes, marked, truncate};
use crate::install::perform::{Plan, Verb};
use crate::l10n::L10N;

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

/// What a row's words depend on, so they're only looked up again when it changes.
#[derive(Clone, Copy, PartialEq)]
enum Shape {
    Waiting,
    Queued,
    Working(Stage, Option<u64>),
    Finished,
}

impl State {
    fn shape(&self) -> Shape {
        match self {
            Self::Waiting => Shape::Waiting,
            Self::Queued => Shape::Queued,
            Self::Working(progress) => Shape::Working(
                progress.stage,
                progress.transfer.map(|transfer| transfer.total),
            ),
            Self::Finished(_) => Shape::Finished,
        }
    }
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
    /// Whether the speed was measured again.
    fn sample(&mut self, done: u64) -> bool {
        let now = Instant::now();
        match self.mark {
            Some((at, before)) if now - at >= SAMPLE => {
                let elapsed = (now - at).as_secs_f64();
                self.per_second = Some(done.saturating_sub(before) as f64 / elapsed);
                self.mark = Some((now, done));
                true
            }
            Some(_) => false,
            None => {
                self.mark = Some((now, done));
                false
            }
        }
    }
}

/// One thing being installed, updated or removed, on a line of its own,
/// with its words looked up once each time what it's doing changes.
pub struct Row {
    verb: Verb,
    name: String,
    from: Option<String>,
    state: State,
    rate: Rate,
    text: String,
    said: Option<String>,
    detail: String,
    percent: Option<(u32, String)>,
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
        let mut row = Self {
            verb: plan.verb,
            name: plan.name().to_owned(),
            from: plan.from.clone(),
            state: State::Waiting,
            rate: Rate::default(),
            text: String::new(),
            said: None,
            detail: String::new(),
            percent: None,
        };
        row.reword();
        row
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn finished(&self) -> bool {
        matches!(self.state, State::Finished(_))
    }

    pub fn update(&mut self, update: Update) {
        let before = self.state.shape();
        let mut resampled = false;
        self.state = match update {
            Update::Queued => State::Queued,
            Update::Progress(progress) => {
                if let Some(transfer) = progress.transfer {
                    resampled = self.rate.sample(transfer.done);
                }
                State::Working(progress)
            }
        };
        let changed = self.state.shape() != before;
        if changed {
            self.reword();
        }
        if let State::Working(progress) = &self.state {
            let progress = *progress;
            if changed || resampled {
                self.detail = self.detail(&progress);
            }
            self.measure(progress.fraction);
        }
    }

    pub fn finish(&mut self, outcome: Outcome) {
        self.state = State::Finished(outcome);
        self.reword();
    }

    fn reword(&mut self) {
        let verb = self.verb.key();
        let name = self.name.as_str();
        let (text, said) = match &self.state {
            State::Waiting => (t!(L10N, "cli-row-waiting", verb = verb, name = name), None),
            State::Queued => {
                let queued = t!(L10N, "cli-row-queued", verb = verb, name = name);
                (queued.clone(), Some(queued))
            }
            State::Working(progress) => {
                let doing = match progress.stage {
                    Stage::Waiting => {
                        t!(L10N, "cli-row-waiting-for-other", verb = verb, name = name)
                    }
                    Stage::Preparing => t!(L10N, "cli-row-preparing", name = name),
                    Stage::Downloading => t!(L10N, "cli-row-downloading", name = name),
                    Stage::Installing => t!(L10N, "cli-row-working", verb = verb, name = name),
                    Stage::Removing => t!(L10N, "cli-row-removing", name = name),
                    Stage::Finishing => t!(L10N, "cli-row-finishing", name = name),
                };
                let said = match progress.transfer {
                    Some(transfer) if progress.stage == Stage::Downloading => t!(
                        L10N,
                        "cli-row-downloading-size",
                        name = name,
                        size = bytes(transfer.total)
                    ),
                    _ => doing.clone(),
                };
                (doing, Some(said))
            }
            State::Finished(outcome) => (self.ending_text(outcome), None),
        };
        self.text = text;
        self.said = said;
    }

    fn ending_text(&self, outcome: &Outcome) -> String {
        let verb = self.verb.key();
        let name = self.name.as_str();
        match (outcome, &self.from) {
            (Outcome::Done(_), Some(from)) => t!(
                L10N,
                "cli-row-done-from",
                verb = verb,
                name = name,
                source = from.as_str()
            ),
            (Outcome::Done(_), None) => t!(L10N, "cli-row-done", verb = verb, name = name),
            (Outcome::Failed(error), _) => t!(
                L10N,
                "cli-row-failed",
                verb = verb,
                name = name,
                error = error.as_str()
            ),
            (Outcome::Stopped, _) => t!(L10N, "cli-row-stopped", verb = verb, name = name),
        }
    }

    /// What this row says while it's going, in a few words, for a line of its
    /// own or a log.
    pub fn said(&self) -> Option<&str> {
        self.said.as_deref()
    }

    fn detail(&self, progress: &Progress) -> String {
        let Some(transfer) = progress.transfer else {
            return String::new();
        };
        match self.rate.per_second {
            Some(speed) => format!(
                "{}  {}",
                bytes(transfer.total),
                t!(L10N, "cli-row-speed", speed = bytes(speed as u64))
            ),
            None => bytes(transfer.total),
        }
    }

    fn measure(&mut self, fraction: Option<f32>) {
        let Some(fraction) = fraction else {
            return;
        };
        let percent = (fraction * 100.0).round() as u32;
        if self
            .percent
            .as_ref()
            .is_none_or(|(shown, _)| *shown != percent)
        {
            self.percent = Some((percent, t!(L10N, "cli-row-percent", percent = percent)));
        }
    }

    fn bar(&self, ink: Ink, fraction: f32) -> String {
        let filled = ((fraction * BAR as f32).round() as usize).min(BAR);
        let percent = self.percent.as_ref().map_or("", |(_, text)| text.as_str());
        format!(
            "{}{}  {percent:>4}",
            ink.bold(FILLED.to_string().repeat(filled)),
            ink.dim(EMPTY.to_string().repeat(BAR - filled))
        )
    }

    fn working(&self, ink: Ink, progress: &Progress, frame: char, width: usize) -> String {
        let text = &self.text;
        let Some(fraction) = progress.fraction else {
            return format!("{} {}", ink.bold(frame), truncate(text, width - 2));
        };
        let gauge = 2 + 2 + BAR + 6;
        let with_detail = width.saturating_sub(gauge + 2 + DETAIL_COLUMN);
        let (room, detail) = if self.detail.is_empty() || with_detail < NARROWEST_TEXT {
            (width.saturating_sub(gauge).min(TEXT_COLUMN), String::new())
        } else {
            (
                with_detail.min(TEXT_COLUMN),
                format!("  {}", ink.dim(&self.detail)),
            )
        };
        format!(
            "{} {:<room$}  {}{detail}",
            ink.bold(frame),
            truncate(text, room),
            self.bar(ink, fraction)
        )
    }

    /// The row as one line no wider than `width`, while the set is going.
    pub fn line(&self, ink: Ink, frame: char, width: usize) -> String {
        match &self.state {
            State::Waiting => format!("  {}", ink.dim(truncate(&self.text, width - 2))),
            State::Queued => format!("{} {}", ink.bold(frame), truncate(&self.text, width - 2)),
            State::Working(progress) => self.working(ink, progress, frame, width),
            State::Finished(_) => fit(ink, &marked(&self.text), width),
        }
    }

    /// The lines left behind once the row finished, in full, and where they go:
    /// what was done to stdout with its notes, and what wasn't to stderr.
    pub fn ending(&self, out: Ink, err: Ink) -> Option<(Stream, Vec<String>)> {
        let State::Finished(outcome) = &self.state else {
            return None;
        };
        Some(match outcome {
            Outcome::Done(notes) => {
                let mut lines = vec![out.marked(&self.text)];
                lines.extend(notes.iter().map(|note| format!("  {note}")));
                (Stream::Out, lines)
            }
            Outcome::Failed(_) | Outcome::Stopped => (Stream::Err, vec![err.marked(&self.text)]),
        })
    }
}
