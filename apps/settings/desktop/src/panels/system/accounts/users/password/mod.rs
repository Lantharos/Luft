mod terminal;

use luft_i18n::t;
use serde::{Deserialize, Serialize};

use specta::Type;
use terminal::Terminal;

use crate::L10N;

const PROGRAM: &str = "passwd";

#[derive(Deserialize, Type)]
pub struct PasswordChange {
    current: Option<String>,
    password: String,
}

#[derive(Serialize, Clone, Copy, Type)]
#[serde(rename_all = "camelCase")]
pub enum PasswordOutcome {
    Changed,
    WrongPassword,
    TooShort,
    TooSimilar,
    DictionaryWord,
    TooSimple,
    Rejected,
}

enum Step {
    Answer(PasswordOutcome),
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

fn rejection(output: &str) -> PasswordOutcome {
    let contains = |words: &[&str]| words.iter().any(|word| output.contains(word));
    if contains(&["short", "longer"]) {
        PasswordOutcome::TooShort
    } else if contains(&["dictionary"]) {
        PasswordOutcome::DictionaryWord
    } else if contains(&SIMILAR) {
        PasswordOutcome::TooSimilar
    } else if contains(&SIMPLE) {
        PasswordOutcome::TooSimple
    } else {
        PasswordOutcome::Rejected
    }
}

fn step(output: &str, authenticated: bool) -> Step {
    let output = output.to_lowercase();
    if output.contains("successfully") {
        return Step::Answer(PasswordOutcome::Changed);
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
            PasswordOutcome::WrongPassword
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

pub fn change(
    PasswordChange { current, password }: PasswordChange,
) -> Result<PasswordOutcome, String> {
    let failed = |error: std::io::Error| {
        t!(
            L10N,
            "desktop-users-password-failed",
            reason = error.to_string()
        )
    };
    let mut passwd = Terminal::spawn(PROGRAM).map_err(failed)?;
    let mut output = String::new();
    let mut authenticated = false;
    while let Some(chunk) = passwd.read().map_err(failed)? {
        output.push_str(&chunk);
        match step(&output, authenticated) {
            Step::Answer(outcome) => return Ok(outcome),
            Step::Current => {
                let Some(current) = &current else {
                    return Ok(PasswordOutcome::WrongPassword);
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
        PasswordOutcome::WrongPassword
    })
}
