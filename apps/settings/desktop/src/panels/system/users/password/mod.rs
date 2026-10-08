mod terminal;

use serde::{Deserialize, Serialize};

use terminal::Terminal;

const PROGRAM: &str = "passwd";

#[derive(Deserialize)]
pub struct Change {
    current: Option<String>,
    password: String,
}

#[derive(Serialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub enum Outcome {
    Changed,
    WrongPassword,
    TooShort,
    TooSimilar,
    DictionaryWord,
    TooSimple,
    Rejected,
}

enum Step {
    Answer(Outcome),
    Current,
    New,
    Wait,
}

const SIMILAR: [&str; 6] = [
    "similar",
    "same as the old",
    "palindrome",
    "case changes only",
    "rotated",
    "unchanged",
];
const SIMPLE: [&str; 6] = [
    "simple",
    "simplistic",
    "less than",
    "monotonic",
    "character classes",
    "sequence",
];

fn rejection(output: &str) -> Outcome {
    let contains = |words: &[&str]| words.iter().any(|word| output.contains(word));
    if contains(&["short", "longer"]) {
        Outcome::TooShort
    } else if contains(&["dictionary"]) {
        Outcome::DictionaryWord
    } else if contains(&SIMILAR) {
        Outcome::TooSimilar
    } else if contains(&SIMPLE) {
        Outcome::TooSimple
    } else {
        Outcome::Rejected
    }
}

fn step(output: &str, authenticated: bool) -> Step {
    let output = output.to_lowercase();
    if output.contains("successfully") {
        return Step::Answer(Outcome::Changed);
    }
    if output.contains("bad password") {
        return Step::Answer(rejection(&output));
    }
    let failed = ["failure", "error", "incorrect", "wrong", "denied"]
        .iter()
        .any(|word| output.contains(word));
    if failed {
        return Step::Answer(if authenticated {
            rejection(&output)
        } else {
            Outcome::WrongPassword
        });
    }
    if !output.trim_end().ends_with(':') {
        return Step::Wait;
    }
    if output.contains("current") || output.contains("old password") {
        Step::Current
    } else if output.contains("password") {
        Step::New
    } else {
        Step::Wait
    }
}

pub fn change(Change { current, password }: Change) -> Result<Outcome, String> {
    let failed = |error: std::io::Error| format!("Couldn't change your password: {error}");
    let mut passwd = Terminal::spawn(PROGRAM).map_err(failed)?;
    let mut output = String::new();
    let mut authenticated = false;
    while let Some(chunk) = passwd.read().map_err(failed)? {
        output.push_str(&chunk);
        match step(&output, authenticated) {
            Step::Answer(outcome) => return Ok(outcome),
            Step::Current => {
                let Some(current) = &current else {
                    return Ok(Outcome::WrongPassword);
                };
                passwd.answer(current).map_err(failed)?;
            }
            Step::New => {
                authenticated = true;
                passwd.answer(&password).map_err(failed)?;
            }
            Step::Wait => continue,
        }
        output.clear();
    }
    Ok(if authenticated {
        rejection(&output.to_lowercase())
    } else {
        Outcome::WrongPassword
    })
}
