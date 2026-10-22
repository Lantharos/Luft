use std::fs;
use std::process::Command;

use anyhow::{Context, Result, bail};
use serde::Serialize;

use crate::command::{run, text};

const ARMOR: &str = "-----BEGIN PGP PUBLIC KEY BLOCK-----";
const LARGEST: usize = 1 << 20;

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

/// The keys in an armored OpenPGP block, as rpm reads them. Importing into a throwaway database
/// refuses what rpm itself wouldn't accept, such as keys bound with SHA-1.
pub fn read(armored: &str) -> Result<Vec<Key>> {
    if armored.len() > LARGEST || !armored.trim_start().starts_with(ARMOR) {
        bail!("This isn't a signing key.");
    }
    let scratch = tempfile()?;
    let key = scratch.join("key.asc");
    fs::write(&key, armored)?;
    let database = scratch.join("db");
    let imported = run(Command::new("rpmkeys")
        .arg("--dbpath")
        .arg(&database)
        .arg("--import")
        .arg(&key))
    .context("This key can't check packages");
    let listed = imported.and_then(|_| {
        text(
            Command::new("rpmkeys")
                .arg("--dbpath")
                .arg(&database)
                .arg("--list"),
        )
    });
    let _ = fs::remove_dir_all(&scratch);
    let keys = parse_list(&listed?);
    if keys.is_empty() {
        bail!("This isn't a signing key.");
    }
    Ok(keys)
}

fn tempfile() -> Result<std::path::PathBuf> {
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
