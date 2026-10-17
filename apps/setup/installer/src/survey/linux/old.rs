use std::fs;
use std::path::Path;

use super::accounts::{self, Account};
use super::fstab::{self, Entry};
use super::packages;
use super::release::{self, Release};

const CONNECTIONS: &str = "etc/NetworkManager/system-connections";
const SSH: &str = "etc/ssh";
const HOST_KEY: &str = "ssh_host_";

pub struct Carried {
    pub name: String,
    pub contents: Vec<u8>,
}

pub struct OldSystem {
    pub release: Release,
    pub hostname: Option<String>,
    pub accounts: Vec<Account>,
    pub fstab: Vec<Entry>,
    pub networks: Vec<Carried>,
    pub host_keys: Vec<Carried>,
    pub packages: Vec<String>,
}

fn text(root: &Path, path: &str) -> String {
    fs::read_to_string(root.join(path)).unwrap_or_default()
}

fn files(folder: &Path, wanted: impl Fn(&str) -> bool) -> Vec<Carried> {
    let Ok(entries) = fs::read_dir(folder) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_file()))
        .filter_map(|entry| {
            let name = entry.file_name().to_str()?.to_owned();
            if !wanted(&name) {
                return None;
            }
            Some(Carried {
                contents: fs::read(entry.path()).ok()?,
                name,
            })
        })
        .collect()
}

pub fn looks_installed(root: &Path) -> bool {
    root.join("etc/os-release").is_file() && root.join("etc/fstab").is_file()
}

pub fn read(root: &Path) -> OldSystem {
    let release = release::parse(&text(root, "etc/os-release"));
    let hostname = Some(text(root, "etc/hostname").trim().to_owned())
        .filter(|name| !name.is_empty() && name.len() <= 63);
    OldSystem {
        hostname,
        accounts: accounts::read(
            &text(root, "etc/passwd"),
            &text(root, "etc/shadow"),
            &text(root, "etc/group"),
        ),
        fstab: fstab::parse(&text(root, "etc/fstab")),
        networks: files(&root.join(CONNECTIONS), |name| {
            name.ends_with(".nmconnection")
        }),
        host_keys: files(&root.join(SSH), |name| name.starts_with(HOST_KEY)),
        packages: packages::read(root, release.family),
        release,
    }
}

impl OldSystem {
    pub fn mount(&self, file: &str) -> Option<&Entry> {
        self.fstab.iter().find(|entry| entry.file == file)
    }

    pub fn owner(&self) -> Option<&Account> {
        self.accounts.first()
    }
}
