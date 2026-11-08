use std::fs::{self, DirBuilder, OpenOptions};
use std::io::{self, Write};
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::path::{Path, PathBuf};
use std::process::Command;

use super::key::PublicKey;
use crate::accounts::Account;

const FOLDER: &str = ".ssh";
const FILE: &str = "authorized_keys";
const STAGED: &str = "authorized_keys.new";
const RESTORECON: &str = "/usr/sbin/restorecon";

fn folder(account: &Account) -> PathBuf {
    account.home.join(FOLDER)
}

fn read(folder: &Path) -> io::Result<String> {
    match fs::read_to_string(folder.join(FILE)) {
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(String::new()),
        read => read,
    }
}

fn holds(line: &str, fingerprint: &str) -> bool {
    PublicKey::after_options(line).is_some_and(|key| key.fingerprint() == fingerprint)
}

fn replace(folder: &Path, text: &str) -> io::Result<()> {
    let staged = folder.join(STAGED);
    match fs::remove_file(&staged) {
        Err(error) if error.kind() != io::ErrorKind::NotFound => return Err(error),
        _ => {}
    }
    OpenOptions::new()
        .write(true)
        .create_new(true)
        .mode(0o600)
        .open(&staged)?
        .write_all(text.as_bytes())?;
    fs::rename(staged, folder.join(FILE))?;
    label(folder)
}

fn label(folder: &Path) -> io::Result<()> {
    let labelled = Command::new(RESTORECON)
        .arg(folder)
        .arg(folder.join(FILE))
        .status()?;
    if labelled.success() {
        Ok(())
    } else {
        Err(io::Error::other("Couldn't label the SSH keys for SELinux"))
    }
}

pub fn list(account: &Account) -> io::Result<Vec<PublicKey>> {
    Ok(read(&folder(account))?
        .lines()
        .filter_map(PublicKey::after_options)
        .collect())
}

pub fn add(account: &Account, key: &PublicKey) -> io::Result<()> {
    let folder = folder(account);
    let mut text = read(&folder)?;
    let fingerprint = key.fingerprint();
    if text.lines().any(|line| holds(line, &fingerprint)) {
        return Err(io::Error::new(
            io::ErrorKind::AlreadyExists,
            "This key can already sign in",
        ));
    }
    match DirBuilder::new().mode(0o700).create(&folder) {
        Err(error) if error.kind() != io::ErrorKind::AlreadyExists => return Err(error),
        _ => {}
    }
    if !text.is_empty() && !text.ends_with('\n') {
        text.push('\n');
    }
    text.push_str(&key.line());
    text.push('\n');
    replace(&folder, &text)
}

pub fn remove(account: &Account, fingerprint: &str) -> io::Result<bool> {
    let folder = folder(account);
    let text = read(&folder)?;
    let kept: String = text
        .lines()
        .filter(|line| !holds(line, fingerprint))
        .flat_map(|line| [line, "\n"])
        .collect();
    if kept.lines().count() == text.lines().count() {
        return Ok(false);
    }
    replace(&folder, &kept)?;
    Ok(true)
}
