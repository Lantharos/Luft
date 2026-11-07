use std::io::Write;
use std::sync::{Arc, Mutex, MutexGuard, Weak};
use std::thread;
use std::time::{Duration, Instant};

use luft_app::{Corners, block_on};

use super::{Ink, truncate};

const REDRAW: Duration = Duration::from_millis(50);
const FRAME: Duration = Duration::from_millis(80);
const CLEAR_LINE: &str = "\r\x1b[2K";
const ROUND: &[char] = &['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SQUARE: &[char] = &['◰', '◳', '◲', '◱'];

struct Drawn {
    ink: Ink,
    frames: &'static [char],
    shown: Option<(Instant, String)>,
    spinning: Option<String>,
    frame: usize,
}

impl Drawn {
    fn paint(&mut self, line: String) {
        eprint!("{CLEAR_LINE}{line}");
        let _ = std::io::stderr().flush();
        self.shown = Some((Instant::now(), line));
    }

    fn spin(&mut self) {
        let Some(text) = &self.spinning else {
            return;
        };
        let frame = self.frames[self.frame % self.frames.len()];
        let line = format!(
            "{} {}",
            self.ink.bold(frame),
            truncate(text, super::width() - 3)
        );
        self.paint(line);
    }
}

/// One line of stderr that's redrawn in place: a spinner beside what's happening, or a line of its own.
pub struct Line {
    drawn: Option<Arc<Mutex<Drawn>>>,
}

impl Default for Line {
    fn default() -> Self {
        if !super::stderr_is_terminal() {
            return Self { drawn: None };
        }
        let frames = match block_on(Corners::current()) {
            Corners::Square => SQUARE,
            Corners::Rounded => ROUND,
        };
        let drawn = Arc::new(Mutex::new(Drawn {
            ink: Ink::stderr(),
            frames,
            shown: None,
            spinning: None,
            frame: 0,
        }));
        tick(Arc::downgrade(&drawn));
        Self { drawn: Some(drawn) }
    }
}

fn lock(drawn: &Mutex<Drawn>) -> MutexGuard<'_, Drawn> {
    drawn
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn tick(drawn: Weak<Mutex<Drawn>>) {
    thread::spawn(move || {
        loop {
            thread::sleep(FRAME);
            let Some(drawn) = drawn.upgrade() else {
                return;
            };
            let mut drawn = lock(&drawn);
            if drawn.spinning.is_some() {
                drawn.frame += 1;
                drawn.spin();
            }
        }
    });
}

impl Line {
    pub fn say(&self, text: &str) {
        let Some(drawn) = &self.drawn else {
            return;
        };
        let mut drawn = lock(drawn);
        if drawn.spinning.as_deref() == Some(text) {
            return;
        }
        drawn.spinning = Some(text.to_owned());
        drawn.spin();
    }

    pub fn show(&self, line: String) {
        let Some(drawn) = &self.drawn else {
            return;
        };
        let mut drawn = lock(drawn);
        drawn.spinning = None;
        if let Some((at, previous)) = &drawn.shown
            && (*previous == line || at.elapsed() < REDRAW)
        {
            return;
        }
        drawn.paint(line);
    }

    pub fn clear(&self) {
        let Some(drawn) = &self.drawn else {
            return;
        };
        let mut drawn = lock(drawn);
        drawn.spinning = None;
        if drawn.shown.take().is_some() {
            eprint!("{CLEAR_LINE}");
            let _ = std::io::stderr().flush();
        }
    }
}
