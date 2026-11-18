use std::io::{self, BufReader, Read};
use std::process::{Command, Stdio};

use super::{Draft, fetch_keys, file_name, key_addresses, script};

const REPOSITORIES: &str = "/etc/yum.repos.d/";
const APPLICATIONS: &str = "/usr/share/applications/";
const SCRIPTLETS: &str = "%{PREIN}\n%{POSTIN}\n%{POSTTRANS}\n";
const CPIO_MAGIC: &[u8] = b"070701";
const CPIO_HEADER: usize = 110;
const CPIO_FIELD: usize = 8;
const CPIO_FILE_SIZE: usize = 6;
const CPIO_NAME_SIZE: usize = 11;
const CPIO_END: &str = "TRAILER!!!";

fn query(path: &str, format: &str) -> Result<String, String> {
    let output = Command::new("rpm")
        .args(["--query", "--package", "--nosignature", "--queryformat"])
        .arg(format)
        .arg("--")
        .arg(path)
        .stderr(Stdio::null())
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err("This package file is damaged or isn't meant for this computer.".into());
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

fn files(path: &str) -> Result<Vec<String>, String> {
    Ok(query(path, "[%{FILENAMES}\n]")?
        .lines()
        .map(str::to_owned)
        .collect())
}

/// The app menu entry a package file brings, when it's a desktop app.
pub fn desktop_entry(path: &str) -> Result<Option<String>, String> {
    Ok(files(path)?.into_iter().find_map(|file| {
        file.strip_prefix(APPLICATIONS)
            .filter(|name| name.ends_with(".desktop") && !name.contains('/'))
            .map(str::to_owned)
    }))
}

fn unreadable(_: impl std::fmt::Debug) -> String {
    "The package's files couldn't be read.".into()
}

fn padded(length: usize) -> usize {
    length.next_multiple_of(4)
}

/// The text of `files` in a cpio archive, in the order asked for. Reading
/// stops at the last of them.
fn entries(archive: &mut impl Read, files: &[&str]) -> Result<Vec<String>, String> {
    let mut found: Vec<Option<String>> = vec![None; files.len()];
    while found.iter().any(Option::is_none) {
        let mut header = [0; CPIO_HEADER];
        archive.read_exact(&mut header).map_err(unreadable)?;
        if !header.starts_with(CPIO_MAGIC) {
            return Err(unreadable(()));
        }
        let field = |index: usize| {
            let digits = &header[CPIO_MAGIC.len() + CPIO_FIELD * index..][..CPIO_FIELD];
            usize::from_str_radix(&String::from_utf8_lossy(digits), 16).map_err(unreadable)
        };
        let size = field(CPIO_FILE_SIZE)?;
        let name_size = field(CPIO_NAME_SIZE)?;
        let mut name = vec![0; padded(CPIO_HEADER + name_size) - CPIO_HEADER];
        archive.read_exact(&mut name).map_err(unreadable)?;
        let name = String::from_utf8_lossy(&name[..name_size.saturating_sub(1)]);
        if name == CPIO_END {
            break;
        }
        match files
            .iter()
            .position(|file| name.strip_prefix('.') == Some(file))
        {
            Some(wanted) => {
                let mut text = vec![0; padded(size)];
                archive.read_exact(&mut text).map_err(unreadable)?;
                text.truncate(size);
                found[wanted] =
                    Some(String::from_utf8(text).map_err(|_| format!("{name} isn't text."))?);
            }
            None => {
                io::copy(&mut archive.take(padded(size) as u64), &mut io::sink())
                    .map_err(unreadable)?;
            }
        }
    }
    files
        .iter()
        .zip(found)
        .map(|(file, text)| {
            text.ok_or_else(|| format!("{file} couldn't be read from the package."))
        })
        .collect()
}

/// Files from a package's payload, in the order asked for. The payload is
/// only unpacked as far as the last of them, so files near the start of a
/// large package are there at once.
fn extract(path: &str, files: &[&str]) -> Result<Vec<String>, String> {
    if files.is_empty() {
        return Ok(Vec::new());
    }
    let mut unpacking = Command::new("rpm2cpio")
        .arg("--")
        .arg(path)
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| error.to_string())?;
    let payload = unpacking.stdout.take().ok_or("rpm2cpio gave no output")?;
    let found = entries(&mut BufReader::new(payload), files);
    let _ = unpacking.kill();
    let _ = unpacking.wait();
    found
}

/// The repository a package brings so it keeps getting updates: a `.repo` file among its
/// files, or one its scriptlets write. Keys it carries itself are read from it, the others
/// fetched.
pub fn bundled(path: &str) -> Result<Option<Draft>, String> {
    let files = files(path)?;
    let shipped = files.iter().find(|file| {
        file.strip_prefix(REPOSITORIES)
            .is_some_and(|name| name.ends_with(".repo") && !name.contains('/'))
    });
    let (name, text) = match shipped {
        Some(file) => (
            file.trim_start_matches(REPOSITORIES)
                .trim_end_matches(".repo")
                .to_owned(),
            extract(path, &[file])?.remove(0),
        ),
        None => match script::written(&query(path, SCRIPTLETS)?)
            .into_iter()
            .next()
        {
            Some(written) => written,
            None => return Ok(None),
        },
    };
    let shipped_keys: Vec<(String, &str)> = key_addresses(&text)
        .into_iter()
        .filter_map(|address| {
            let file = files
                .iter()
                .find(|shipped| address.strip_prefix("file://") == Some(shipped.as_str()))?;
            Some((address, file.as_str()))
        })
        .collect();
    let key_files: Vec<&str> = shipped_keys.iter().map(|(_, file)| *file).collect();
    let keys = shipped_keys
        .iter()
        .map(|(address, _)| address.clone())
        .zip(extract(path, &key_files)?)
        .collect();
    fetch_keys(Draft {
        file: file_name(&name),
        text,
        keys,
    })
    .map(Some)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(name: &str, text: &str) -> Vec<u8> {
        let mut entry = format!(
            "070701{}{:08x}{}{:08x}{}{name}\0",
            "0".repeat(48),
            text.len(),
            "0".repeat(32),
            name.len() + 1,
            "0".repeat(8),
        )
        .into_bytes();
        entry.resize(padded(entry.len()), 0);
        entry.extend(text.bytes());
        entry.resize(padded(entry.len()), 0);
        entry
    }

    #[test]
    fn reading_stops_at_the_last_wanted_file() {
        let mut archive = [
            entry("./etc/pki/key.asc", "key"),
            entry("./etc/yum.repos.d/app.repo", "[app]\n"),
            entry("./usr/bin/app", "binary"),
        ]
        .concat();
        let rest = archive.len() - entry("./usr/bin/app", "binary").len();
        archive.truncate(rest);
        let found = entries(
            &mut archive.as_slice(),
            &["/etc/yum.repos.d/app.repo", "/etc/pki/key.asc"],
        );
        assert_eq!(found, Ok(vec!["[app]\n".to_owned(), "key".to_owned()]));
    }

    #[test]
    fn a_file_the_archive_lacks_is_named() {
        let mut archive = entry("./usr/bin/app", "binary");
        archive.extend(entry("TRAILER!!!", ""));
        let found = entries(&mut archive.as_slice(), &["/etc/yum.repos.d/app.repo"]);
        assert_eq!(
            found,
            Err("/etc/yum.repos.d/app.repo couldn't be read from the package.".to_owned())
        );
    }
}
