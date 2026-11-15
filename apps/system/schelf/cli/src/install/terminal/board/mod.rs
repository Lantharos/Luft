mod row;

use std::io::Write;
use std::sync::{Arc, Mutex, MutexGuard, Weak};
use std::thread;
use std::time::Duration;

pub use row::{Outcome, Update};
use row::{Row, State, Stream};

use super::{Ink, spinner};
use crate::install::commands::list_of;
use crate::install::perform::Plan;

const FRAME: Duration = Duration::from_millis(80);

struct Shown {
    rows: Vec<Row>,
    out: Ink,
    err: Ink,
    live: bool,
    frames: &'static [char],
    frame: usize,
    drawn: usize,
    kept: usize,
    said: Vec<Option<String>>,
}

impl Shown {
    fn keep(&mut self, index: usize) {
        let row = &self.rows[index];
        let State::Finished(outcome) = &row.state else {
            return;
        };
        let (stream, lines) = row.ending(outcome, self.out, self.err);
        let text: String = lines.iter().map(|line| format!("{line}\n")).collect();
        match stream {
            Stream::Out => {
                print!("{text}");
                let _ = std::io::stdout().flush();
            }
            Stream::Err => eprint!("{text}"),
        }
    }

    fn draw(&mut self) {
        if self.drawn > 0 {
            eprint!("\r\x1b[{}F\x1b[J", self.drawn);
        }
        while self.kept < self.rows.len() && self.rows[self.kept].finished() {
            self.keep(self.kept);
            self.kept += 1;
        }
        let width = super::width() - 1;
        let room = super::height().saturating_sub(1).max(2);
        let frame = self.frames[self.frame % self.frames.len()];
        let left = &self.rows[self.kept..];
        let shown = if left.len() > room {
            room - 1
        } else {
            left.len()
        };
        let mut text = String::new();
        for row in &left[..shown] {
            text.push_str(&row.line(self.err, frame, width));
            text.push_str("\x1b[K\n");
        }
        if shown < left.len() {
            let more = format!("  And {} more", left.len() - shown);
            text.push_str(&format!("{}\x1b[K\n", self.err.dim(more)));
        }
        eprint!("{text}");
        let _ = std::io::stderr().flush();
        self.drawn = shown + usize::from(shown < left.len());
    }

    fn log(&mut self, index: usize) {
        let said = self.rows[index].said();
        if said.is_some() && said != self.said[index] {
            eprintln!("{}", said.as_deref().unwrap_or_default());
        }
        self.said[index] = said;
    }
}

/// Everything a command installs, updates or removes at once, one line each,
/// redrawn in place on a terminal and told line by line anywhere else.
pub struct Board {
    shown: Arc<Mutex<Shown>>,
}

fn lock(shown: &Mutex<Shown>) -> MutexGuard<'_, Shown> {
    shown
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn tick(shown: Weak<Mutex<Shown>>) {
    thread::spawn(move || {
        loop {
            thread::sleep(FRAME);
            let Some(shown) = shown.upgrade() else {
                return;
            };
            let mut shown = lock(&shown);
            shown.frame += 1;
            shown.draw();
        }
    });
}

impl Board {
    pub fn new(plans: &[Plan]) -> Self {
        let live = super::live();
        let rows: Vec<Row> = plans.iter().map(Row::new).collect();
        let one_verb = plans.iter().all(|plan| plan.verb == plans[0].verb);
        if !live && one_verb && rows.len() > 1 {
            let names: Vec<String> = rows.iter().map(|row| row.name().to_owned()).collect();
            eprintln!("{} {}", plans[0].verb.doing(), list_of(&names));
        }
        let shown = Arc::new(Mutex::new(Shown {
            said: rows.iter().map(|_| None).collect(),
            rows,
            out: Ink::stdout(),
            err: Ink::stderr(),
            live,
            frames: if live { spinner() } else { &[] },
            frame: 0,
            drawn: 0,
            kept: 0,
        }));
        if live {
            lock(&shown).draw();
            tick(Arc::downgrade(&shown));
        }
        Self { shown }
    }

    pub fn update(&self, index: usize, update: Update) {
        let mut shown = lock(&self.shown);
        shown.rows[index].update(update);
        if !shown.live {
            shown.log(index);
        }
    }

    pub fn finish(&self, index: usize, outcome: Outcome) {
        let mut shown = lock(&self.shown);
        shown.rows[index].state = State::Finished(outcome);
        if !shown.live {
            shown.keep(index);
        }
    }

    pub fn close(self) {
        let mut shown = lock(&self.shown);
        if shown.live {
            shown.draw();
        }
    }
}
