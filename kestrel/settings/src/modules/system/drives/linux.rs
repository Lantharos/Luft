use std::collections::HashMap;
use std::io::Write;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

const VERDICTS: &str = "luft/internal-drives";
const DATA: &str = "data";
const SYSTEM: &str = "system";
const SUBVOLUME_INODE: u64 = 256;
const SYSTEM_MARKERS: [&str; 8] = [
    "etc/os-release",
    "usr/lib/os-release",
    "lib/os-release",
    "etc/fstab",
    "ostree/deploy",
    "loader/entries",
    "grub2",
    "grub",
];

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Verdict {
    Data,
    System,
}

pub struct Verdicts {
    path: PathBuf,
    known: HashMap<String, Verdict>,
}

impl Verdicts {
    pub fn load() -> Self {
        let path = glib::user_state_dir().join(VERDICTS);
        let known = std::fs::read_to_string(&path)
            .unwrap_or_default()
            .lines()
            .filter_map(|line| {
                let (uuid, verdict) = line.split_once(' ')?;
                let verdict = match verdict {
                    DATA => Verdict::Data,
                    SYSTEM => Verdict::System,
                    _ => return None,
                };
                Some((uuid.to_owned(), verdict))
            })
            .collect();
        Self { path, known }
    }

    pub fn get(&self, uuid: &str) -> Option<Verdict> {
        self.known.get(uuid).copied()
    }

    pub fn remember(&mut self, uuid: &str, verdict: Verdict) {
        self.known.insert(uuid.to_owned(), verdict);
        let word = match verdict {
            Verdict::Data => DATA,
            Verdict::System => SYSTEM,
        };
        let written = std::fs::create_dir_all(self.path.parent().expect("state lives in a folder"))
            .and_then(|()| {
                std::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(&self.path)
            })
            .and_then(|mut file| writeln!(file, "{uuid} {word}"));
        if let Err(error) = written {
            eprintln!("Couldn't remember what {uuid} holds: {error}");
        }
    }
}

pub fn looking_options(filesystem: &str) -> &'static str {
    match filesystem {
        "ext4" => "ro,noload",
        _ => "ro",
    }
}

pub fn holds_system(top: &Path, filesystem: &str) -> bool {
    let subvolumes = match filesystem {
        "btrfs" => subvolumes(top),
        _ => Vec::new(),
    };
    std::iter::once(top.to_owned())
        .chain(subvolumes)
        .any(|root| {
            SYSTEM_MARKERS
                .iter()
                .any(|marker| root.join(marker).symlink_metadata().is_ok())
        })
}

fn subvolumes(top: &Path) -> Vec<PathBuf> {
    let Ok(entries) = std::fs::read_dir(top) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter(|entry| {
            entry
                .metadata()
                .is_ok_and(|metadata| metadata.is_dir() && metadata.ino() == SUBVOLUME_INODE)
        })
        .map(|entry| entry.path())
        .collect()
}
