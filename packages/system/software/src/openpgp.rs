use std::fs::{self, DirBuilder};
use std::io::Write;
use std::os::unix::fs::DirBuilderExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicU32, Ordering};

const ARMOR: &[u8] = b"-----BEGIN";
const VALID: &str = "[GNUPG:] VALIDSIG ";

struct Private(PathBuf);

impl Private {
    fn new() -> Option<Self> {
        static NEXT: AtomicU32 = AtomicU32::new(0);
        let base = dirs::runtime_dir().unwrap_or_else(std::env::temp_dir);
        let name = format!(
            "luft-openpgp-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        );
        let path = base.join(name);
        DirBuilder::new().mode(0o700).create(&path).ok()?;
        Some(Self(path))
    }
}

impl Drop for Private {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

fn dearmored(key: &[u8], home: &Path) -> Option<Vec<u8>> {
    if !key.starts_with(ARMOR) {
        return Some(key.to_vec());
    }
    let mut gpg = Command::new("gpg")
        .arg("--homedir")
        .arg(home)
        .args(["--batch", "--dearmor"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .ok()?;
    gpg.stdin.take()?.write_all(key).ok()?;
    let output = gpg.wait_with_output().ok()?;
    output.status.success().then_some(output.stdout)
}

/// Whether `signature` is `key`'s over `data`, or `None` when that couldn't be checked.
pub fn signed_by(key: &[u8], signature: &[u8], data: &[u8]) -> Option<bool> {
    let private = Private::new()?;
    let keyring = private.0.join("keyring.gpg");
    let detached = private.0.join("signature");
    let signed = private.0.join("data");
    fs::write(&keyring, dearmored(key, &private.0)?)
        .and_then(|()| fs::write(&detached, signature))
        .and_then(|()| fs::write(&signed, data))
        .ok()?;
    let output = Command::new("gpgv")
        .arg("--homedir")
        .arg(&private.0)
        .arg("--keyring")
        .arg(&keyring)
        .args(["--status-fd", "1"])
        .arg(&detached)
        .arg(&signed)
        .stdin(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .ok()?;
    Some(
        output.status.success()
            && String::from_utf8_lossy(&output.stdout)
                .lines()
                .any(|line| line.starts_with(VALID)),
    )
}
