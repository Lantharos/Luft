use std::collections::BTreeMap;
use std::process::{Command, Stdio};

use super::{Draft, fetch_keys, file_name, key_addresses, script};

const REPOSITORIES: &str = "/etc/yum.repos.d/";
const APPLICATIONS: &str = "/usr/share/applications/";
const SCRIPTLETS: &str = "%{PREIN}\n%{POSTIN}\n%{POSTTRANS}\n";

fn query(path: &str, format: &str) -> Result<String, String> {
    let output = Command::new("rpm")
        .args(["--query", "--package", "--nosignature", "--queryformat"])
        .arg(format)
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

/// One file from a package's payload.
fn extract(path: &str, file: &str) -> Result<String, String> {
    let mut archive = Command::new("rpm2cpio")
        .arg(path)
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| error.to_string())?;
    let stdout = archive.stdout.take().ok_or("rpm2cpio gave no output")?;
    let output = Command::new("cpio")
        .args(["--extract", "--quiet", "--to-stdout"])
        .arg(format!(".{file}"))
        .stdin(stdout)
        .stderr(Stdio::null())
        .output()
        .map_err(|error| error.to_string())?;
    let _ = archive.wait();
    if !output.status.success() || output.stdout.is_empty() {
        return Err(format!("{file} couldn't be read from the package."));
    }
    String::from_utf8(output.stdout).map_err(|_| format!("{file} isn't text."))
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
            extract(path, file)?,
        ),
        None => match script::written(&query(path, SCRIPTLETS)?)
            .into_iter()
            .next()
        {
            Some(written) => written,
            None => return Ok(None),
        },
    };
    let mut keys = BTreeMap::new();
    for address in key_addresses(&text) {
        if let Some(file) = address.strip_prefix("file://")
            && files.iter().any(|shipped| shipped == file)
        {
            keys.insert(address.clone(), extract(path, file)?);
        }
    }
    fetch_keys(Draft {
        file: file_name(&name),
        text,
        keys,
    })
    .map(Some)
}
