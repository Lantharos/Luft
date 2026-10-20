use std::io::{self, BufRead, Write};

use rustix::termios::tcgetwinsize;
use sushi::failure_file::{DETAILS, FailureFile};

const CLEAR: &str = "\x1b[H\x1b[2J";
const SMALLEST_PAGE: usize = 5;
const USUAL_ROWS: usize = 24;

fn read_line() -> Option<String> {
    let mut line = String::new();
    match io::stdin().lock().read_line(&mut line) {
        Ok(0) | Err(_) => None,
        Ok(_) => Some(line.trim().to_owned()),
    }
}

fn page_length() -> usize {
    let rows = tcgetwinsize(io::stdout())
        .map(|size| usize::from(size.ws_row))
        .ok()
        .filter(|rows| *rows > 0)
        .unwrap_or(USUAL_ROWS);
    rows.saturating_sub(3).max(SMALLEST_PAGE)
}

fn show_details(screen: &FailureFile) {
    let mut out = io::stdout().lock();
    for page in screen.details.chunks(page_length()) {
        let _ = write!(out, "{CLEAR}");
        for line in page {
            let _ = writeln!(out, "{line}");
        }
        let _ = write!(
            out,
            "\nPress Enter for more, or type q and press Enter to go back: "
        );
        let _ = out.flush();
        if read_line().is_none_or(|answer| answer.eq_ignore_ascii_case("q")) {
            return;
        }
    }
}

fn show_choices(screen: &FailureFile) {
    let mut out = io::stdout().lock();
    let _ = writeln!(out, "{CLEAR}{}", screen.title);
    if let Some(reason) = &screen.reason {
        let _ = writeln!(out, "{reason}");
    }
    let _ = writeln!(out);
    for (number, choice) in screen.choices.iter().enumerate() {
        let _ = writeln!(out, "  {}  {}", number + 1, choice.label);
    }
    let _ = write!(out, "\nType a number and press Enter: ");
    let _ = out.flush();
}

pub fn ask(screen: &FailureFile) -> Option<String> {
    loop {
        show_choices(screen);
        let answer = read_line()?;
        let Some(choice) = answer
            .parse::<usize>()
            .ok()
            .and_then(|number| screen.choices.get(number.checked_sub(1)?))
        else {
            continue;
        };
        if choice.id == DETAILS {
            show_details(screen);
            continue;
        }
        return Some(choice.id.clone());
    }
}
