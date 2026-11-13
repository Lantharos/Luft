use std::io::IsTerminal;
use std::sync::OnceLock;
use std::sync::atomic::{AtomicBool, Ordering};

fn enabled() -> bool {
    static ENABLED: OnceLock<bool> = OnceLock::new();
    *ENABLED.get_or_init(|| {
        std::env::var_os("NO_COLOR").is_none()
            && (std::env::var_os("FORCE_COLOR").is_some() || std::io::stdout().is_terminal())
    })
}

fn truecolor() -> bool {
    static TRUECOLOR: OnceLock<bool> = OnceLock::new();
    *TRUECOLOR.get_or_init(|| {
        std::env::var("COLORTERM")
            .is_ok_and(|value| value.contains("truecolor") || value.contains("24bit"))
    })
}

fn paint(open: &str, close: &str, text: &str) -> String {
    if enabled() {
        format!("\x1b[{open}m{text}\x1b[{close}m")
    } else {
        text.to_owned()
    }
}

fn rgb(red: u8, green: u8, blue: u8, fallback: &str, text: &str) -> String {
    let open = if truecolor() {
        format!("38;2;{red};{green};{blue}")
    } else {
        fallback.to_owned()
    };
    paint(&open, "39", text)
}

pub fn bold(text: &str) -> String {
    paint("1", "22", text)
}

pub fn dim(text: &str) -> String {
    paint("2", "22", text)
}

pub fn underline(text: &str) -> String {
    paint("4", "24", text)
}

pub fn accent(text: &str) -> String {
    rgb(221, 195, 147, "33", text)
}

pub fn good(text: &str) -> String {
    rgb(143, 190, 140, "32", text)
}

pub fn warn(text: &str) -> String {
    rgb(230, 180, 100, "33", text)
}

pub fn bad(text: &str) -> String {
    rgb(232, 120, 110, "31", text)
}

pub fn muted(text: &str) -> String {
    rgb(162, 157, 147, "90", text)
}

pub fn link(url: &str) -> String {
    if enabled() {
        format!("\x1b]8;;{url}\x1b\\{}\x1b]8;;\x1b\\", underline(url))
    } else {
        url.to_owned()
    }
}

static INTERACTIVE: OnceLock<AtomicBool> = OnceLock::new();

fn interactivity() -> &'static AtomicBool {
    INTERACTIVE.get_or_init(|| {
        AtomicBool::new(
            std::io::stdout().is_terminal()
                && std::io::stdin().is_terminal()
                && !super::system::set("CI"),
        )
    })
}

/// Whether a person is at the terminal to answer questions and watch spinners.
pub fn interactive() -> bool {
    interactivity().load(Ordering::Relaxed)
}

pub fn without_prompts() {
    interactivity().store(false, Ordering::Relaxed);
}
