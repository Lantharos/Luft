mod ink;
pub mod progress;
pub mod prompt;
mod table;

use std::io::IsTerminal;

pub use ink::Ink;
pub use table::{Look, Table, truncate};

const NARROWEST: usize = 40;
const WIDEST: usize = 120;

pub fn stdout_is_terminal() -> bool {
    std::io::stdout().is_terminal()
}

pub fn stderr_is_terminal() -> bool {
    std::io::stderr().is_terminal()
}

pub fn width() -> usize {
    let mut size: libc::winsize = unsafe { std::mem::zeroed() };
    let measured = [libc::STDOUT_FILENO, libc::STDERR_FILENO]
        .into_iter()
        .any(|fd| unsafe { libc::ioctl(fd, libc::TIOCGWINSZ, &mut size) } == 0 && size.ws_col > 0);
    if measured {
        usize::from(size.ws_col).clamp(NARROWEST, WIDEST)
    } else {
        WIDEST
    }
}

pub fn bytes(size: u64) -> String {
    const UNITS: [&str; 4] = ["kB", "MB", "GB", "TB"];
    let mut amount = size as f64;
    if amount < 1000.0 {
        return format!("{size} bytes");
    }
    let mut unit = UNITS[0];
    for next in UNITS {
        amount /= 1000.0;
        unit = next;
        if amount < 1000.0 {
            break;
        }
    }
    format!("{amount:.1} {unit}")
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
