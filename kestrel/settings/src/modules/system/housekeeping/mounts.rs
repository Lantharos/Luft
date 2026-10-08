use std::path::PathBuf;

const SYSTEM_TYPES: [&str; 30] = [
    "autofs",
    "binfmt_misc",
    "bpf",
    "cgroup",
    "cgroup2",
    "configfs",
    "debugfs",
    "devpts",
    "devtmpfs",
    "ecryptfs",
    "efivarfs",
    "fusectl",
    "fuse.gvfsd-fuse",
    "fuse.portal",
    "hugetlbfs",
    "mqueue",
    "nsfs",
    "overlay",
    "proc",
    "pstore",
    "ramfs",
    "rootfs",
    "rpc_pipefs",
    "securityfs",
    "selinuxfs",
    "squashfs",
    "sysfs",
    "tmpfs",
    "tracefs",
    "zfs",
];
const NETWORK_TYPES: [&str; 6] = ["cifs", "nfs", "nfs4", "smbfs", "smb3", "sshfs"];

pub struct Mount {
    pub path: PathBuf,
    pub read_only: bool,
}

pub fn mounted() -> Vec<Mount> {
    let Ok(text) = std::fs::read_to_string("/proc/self/mountinfo") else {
        return Vec::new();
    };
    text.lines().filter_map(parse).collect()
}

fn parse(line: &str) -> Option<Mount> {
    let fields: Vec<&str> = line.split(' ').collect();
    let separator = fields.iter().position(|field| *field == "-")?;
    let kind = *fields.get(separator + 1)?;
    let source = *fields.get(separator + 2)?;
    if SYSTEM_TYPES.contains(&kind)
        || NETWORK_TYPES.contains(&kind)
        || source.starts_with("/dev/loop")
    {
        return None;
    }
    Some(Mount {
        path: PathBuf::from(unescape(fields.get(4)?)),
        read_only: fields.get(5)?.split(',').any(|option| option == "ro"),
    })
}

pub fn configured() -> Vec<PathBuf> {
    let Ok(text) = std::fs::read_to_string("/etc/fstab") else {
        return Vec::new();
    };
    text.lines()
        .map(str::trim)
        .filter(|line| !line.starts_with('#'))
        .filter_map(|line| line.split_whitespace().nth(1))
        .filter(|path| path.starts_with('/'))
        .map(|path| PathBuf::from(unescape(path)))
        .collect()
}

fn unescape(text: &str) -> String {
    let mut bytes = Vec::with_capacity(text.len());
    let mut rest = text.as_bytes();
    while let Some((&byte, tail)) = rest.split_first() {
        let octal = tail
            .get(..3)
            .and_then(|digits| std::str::from_utf8(digits).ok());
        match octal.and_then(|digits| u8::from_str_radix(digits, 8).ok()) {
            Some(value) if byte == b'\\' => {
                bytes.push(value);
                rest = &tail[3..];
            }
            _ => {
                bytes.push(byte);
                rest = tail;
            }
        }
    }
    String::from_utf8_lossy(&bytes).into_owned()
}
