use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

const ENCRYPTED_ROOT: &str = "/dev/gpt-auto-root-luks";
const ROOT: &str = "/dev/gpt-auto-root";
const BLOCKS: &str = "/sys/class/block";
const KEYLESS: [&str; 2] = ["CRYPT-VERITY-", "CRYPT-INTEGRITY-"];

pub enum SystemDisk {
    Encrypted(Vec<PathBuf>),
    Plain,
    Unknown,
}

struct Unlocked {
    device: String,
    partitions: Vec<String>,
}

fn names_in(folder: String) -> Vec<String> {
    std::fs::read_dir(folder)
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.file_name().to_string_lossy().into_owned())
        .collect()
}

fn holds_a_key(device: &str) -> bool {
    std::fs::read_to_string(format!("{BLOCKS}/{device}/dm/uuid")).is_ok_and(|uuid| {
        uuid.starts_with("CRYPT-") && !KEYLESS.iter().any(|keyless| uuid.starts_with(keyless))
    })
}

fn partitions_under(device: &str) -> Vec<String> {
    names_in(format!("{BLOCKS}/{device}/slaves"))
        .into_iter()
        .flat_map(|below| {
            if below.starts_with("dm-") {
                partitions_under(&below)
            } else {
                vec![below]
            }
        })
        .collect()
}

fn dmsetup(arguments: &[&str]) -> bool {
    Command::new("dmsetup")
        .args(arguments)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|status| status.success())
}

impl Unlocked {
    fn all() -> Vec<Self> {
        names_in(BLOCKS.to_owned())
            .into_iter()
            .filter(|device| holds_a_key(device))
            .map(|device| Self {
                partitions: partitions_under(&device),
                device,
            })
            .collect()
    }

    fn lost_its_disk(&self) -> bool {
        self.partitions.is_empty()
            || self
                .partitions
                .iter()
                .any(|partition| !Path::new(BLOCKS).join(partition).exists())
    }

    fn forget_key(&self) -> bool {
        let Ok(name) = std::fs::read_to_string(format!("{BLOCKS}/{}/dm/name", self.device)) else {
            return false;
        };
        let name = name.trim_end();
        let forgotten = dmsetup(&["wipe_table", "--nolockfs", name]);
        dmsetup(&["remove", name]);
        forgotten
    }
}

pub fn forget_keys_of_lost_disks() -> bool {
    Unlocked::all()
        .iter()
        .filter(|unlocked| unlocked.lost_its_disk() && !unlocked.forget_key())
        .count()
        == 0
}

fn node(device: &str) -> PathBuf {
    Path::new("/dev").join(device.replace('!', "/"))
}

impl SystemDisk {
    pub fn find(in_initrd: bool) -> Self {
        let root = std::fs::canonicalize(ROOT)
            .ok()
            .and_then(|root| Some(root.file_name()?.to_string_lossy().into_owned()));
        let mut partitions: Vec<PathBuf> =
            std::fs::canonicalize(ENCRYPTED_ROOT).into_iter().collect();
        let holding_luft = Unlocked::all().into_iter().filter(|unlocked| {
            !unlocked.lost_its_disk() && (in_initrd || Some(&unlocked.device) == root.as_ref())
        });
        for partition in holding_luft.flat_map(|unlocked| unlocked.partitions) {
            let partition = node(&partition);
            if !partitions.contains(&partition) {
                partitions.push(partition);
            }
        }
        if !partitions.is_empty() {
            Self::Encrypted(partitions)
        } else if root.is_some_and(|root| !holds_a_key(&root)) {
            Self::Plain
        } else {
            Self::Unknown
        }
    }
}
