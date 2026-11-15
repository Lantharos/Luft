pub mod board;
mod ink;
mod line;
pub mod prompt;
mod table;

use std::io::IsTerminal;

use luft_i18n::t;

pub use ink::Ink;
pub use line::Line;
use line::spinner;
pub use table::{Look, Table, marked, truncate};

use crate::l10n::L10N;

const NARROWEST: usize = 40;
const WIDEST: usize = 120;

pub fn stdout_is_terminal() -> bool {
    std::io::stdout().is_terminal()
}

pub fn stderr_is_terminal() -> bool {
    std::io::stderr().is_terminal()
}

/// Whether progress can be drawn in place on stderr: a terminal that takes
/// colour and moving the cursor.
pub fn live() -> bool {
    ink::wanted(stderr_is_terminal())
}

fn size() -> Option<libc::winsize> {
    let mut size: libc::winsize = unsafe { std::mem::zeroed() };
    [libc::STDOUT_FILENO, libc::STDERR_FILENO]
        .into_iter()
        .any(|fd| unsafe { libc::ioctl(fd, libc::TIOCGWINSZ, &mut size) } == 0 && size.ws_col > 0)
        .then_some(size)
}

pub fn width() -> usize {
    size().map_or(WIDEST, |size| {
        usize::from(size.ws_col).clamp(NARROWEST, WIDEST)
    })
}

pub fn height() -> usize {
    size().map_or(usize::MAX, |size| usize::from(size.ws_row))
}

#[derive(Clone, Copy)]
enum Unit {
    Kilobytes,
    Megabytes,
    Gigabytes,
    Terabytes,
}

pub fn bytes(size: u64) -> String {
    const UNITS: [Unit; 4] = [
        Unit::Kilobytes,
        Unit::Megabytes,
        Unit::Gigabytes,
        Unit::Terabytes,
    ];
    let mut amount = size as f64;
    if amount < 1000.0 {
        return t!(L10N, "cli-size-bytes", count = size);
    }
    let mut unit = UNITS[0];
    for next in UNITS {
        amount /= 1000.0;
        unit = next;
        if amount < 1000.0 {
            break;
        }
    }
    let amount = format!("{amount:.1}");
    match unit {
        Unit::Kilobytes => t!(L10N, "cli-size-kb", amount = amount),
        Unit::Megabytes => t!(L10N, "cli-size-mb", amount = amount),
        Unit::Gigabytes => t!(L10N, "cli-size-gb", amount = amount),
        Unit::Terabytes => t!(L10N, "cli-size-tb", amount = amount),
    }
}

fn paragraphs(text: &str) -> Vec<String> {
    let mut paragraphs: Vec<String> = Vec::new();
    let mut current = String::new();
    for line in text.lines().map(str::trim) {
        if line.is_empty() || line.starts_with("- ") {
            if !current.is_empty() {
                paragraphs.push(std::mem::take(&mut current));
            }
            if line.is_empty() {
                continue;
            }
        }
        if !current.is_empty() {
            current.push(' ');
        }
        current.push_str(line);
    }
    if !current.is_empty() {
        paragraphs.push(current);
    }
    paragraphs
}

pub fn wrap(text: &str, indent: &str) -> String {
    let room = width().min(88).saturating_sub(indent.len());
    let mut lines = Vec::new();
    for paragraph in paragraphs(text) {
        let item = paragraph.starts_with("- ");
        if !item && !lines.is_empty() {
            lines.push(String::new());
        }
        let mut line = String::new();
        for word in paragraph.split_whitespace() {
            if !line.is_empty() && line.chars().count() + 1 + word.chars().count() > room {
                lines.push(format!("{indent}{line}"));
                line = if item { "  ".to_owned() } else { String::new() };
            }
            if !line.trim().is_empty() {
                line.push(' ');
            }
            line.push_str(word);
        }
        lines.push(format!("{indent}{line}"));
    }
    lines.join("\n")
}
