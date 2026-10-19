use std::fs::{self, DirBuilder};
use std::io::Write;
use std::ops::Range;
use std::os::unix::fs::DirBuilderExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicU32, Ordering};

use super::super::elf::{self, Section};

const SIGNATURE: &str = ".sha256_sig";
const KEY: &str = ".sig_key";
const ARMOR: &[u8] = b"-----BEGIN";
const VALID: &str = "[GNUPG:] VALIDSIG ";

pub struct Signed {
    pub unsigned: Vec<Range<u64>>,
    signature: Vec<u8>,
}

pub fn key(path: &Path) -> Option<Vec<u8>> {
    elf::section_bytes(path, &elf::sections(path)?, KEY)
}

fn range(sections: &[Section], name: &str) -> Option<Range<u64>> {
    sections
        .iter()
        .find(|section| section.name == name)?
        .range()
}

pub fn signed(path: &Path) -> Option<Signed> {
    let sections = elf::sections(path)?;
    Some(Signed {
        unsigned: vec![range(&sections, SIGNATURE)?, range(&sections, KEY)?],
        signature: elf::section_bytes(path, &sections, SIGNATURE)?,
    })
}

struct Private(PathBuf);

impl Private {
    fn new() -> Result<Self, String> {
        static NEXT: AtomicU32 = AtomicU32::new(0);
        let base = dirs::runtime_dir().unwrap_or_else(std::env::temp_dir);
        let name = format!(
            "luft-appimage-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        );
        let path = base.join(name);
        DirBuilder::new()
            .mode(0o700)
            .create(&path)
            .map_err(|error| error.to_string())?;
        Ok(Self(path))
    }
}

impl Drop for Private {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

fn dearmored(key: &[u8], home: &Path) -> Result<Vec<u8>, String> {
    if !key.starts_with(ARMOR) {
        return Ok(key.to_vec());
    }
    let mut gpg = Command::new("gpg")
        .arg("--homedir")
        .arg(home)
        .args(["--batch", "--dearmor"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|_| unverifiable())?;
    gpg.stdin
        .take()
        .ok_or_else(unverifiable)?
        .write_all(key)
        .map_err(|_| unverifiable())?;
    let output = gpg.wait_with_output().map_err(|_| unverifiable())?;
    output
        .status
        .success()
        .then_some(output.stdout)
        .ok_or_else(unverifiable)
}

fn unverifiable() -> String {
    "The update's signature couldn't be checked.".into()
}

pub fn verify(key: &[u8], signed: &Signed, digest: &str) -> Result<(), String> {
    let private = Private::new()?;
    let keyring = private.0.join("keyring.gpg");
    let signature = private.0.join("signature.asc");
    let data = private.0.join("digest");
    let written = fs::write(&keyring, dearmored(key, &private.0)?)
        .and_then(|()| fs::write(&signature, &signed.signature))
        .and_then(|()| fs::write(&data, digest));
    written.map_err(|error| error.to_string())?;
    let output = Command::new("gpgv")
        .arg("--homedir")
        .arg(&private.0)
        .arg("--keyring")
        .arg(&keyring)
        .args(["--status-fd", "1"])
        .arg(&signature)
        .arg(&data)
        .stdin(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .map_err(|_| unverifiable())?;
    let valid = output.status.success()
        && String::from_utf8_lossy(&output.stdout)
            .lines()
            .any(|line| line.starts_with(VALID));
    valid
        .then_some(())
        .ok_or_else(|| "The update isn't signed by this app's publisher.".into())
}
