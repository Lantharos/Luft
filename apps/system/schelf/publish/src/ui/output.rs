use std::io::Write;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc;
use std::time::Duration;

use serde::Serialize;

use super::json;
use super::style::{accent, bad, bold, dim, good, interactive, muted, warn};

const FRAMES: [&str; 10] = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const INDENT: &str = "  ";
const FRAME: Duration = Duration::from_millis(80);

static JSON: AtomicBool = AtomicBool::new(false);

pub fn print_json() {
    JSON.store(true, Ordering::Relaxed);
}

fn write(line: &str) {
    if JSON.load(Ordering::Relaxed) {
        eprintln!("{line}");
    } else {
        println!("{line}");
    }
}

/// Prints `data` on standard output when the command was asked for JSON.
pub fn emit(data: &impl Serialize) {
    if JSON.load(Ordering::Relaxed) {
        println!("{}", json::pretty(data));
    }
}

pub fn blank() {
    write("");
}

pub fn title(text: &str) {
    write(&format!("\n{INDENT}{}\n", bold(text)));
}

pub fn line(text: &str) {
    if text.is_empty() {
        write("");
    } else {
        write(&format!("{INDENT}{text}"));
    }
}

pub fn note(text: &str) {
    write(&format!("{INDENT}{}", muted(text)));
}

pub fn done(text: &str) {
    write(&format!("{INDENT}{} {text}", good("✓")));
}

pub fn caution(text: &str) {
    write(&format!("{INDENT}{} {text}", warn("!")));
}

pub fn problem(text: &str) {
    write(&format!("{INDENT}{} {text}", bad("✕")));
}

pub fn failure(text: &str) {
    eprintln!("{INDENT}{} {text}", bad("✕"));
}

pub fn field(label: &str, value: &str) {
    field_in(label, value, 14);
}

pub fn field_in(label: &str, value: &str, width: usize) {
    write(&format!("{INDENT}{}{value}", muted(&pad(label, width))));
}

/// Pads `text` to `width` characters, as JavaScript's `padEnd` does.
pub fn pad(text: &str, width: usize) -> String {
    format!("{text:width$}")
}

pub fn next(steps: &[String]) {
    blank();
    line(&bold("Next"));
    for (index, step) in steps.iter().enumerate() {
        line(&format!("{} {step}", dim(&format!("{}.", index + 1))));
    }
    blank();
}

/// Runs `work` behind a spinner and says how it went.
pub fn step<T, E>(
    label: &str,
    work: impl FnOnce() -> Result<T, E>,
    finished: impl FnOnce(&T) -> String,
) -> Result<T, E> {
    if !interactive() {
        let result = work()?;
        done(&finished(&result));
        return Ok(result);
    }
    let (stop, stopped) = mpsc::channel::<()>();
    let text = label.to_owned();
    let spinner = std::thread::spawn(move || {
        let mut frame = 0;
        loop {
            print!("\r\x1b[2K{INDENT}{} {text}", accent(FRAMES[frame]));
            let _ = std::io::stdout().flush();
            if stopped.recv_timeout(FRAME).is_ok() {
                break;
            }
            frame = (frame + 1) % FRAMES.len();
        }
    });
    let result = work();
    let _ = stop.send(());
    let _ = spinner.join();
    print!("\r\x1b[2K");
    let _ = std::io::stdout().flush();
    match &result {
        Ok(value) => done(&finished(value)),
        Err(_) => failure(label),
    }
    result
}

/// [`step`] that says the label again once done.
pub fn step_plain<T, E>(label: &str, work: impl FnOnce() -> Result<T, E>) -> Result<T, E> {
    step(label, work, |_| label.to_owned())
}
