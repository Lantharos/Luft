use std::io::{IsTerminal, Write};

use super::Ink;

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
            Some(_) => eprintln!("Answer y or n."),
        }
    }
}

pub fn choose(options: &[String]) -> Option<usize> {
    let ink = Ink::stderr();
    for (number, option) in options.iter().enumerate() {
        eprintln!("  {}  {option}", ink.bold(number + 1));
    }
    loop {
        let answer = ask(&format!("Which one? [1-{}]", options.len()))?;
        match answer.parse::<usize>() {
            Ok(number) if (1..=options.len()).contains(&number) => return Some(number - 1),
            _ if answer.is_empty() || answer == "n" || answer == "no" => return None,
            _ => eprintln!("Answer with a number from 1 to {}.", options.len()),
        }
    }
}
