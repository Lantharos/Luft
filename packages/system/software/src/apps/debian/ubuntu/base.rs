use std::fs::{self, File};
use std::io::{Read, Seek, Write};
use std::path::Path;
use std::process::Stdio;

use flate2::read::GzDecoder;
use sha2::{Digest, Sha256};

use super::namespaced;
use crate::apps::debian::package;
use crate::http;
use crate::openpgp;
use crate::progress::Stage;
use crate::task::{CANCELLED, Task};

const RELEASE: &str = "26.04";
const RELEASES: &str = "https://cdimage.ubuntu.com/ubuntu-base/releases/26.04/release";
/// Ubuntu CD Image Automatic Signing Key (2012), 8439 38DF 228D 22F7 B374 2BC0 D94A A3F0 EFE2 1092
const SIGNING_KEY: &[u8] = include_bytes!("cdimage.gpg");
const UNVERIFIED: &str = "Ubuntu's download didn't match what Ubuntu signed, so it wasn't used.";
const UNPACKED: &str = "Ubuntu couldn't be unpacked.";
const CHUNK: usize = 1 << 20;

/// The newest point release of the base system for `architecture` that the checksums list, and its SHA-256.
fn newest(sums: &str, architecture: &str) -> Option<(String, String)> {
    let suffix = format!("-base-{architecture}.tar.gz");
    sums.lines()
        .filter_map(|line| {
            let (digest, name) = line.split_once(" *")?;
            let point = name
                .strip_prefix("ubuntu-base-")?
                .strip_suffix(&suffix)?
                .strip_prefix(RELEASE)?;
            let point = match point {
                "" => 0,
                point => point.strip_prefix('.')?.parse::<u32>().ok()?,
            };
            Some((point, name.to_owned(), digest.to_owned()))
        })
        .max_by_key(|(point, ..)| *point)
        .map(|(_, name, digest)| (name, digest))
}

fn sha256(path: &Path) -> Result<String, String> {
    let mut file = File::open(path).map_err(|error| error.to_string())?;
    let mut hasher = Sha256::new();
    let mut buffer = vec![0u8; CHUNK];
    loop {
        let read = file.read(&mut buffer).map_err(|error| error.to_string())?;
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
    }
    Ok(hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect())
}

/// Downloads Ubuntu's base system and unpacks it into `destination` once its signed checksum matches.
pub fn unpack(destination: &Path, task: Task) -> Result<(), String> {
    task.progress(Stage::Preparing, None);
    let sums = http::bytes(&format!("{RELEASES}/SHA256SUMS"))?;
    let signature = http::bytes(&format!("{RELEASES}/SHA256SUMS.gpg"))?;
    match openpgp::signed_by(SIGNING_KEY, &signature, &sums) {
        Some(true) => {}
        Some(false) => return Err(UNVERIFIED.into()),
        None => return Err("Ubuntu's download couldn't be checked.".into()),
    }
    let (name, digest) = newest(&String::from_utf8_lossy(&sums), package::here())
        .ok_or("Ubuntu isn't made for this computer's processor.")?;
    fs::create_dir_all(destination).map_err(|error| error.to_string())?;
    let archive = destination.with_extension("tar.gz");
    http::download(&format!("{RELEASES}/{name}"), &archive, None, task)?;
    let unpacked = sha256(&archive).and_then(|found| {
        if found == digest {
            extract(&archive, destination, task)
        } else {
            Err(UNVERIFIED.into())
        }
    });
    let _ = fs::remove_file(&archive);
    unpacked
}

/// Unpacks as Ubuntu's root, so files keep the users and groups they belong to.
fn extract(archive: &Path, destination: &Path, task: Task) -> Result<(), String> {
    let file = File::open(archive).map_err(|error| error.to_string())?;
    let size = file.metadata().map_err(|error| error.to_string())?.len();
    let mut tar = namespaced("tar")
        .args([
            "--extract",
            "--numeric-owner",
            "--preserve-permissions",
            "--file",
            "-",
            "--directory",
        ])
        .arg(destination)
        .stdin(Stdio::piped())
        .stdout(Stdio::null())
        .spawn()
        .map_err(|error| error.to_string())?;
    let mut input = tar.stdin.take().ok_or("tar didn't start.")?;
    let mut decoder = GzDecoder::new(file);
    let mut buffer = vec![0u8; CHUNK];
    let fed = loop {
        if task.cancel.is_cancelled() {
            break Err(CANCELLED.to_owned());
        }
        match decoder.read(&mut buffer) {
            Ok(0) => break Ok(()),
            Ok(read) => {
                if let Err(error) = input.write_all(&buffer[..read]) {
                    break Err(error.to_string());
                }
            }
            Err(_) => break Err(UNPACKED.to_owned()),
        }
        let position = decoder.get_mut().stream_position().unwrap_or(0);
        task.progress(Stage::Preparing, Some(position as f32 / size as f32));
    };
    drop(input);
    if fed.is_err() {
        let _ = tar.kill();
    }
    let status = tar.wait().map_err(|error| error.to_string())?;
    fed?;
    status
        .success()
        .then_some(())
        .ok_or_else(|| UNPACKED.into())
}

#[cfg(test)]
mod tests {
    use super::newest;

    #[test]
    fn picks_the_newest_point_release_for_the_architecture() {
        let sums = "046f *ubuntu-base-26.04-base-amd64.tar.gz\n\
            b2b4 *ubuntu-base-26.04-base-arm64.tar.gz\n\
            a496 *ubuntu-base-26.04.1-base-amd64.tar.gz\n\
            5a19 *ubuntu-base-26.04.1-base-arm64.tar.gz\n\
            a408 *ubuntu-base-26.04.1-base-armhf.tar.gz\n";
        assert_eq!(
            newest(sums, "amd64"),
            Some((
                "ubuntu-base-26.04.1-base-amd64.tar.gz".into(),
                "a496".into()
            ))
        );
        assert_eq!(newest(sums, "riscv64"), None);
    }
}
