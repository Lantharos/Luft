use std::io::{BufRead, Write};

use anyhow::{Result, bail};
use rustix::termios::{self, LocalModes, OptionalActions};

use crate::disk::unlock::keys;
use crate::system::secrets::secret::Secret;

fn line(prompt: &str, hidden: bool) -> Result<Secret> {
    let stdin = std::io::stdin();
    print!("{prompt}: ");
    std::io::stdout().flush()?;
    let original = termios::tcgetattr(&stdin).ok();
    if let (true, Some(original)) = (hidden, &original) {
        let mut quiet = original.clone();
        quiet.local_modes.remove(LocalModes::ECHO);
        termios::tcsetattr(&stdin, OptionalActions::Now, &quiet)?;
    }
    let mut answer = String::new();
    let read = stdin.lock().read_line(&mut answer);
    if let (true, Some(original)) = (hidden, &original) {
        termios::tcsetattr(&stdin, OptionalActions::Now, original)?;
        println!();
    }
    read?;
    let secret = Secret::from(answer.trim_end_matches(['\n', '\r']));
    answer.clear();
    Ok(secret)
}

pub fn unlock_key() -> Result<Secret> {
    let prompt = if keys::has_escrow() {
        "Recovery key or passphrase (leave empty to use the stored recovery key)"
    } else {
        "Recovery key or passphrase"
    };
    line(prompt, true)
}

fn twice(prompt: &str) -> Result<Secret> {
    let first = line(prompt, true)?;
    if line("Again", true)? != first {
        bail!("Those didn't match.");
    }
    Ok(first)
}

pub fn new_pin() -> Result<Secret> {
    let pin = twice("New PIN (6 to 20 digits)")?;
    keys::check_pin(&pin)?;
    Ok(pin)
}

pub fn piped(count: usize) -> Result<Vec<Secret>> {
    let mut given = Vec::with_capacity(count);
    let mut line = String::new();
    for _ in 0..count {
        line.clear();
        std::io::stdin().lock().read_line(&mut line)?;
        given.push(Secret::from(line.trim_end_matches(['\n', '\r'])));
    }
    line.clear();
    Ok(given)
}
