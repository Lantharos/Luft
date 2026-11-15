use std::io::{IsTerminal, Write};

use luft_i18n::t;

use super::Ink;
use crate::l10n::L10N;

pub fn interactive() -> bool {
    std::io::stdin().is_terminal() && std::io::stderr().is_terminal()
}

fn ask(question: &str) -> Option<String> {
    eprint!("{question} ");
    let _ = std::io::stderr().flush();
    let mut answer = String::new();
    match std::io::stdin().read_line(&mut answer) {
        Ok(0) | Err(_) => {
            eprintln!();
            None
        }
        Ok(_) => Some(answer.trim().to_lowercase()),
    }
}

pub fn confirm(question: &str) -> bool {
    loop {
        match ask(&format!("{question} [Y/n]")).as_deref() {
            None => return false,
            Some("" | "y" | "yes") => return true,
            Some("n" | "no") => return false,
            Some(_) => eprintln!("{}", t!(L10N, "cli-prompt-yes-or-no")),
        }
    }
}

pub fn agree(question: &str) -> bool {
    loop {
        match ask(&format!("{question} [y/N]")).as_deref() {
            None | Some("" | "n" | "no") => return false,
            Some("y" | "yes") => return true,
            Some(_) => eprintln!("{}", t!(L10N, "cli-prompt-yes-or-no")),
        }
    }
}

pub fn choose(options: &[String]) -> Option<usize> {
    let ink = Ink::stderr();
    for (number, option) in options.iter().enumerate() {
        eprintln!("  {}  {option}", ink.bold(number + 1));
    }
    loop {
        let answer = ask(&t!(L10N, "cli-prompt-which", count = options.len()))?;
        match answer.parse::<usize>() {
            Ok(number) if (1..=options.len()).contains(&number) => return Some(number - 1),
            _ if answer.is_empty() || answer == "n" || answer == "no" => return None,
            _ => eprintln!("{}", t!(L10N, "cli-prompt-number", count = options.len())),
        }
    }
}
