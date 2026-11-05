use std::fs;
use std::path::PathBuf;

use super::mount_table::decode_field;

const INCLUDED_FILESYSTEMS: &[&str] = &[
    "ext4",
    "ext3",
    "ext2",
    "btrfs",
    "xfs",
    "ntfs",
    "ntfs3",
    "vfat",
    "exfat",
    "f2fs",
    "zfs",
    "fuseblk",
    "fuse.ntfs-3g",
    "apfs",
];

const SYSTEM_MOUNTS: &[&str] = &[
    "/boot",
    "/efi",
    "/snap",
    "/var/snap",
    "/run",
    "/dev",
    "/proc",
    "/sys",
];

const MOUNTS_FILE: &str = "/proc/self/mounts";
const MOUNTS_OVERRIDE: &str = "LUFT_MOUNTS";

pub(super) struct Mount {
    pub device: String,
    pub mount_point: String,
}

pub(super) fn mounts_file() -> PathBuf {
    std::env::var_os(MOUNTS_OVERRIDE)
        .map(PathBuf::from)
        .unwrap_or_else(|| MOUNTS_FILE.into())
}

pub(super) fn visible_mounts() -> Vec<Mount> {
    let Ok(mounts) = fs::read_to_string(mounts_file()) else {
        return Vec::new();
    };
    mounts
        .lines()
        .filter_map(|line| {
            let mut fields = line.split_whitespace();
            let device = fields.next()?;
            let mount_point = decode_field(fields.next()?);
            let fs_type = fields.next()?;
            is_visible(device, &mount_point, fs_type).then(|| Mount {
                device: device.to_string(),
                mount_point,
            })
        })
        .collect()
}

pub(super) fn is_user_media(mount_point: &str) -> bool {
    mount_point.starts_with("/run/media/") || mount_point.starts_with("/media/")
}

fn is_visible(device: &str, mount_point: &str, fs_type: &str) -> bool {
    device.starts_with("/dev/")
        && INCLUDED_FILESYSTEMS
            .iter()
            .any(|included| fs_type.starts_with(included))
        && (is_user_media(mount_point)
            || !SYSTEM_MOUNTS.iter().any(|system| {
                mount_point == *system
                    || mount_point
                        .strip_prefix(system)
                        .is_some_and(|rest| rest.starts_with('/'))
            }))
}
