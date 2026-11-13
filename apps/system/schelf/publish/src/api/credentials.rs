use std::collections::BTreeMap;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

/// A sign-in kept on this computer for one store.
#[derive(Serialize, Deserialize, Clone)]
pub struct Stored {
    pub token: String,
    pub login: String,
}

type Credentials = BTreeMap<String, Stored>;

fn directory() -> PathBuf {
    if cfg!(windows) {
        let roaming = std::env::var_os("APPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|| {
                dirs::home_dir()
                    .unwrap_or_default()
                    .join("AppData")
                    .join("Roaming")
            });
        return roaming.join("schelf");
    }
    std::env::var_os("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| dirs::home_dir().unwrap_or_default().join(".config"))
        .join("schelf")
}

fn file() -> PathBuf {
    directory().join("credentials.json")
}

fn read_all() -> Credentials {
    std::fs::read_to_string(file())
        .ok()
        .and_then(|text| serde_json::from_str(&text).ok())
        .unwrap_or_default()
}

#[cfg(unix)]
fn private(path: &std::path::Path, mode: u32) -> std::io::Result<()> {
    use std::os::unix::fs::PermissionsExt;
    std::fs::set_permissions(path, std::fs::Permissions::from_mode(mode))
}

#[cfg(not(unix))]
fn private(_: &std::path::Path, _: u32) -> std::io::Result<()> {
    Ok(())
}

fn write_all(all: &Credentials) -> std::io::Result<()> {
    let text = serde_json::to_string_pretty(all).expect("credentials serialise");
    let path = file();
    let fresh = !path.exists();
    std::fs::write(&path, text)?;
    if fresh {
        private(&path, 0o600)?;
    }
    Ok(())
}

pub fn stored_session(api: &str) -> Option<Stored> {
    read_all().remove(api)
}

pub fn store_session(api: &str, token: &str, login: &str) -> std::io::Result<()> {
    let mut all = read_all();
    all.insert(
        api.to_owned(),
        Stored {
            token: token.to_owned(),
            login: login.to_owned(),
        },
    );
    let folder = directory();
    if !folder.exists() {
        std::fs::create_dir_all(&folder)?;
        private(&folder, 0o700)?;
    }
    write_all(&all)
}

pub fn forget_session(api: &str) -> std::io::Result<()> {
    let mut all = read_all();
    all.remove(api);
    if all.is_empty() {
        match std::fs::remove_file(file()) {
            Err(error) if error.kind() != std::io::ErrorKind::NotFound => Err(error),
            _ => Ok(()),
        }
    } else {
        write_all(&all)
    }
}
