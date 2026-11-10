use std::fs;
use std::os::unix::fs::chown;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};
use serde::Serialize;

use crate::command::{run, text};

const ARMOR: &str = "-----BEGIN PGP PUBLIC KEY BLOCK-----";
const LARGEST: usize = 1 << 20;
const NOBODY: u32 = 65534;

#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
pub struct Key {
    pub fingerprint: String,
    pub user: String,
}

pub fn parse_list(listed: &str) -> Vec<Key> {
    listed
        .lines()
        .filter_map(|line| {
            let (fingerprint, rest) = line.split_once(' ')?;
            Some(Key {
                fingerprint: fingerprint.to_ascii_uppercase(),
                user: rest.trim().trim_end_matches("public key").trim().to_owned(),
            })
        })
        .collect()
}

/// rpmkeys with a key database in `scratch`, as nobody in a sandbox that can write nowhere
/// else and reach no network: the keys it reads come from anyone, before a password is asked.
fn rpmkeys(scratch: &Path) -> Command {
    let mut command = Command::new("bwrap");
    command
        .args(["--ro-bind", "/", "/", "--dev", "/dev", "--bind"])
        .arg(scratch)
        .arg(scratch)
        .args([
            "--unshare-net",
            "--unshare-pid",
            "--unshare-ipc",
            "--unshare-uts",
        ])
        .args(["--die-with-parent", "--new-session", "--clearenv"])
        .args(["--setenv", "PATH", "/usr/bin:/usr/sbin"])
        .args(["--cap-drop", "ALL"])
        .args(["--cap-add", "CAP_SETUID", "--cap-add", "CAP_SETGID"])
        .args(["--", "setpriv", "--clear-groups", "--no-new-privs"])
        .arg(format!("--reuid={NOBODY}"))
        .arg(format!("--regid={NOBODY}"))
        .args(["--", "rpmkeys", "--dbpath"])
        .arg(scratch.join("db"));
    command
}

/// The keys in an armored OpenPGP block, as rpm reads them. Importing into a throwaway database
/// refuses what rpm itself wouldn't accept, such as keys bound with SHA-1.
pub fn read(armored: &str) -> Result<Vec<Key>> {
    if armored.len() > LARGEST || !armored.trim_start().starts_with(ARMOR) {
        bail!("This isn't a signing key.");
    }
    let scratch = tempfile()?;
    let listed = list(&scratch, armored);
    let _ = fs::remove_dir_all(&scratch);
    let keys = parse_list(&listed?);
    if keys.is_empty() {
        bail!("This isn't a signing key.");
    }
    Ok(keys)
}

fn list(scratch: &Path, armored: &str) -> Result<String> {
    let key = scratch.join("key.asc");
    fs::write(&key, armored)?;
    chown(scratch, Some(NOBODY), Some(NOBODY))?;
    run(rpmkeys(scratch).arg("--import").arg(&key)).context("This key can't check packages")?;
    text(rpmkeys(scratch).arg("--list"))
}

fn tempfile() -> Result<PathBuf> {
    let made = text(Command::new("mktemp").args(["--directory", "--tmpdir", "luft-key.XXXXXX"]))?;
    Ok(made.trim().into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_fingerprints_and_names_from_rpmkeys() {
        let listed = "3fef9748469adbe15da7ca80ac2d62742012ea22 Code signing for 1Password <codesign@1password.com> public key\n";
        assert_eq!(
            parse_list(listed),
            [Key {
                fingerprint: "3FEF9748469ADBE15DA7CA80AC2D62742012EA22".to_owned(),
                user: "Code signing for 1Password <codesign@1password.com>".to_owned(),
            }]
        );
    }
}
