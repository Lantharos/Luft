use std::fs;
use std::path::PathBuf;

const MOUNTINFO_FILE: &str = "/proc/self/mountinfo";

const VIRTUAL_FILESYSTEMS: &[&str] = &[
    "proc",
    "sysfs",
    "devtmpfs",
    "devpts",
    "cgroup",
    "cgroup2",
    "securityfs",
    "selinuxfs",
    "debugfs",
    "tracefs",
    "bpf",
    "pstore",
    "efivarfs",
    "configfs",
    "fusectl",
    "mqueue",
    "hugetlbfs",
    "binfmt_misc",
    "autofs",
    "rpc_pipefs",
    "nsfs",
];

#[derive(Debug, Clone)]
pub(crate) struct MountEntry {
    pub device: (u32, u32),
    pub root: PathBuf,
    pub mount_point: PathBuf,
    pub fs_type: String,
    pub source: String,
}

impl MountEntry {
    pub fn is_virtual(&self) -> bool {
        VIRTUAL_FILESYSTEMS.contains(&self.fs_type.as_str())
    }

    pub fn is_local_storage(&self) -> bool {
        self.source.starts_with("/dev/") || self.fs_type == "fuseblk"
    }
}

pub(crate) fn mount_table() -> Vec<MountEntry> {
    fs::read_to_string(MOUNTINFO_FILE)
        .map(|mountinfo| parse_mountinfo(&mountinfo))
        .unwrap_or_default()
}

pub(crate) fn parse_mountinfo(mountinfo: &str) -> Vec<MountEntry> {
    mountinfo.lines().filter_map(parse_line).collect()
}

fn parse_line(line: &str) -> Option<MountEntry> {
    let (mount, filesystem) = line.split_once(" - ")?;
    let mut fields = mount.split(' ').skip(2);
    let (major, minor) = fields.next()?.split_once(':')?;
    let root = decode_field(fields.next()?);
    let mount_point = decode_field(fields.next()?);
    let mut filesystem = filesystem.split(' ');
    Some(MountEntry {
        device: (major.parse().ok()?, minor.parse().ok()?),
        root: root.into(),
        mount_point: mount_point.into(),
        fs_type: filesystem.next()?.to_string(),
        source: decode_field(filesystem.next()?),
    })
}

pub(super) fn decode_field(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut decoded = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'\\'
            && let Some(octal) = value.get(index + 1..index + 4)
            && let Ok(byte) = u8::from_str_radix(octal, 8)
        {
            decoded.push(byte);
            index += 4;
            continue;
        }
        decoded.push(bytes[index]);
        index += 1;
    }
    String::from_utf8_lossy(&decoded).into_owned()
}
