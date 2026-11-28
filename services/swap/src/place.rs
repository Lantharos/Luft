use std::ffi::OsStr;
use std::fs::{self, File};
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::{DirBuilderExt, FileTypeExt, MetadataExt, PermissionsExt};
use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};
use rustix::fs::{StatFs, fstatfs, major, minor};
use rustix::ioctl::{Setter, ioctl, opcode};

use crate::plan::Drive;

pub const DIRECTORY: &str = "/var/swap";
const BTRFS_MAGIC: i64 = 0x9123_683e;
const BTRFS_IOCTL: u8 = 0x94;
const BTRFS_SUBVOL_CREATE: u8 = 14;
const BTRFS_NAME_LIMIT: usize = 4088;
const SYSFS_BLOCK: &str = "/sys/dev/block";

#[repr(C)]
struct VolumeArguments {
    fd: i64,
    name: [u8; BTRFS_NAME_LIMIT],
}

pub fn is_btrfs(directory: &Path) -> io::Result<bool> {
    Ok(statfs(directory)?.f_type as i64 == BTRFS_MAGIC)
}

fn statfs(path: &Path) -> io::Result<StatFs> {
    Ok(fstatfs(File::open(path)?)?)
}

pub fn drive(directory: &Path) -> io::Result<Drive> {
    let stats = statfs(directory)?;
    let block = stats.f_frsize as u64;
    Ok(Drive {
        size: stats.f_blocks * block,
        free: stats.f_bavail * block,
    })
}

pub fn prepare(directory: &Path) -> Result<()> {
    if directory.exists() {
        return Ok(());
    }
    let parent = directory
        .parent()
        .context("the swap folder has no parent")?;
    let name = directory
        .file_name()
        .context("the swap folder has no name")?;
    if !encrypted(directory)? {
        return Ok(());
    }
    if is_btrfs(parent)? {
        create_subvolume(parent, name)
            .with_context(|| format!("couldn't make {} a subvolume", directory.display()))?;
        fs::set_permissions(directory, fs::Permissions::from_mode(0o700))?;
    } else {
        fs::DirBuilder::new().mode(0o700).create(directory)?;
    }
    Ok(())
}

fn create_subvolume(parent: &Path, name: &OsStr) -> Result<()> {
    let name = name.as_bytes();
    if name.len() >= BTRFS_NAME_LIMIT {
        bail!("the name is too long");
    }
    let mut arguments = VolumeArguments {
        fd: 0,
        name: [0; BTRFS_NAME_LIMIT],
    };
    arguments.name[..name.len()].copy_from_slice(name);
    let parent = File::open(parent)?;
    // SAFETY: BTRFS_IOC_SUBVOL_CREATE reads a btrfs_ioctl_vol_args, which VolumeArguments matches.
    unsafe {
        ioctl(
            &parent,
            Setter::<{ opcode::write::<VolumeArguments>(BTRFS_IOCTL, BTRFS_SUBVOL_CREATE) }, _>::new(arguments),
        )?;
    }
    Ok(())
}

pub fn encrypted(path: &Path) -> Result<bool> {
    let mounts = fs::read_to_string("/proc/self/mountinfo")?;
    let Some(source) = mount_source(&mounts, path) else {
        return Ok(false);
    };
    let Ok(device) = fs::metadata(source) else {
        return Ok(false);
    };
    if !device.file_type().is_block_device() {
        return Ok(false);
    }
    let block =
        Path::new(SYSFS_BLOCK).join(format!("{}:{}", major(device.rdev()), minor(device.rdev())));
    Ok(through_encryption(&fs::canonicalize(block)?))
}

fn mount_source<'a>(mounts: &'a str, path: &Path) -> Option<&'a str> {
    mounts
        .lines()
        .filter_map(|line| {
            let (mount, filesystem) = line.split_once(" - ")?;
            let point = Path::new(mount.split_whitespace().nth(4)?);
            let source = filesystem.split_whitespace().nth(1)?;
            path.starts_with(point)
                .then_some((point.as_os_str().len(), source))
        })
        .max_by_key(|(depth, _)| *depth)
        .map(|(_, source)| source)
}

fn through_encryption(device: &Path) -> bool {
    if fs::read_to_string(device.join("dm/uuid")).is_ok_and(|uuid| uuid.starts_with("CRYPT-")) {
        return true;
    }
    if device.join("partition").exists() {
        return device.parent().is_some_and(through_encryption);
    }
    let lower: Vec<PathBuf> = fs::read_dir(device.join("slaves"))
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| fs::canonicalize(entry.path()).ok())
        .collect();
    !lower.is_empty() && lower.iter().all(|device| through_encryption(device))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn device(root: &Path, name: &str, uuid: Option<&str>, below: &[&Path]) -> PathBuf {
        let path = root.join(name);
        fs::create_dir_all(path.join("slaves")).unwrap();
        if let Some(uuid) = uuid {
            fs::create_dir_all(path.join("dm")).unwrap();
            fs::write(path.join("dm/uuid"), uuid).unwrap();
        }
        for (index, lower) in below.iter().enumerate() {
            std::os::unix::fs::symlink(lower, path.join("slaves").join(index.to_string())).unwrap();
        }
        path
    }

    fn partition(disk: &Path, name: &str) -> PathBuf {
        let path = disk.join(name);
        fs::create_dir_all(&path).unwrap();
        fs::write(path.join("partition"), "3").unwrap();
        path
    }

    #[test]
    fn finds_the_mount_that_holds_a_path() {
        let mounts = "29 1 0:26 / / ro shared:1 - overlay composefs ro\n\
                      45 29 0:35 /state/os/default/var /var rw shared:5 - btrfs /dev/mapper/root rw\n\
                      50 45 0:40 / /var/tmp rw shared:6 - tmpfs tmpfs rw\n";
        assert_eq!(
            mount_source(mounts, Path::new("/var/swap")),
            Some("/dev/mapper/root")
        );
        assert_eq!(
            mount_source(mounts, Path::new("/var/tmp/swap")),
            Some("tmpfs")
        );
        assert_eq!(mount_source(mounts, Path::new("/usr")), Some("composefs"));
    }

    #[test]
    fn swaps_only_through_encryption() {
        let root = tempfile::tempdir().unwrap();
        let disk = device(root.path(), "nvme0n1", None, &[]);
        let plain = partition(&disk, "nvme0n1p3");
        let unlocked = device(
            root.path(),
            "dm-0",
            Some("CRYPT-LUKS2-1234-root"),
            &[&plain],
        );
        let volume = device(root.path(), "dm-1", Some("LVM-abcd"), &[&unlocked]);
        let bare_volume = device(root.path(), "dm-2", Some("LVM-efgh"), &[&plain]);

        assert!(through_encryption(&unlocked));
        assert!(through_encryption(&volume));
        assert!(!through_encryption(&plain));
        assert!(!through_encryption(&bare_volume));
        assert!(!through_encryption(&disk));
    }
}
