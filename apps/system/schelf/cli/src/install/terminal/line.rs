use std::io::Write;
use std::sync::{Arc, Mutex, MutexGuard, Weak};
use std::thread;
use std::time::Duration;

use luft_dbus::runtime::block_on;
use zbus::{OwnedVariant, Proxy};

use super::{Ink, truncate};

const FRAME: Duration = Duration::from_millis(80);
const CLEAR_LINE: &str = "\r\x1b[2K";
const ROUND: &[char] = &['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SQUARE: &[char] = &['◰', '◳', '◲', '◱'];

struct Drawn {
    ink: Ink,
    frames: &'static [char],
    shown: bool,
    spinning: Option<String>,
    frame: usize,
}

impl Drawn {
    fn paint(&mut self, line: String) {
        eprint!("{CLEAR_LINE}{line}");
        let _ = std::io::stderr().flush();
        self.shown = true;
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

/// Whether Kestrel draws windows with round corners, as it does unless
/// told otherwise and everywhere else.
async fn rounded() -> bool {
    let Ok(connection) = luft_dbus::session().await else {
        return true;
    };
    let read = async {
        Proxy::new(
            connection,
            "org.freedesktop.portal.Desktop",
            "/org/freedesktop/portal/desktop",
            "org.freedesktop.portal.Settings",
        )
        .await?
        .call::<_, _, OwnedVariant>(
            "ReadOne",
            &("com.lantharos.kestrel", "rounded-window-corners"),
        )
        .await
    };
    read.await
        .ok()
        .and_then(|value| bool::try_from(value).ok())
        .unwrap_or(true)
}

/// The spinner's frames, round like Kestrel's window corners or square.
pub fn spinner() -> &'static [char] {
    if block_on(rounded()) { ROUND } else { SQUARE }
}

/// One line of stderr that's redrawn in place: a spinner beside what's happening.
pub struct Line {
    drawn: Option<Arc<Mutex<Drawn>>>,
}

impl Default for Line {
    fn default() -> Self {
        if !super::live() {
            return Self { drawn: None };
        }
        let frames = spinner();
        let drawn = Arc::new(Mutex::new(Drawn {
            ink: Ink::stderr(),
            frames,
            shown: false,
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

    pub fn clear(&self) {
        let Some(drawn) = &self.drawn else {
            return;
        };
        let mut drawn = lock(drawn);
        drawn.spinning = None;
        if std::mem::take(&mut drawn.shown) {
            eprint!("{CLEAR_LINE}");
            let _ = std::io::stderr().flush();
        }
    }
}
