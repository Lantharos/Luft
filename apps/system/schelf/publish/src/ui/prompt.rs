use std::io::{BufRead, Write};

use super::style::{accent, bold, muted};
use super::system::{Key, RawMode};

const INDENT: &str = "  ";

pub fn ask(question: &str, initial: Option<&str>) -> String {
    let suffix = initial
        .map(|value| format!(" {}", muted(value)))
        .unwrap_or_default();
    print!("{INDENT}{} {question}{suffix} ", accent("?"));
    let _ = std::io::stdout().flush();
    let mut answer = String::new();
    let _ = std::io::stdin().lock().read_line(&mut answer);
    let answer = answer.trim();
    if answer.is_empty() {
        initial.unwrap_or_default().to_owned()
    } else {
        answer.to_owned()
    }
}

pub fn confirm(question: &str, initial: bool) -> bool {
    let options = muted(if initial { "Y/n" } else { "y/N" });
    let answer = ask(&format!("{question} {options}"), None).to_lowercase();
    if answer.is_empty() {
        initial
    } else {
        answer.starts_with('y')
    }
}

pub struct Choice<T> {
    pub label: String,
    pub value: T,
    pub detail: Option<String>,
}

fn render<T>(choices: &[Choice<T>], selected: usize, first: bool) {
    let mut out = std::io::stdout();
    if !first {
        let _ = write!(out, "\x1b[{}A", choices.len());
    }
    for (index, choice) in choices.iter().enumerate() {
        let pointer = if index == selected {
            accent("›")
        } else {
            " ".into()
        };
        let label = if index == selected {
            bold(&choice.label)
        } else {
            choice.label.clone()
        };
        let detail = choice
            .detail
            .as_ref()
            .map(|detail| format!("  {}", muted(detail)))
            .unwrap_or_default();
        let _ = write!(out, "\r\x1b[2K{INDENT}  {pointer} {label}{detail}\r\n");
    }
    let _ = out.flush();
}

/// Lets the person pick one of `choices` with the arrow keys.
pub fn choose<T>(question: &str, mut choices: Vec<Choice<T>>) -> T {
    println!("{INDENT}{} {question}", accent("?"));
    let raw = RawMode::enter();
    let mut selected = 0;
    render(&choices, selected, true);
    loop {
        match raw.key() {
            Key::Up => selected = (selected + choices.len() - 1) % choices.len(),
            Key::Down => selected = (selected + 1) % choices.len(),
            Key::Return => break,
            Key::Interrupt => {
                drop(raw);
                std::process::exit(130);
            }
            Key::Other => {}
        }
        render(&choices, selected, false);
    }
    drop(raw);
    choices.swap_remove(selected).value
}
