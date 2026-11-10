use std::io::{BufRead, Write};

use anyhow::{Result, bail};
use rustix::termios::{self, LocalModes, OptionalActions};

use crate::disk::unlock::keys;
use crate::system::secrets::secret::Secret;

const ANSWER_ROOM: usize = 4096;

fn read(input: &mut impl BufRead) -> std::io::Result<Secret> {
    let mut answer = Vec::with_capacity(ANSWER_ROOM);
    input.read_until(b'\n', &mut answer)?;
    while matches!(answer.last(), Some(b'\n' | b'\r')) {
        answer.pop();
    }
    Ok(Secret::new(answer))
}

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
    let answer = read(&mut stdin.lock());
    if let (true, Some(original)) = (hidden, &original) {
        termios::tcsetattr(&stdin, OptionalActions::Now, original)?;
        println!();
    }
    Ok(answer?)
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
    let mut stdin = std::io::stdin().lock();
    (0..count).map(|_| Ok(read(&mut stdin)?)).collect()
}
