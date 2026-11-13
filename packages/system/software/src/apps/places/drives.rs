use std::ffi::OsString;
use std::os::unix::ffi::OsStringExt;
use std::path::{Path, PathBuf};

use luft_dbus::objects::{Object, Objects};

const UDISKS: &str = "org.freedesktop.UDisks2";
const ROOT: &str = "/org/freedesktop/UDisks2";
const BLOCK: &str = "org.freedesktop.UDisks2.Block";
const DRIVE: &str = "org.freedesktop.UDisks2.Drive";
const FILESYSTEM: &str = "org.freedesktop.UDisks2.Filesystem";
const SYSTEM_MOUNTS: [&str; 8] = [
    "/",
    "/boot",
    "/boot/efi",
    "/efi",
    "/home",
    "/usr",
    "/var",
    "/sysroot",
];
const SYSTEM_TREES: [&str; 5] = ["/boot", "/efi", "/sysroot", "/usr", "/etc"];

/// A filesystem on a drive that's mounted where you keep drives, as UDisks
/// knows it. `uuid` is the filesystem's own identifier and `drive` the
/// identifier UDisks builds from the drive's maker, model and serial number,
/// so a stick with the same label, or a copy of the filesystem on another
/// drive, is a different drive.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Drive {
    pub uuid: String,
    pub drive: String,
    pub label: String,
    pub size: u64,
    pub removable: bool,
    pub mount_points: Vec<PathBuf>,
}

fn path(bytes: Vec<u8>) -> PathBuf {
    let end = bytes
        .iter()
        .position(|byte| *byte == 0)
        .unwrap_or(bytes.len());
    PathBuf::from(OsString::from_vec(bytes[..end].to_vec()))
}

/// Whether the system itself keeps files at `point`, so no app is handed it
/// as a drive.
fn system(point: &Path) -> bool {
    SYSTEM_MOUNTS.iter().any(|mount| point == Path::new(mount))
        || SYSTEM_TREES.iter().any(|tree| point.starts_with(tree))
}

fn drive_of<'a>(objects: &'a Objects, block: Object<'a>) -> Option<Object<'a>> {
    let drive = block.link("Drive").or_else(|| {
        let backing = block.link("CryptoBackingDevice")?;
        objects.get(&backing, BLOCK)?.link("Drive")
    })?;
    objects.get(&drive, DRIVE)
}

fn read(objects: &Objects) -> Vec<Drive> {
    let mut drives: Vec<Drive> = objects
        .implementing(FILESYSTEM)
        .filter_map(|filesystem| {
            let mount_points: Vec<PathBuf> = filesystem
                .get::<Vec<Vec<u8>>>("MountPoints")?
                .into_iter()
                .map(path)
                .collect();
            if mount_points.is_empty() || mount_points.iter().any(|point| system(point)) {
                return None;
            }
            let block = objects.get(filesystem.path, BLOCK)?;
            let uuid = block
                .get::<String>("IdUUID")
                .filter(|uuid| !uuid.is_empty())?;
            if block.flag("HintIgnore") {
                return None;
            }
            let drive = drive_of(objects, block);
            Some(Drive {
                uuid,
                drive: drive
                    .and_then(|drive| drive.get::<String>("Id"))
                    .unwrap_or_default(),
                label: block.get("IdLabel").unwrap_or_default(),
                size: block.get("Size").unwrap_or(0),
                removable: drive.is_some_and(|drive| drive.flag("Removable")),
                mount_points,
            })
        })
        .collect();
    drives.sort_by(|one, other| one.mount_points.cmp(&other.mount_points));
    drives
}

/// The drives mounted now that an app could be given.
pub async fn mounted() -> Result<Vec<Drive>, String> {
    let objects = Objects::fetch(luft_dbus::system().await?, UDISKS, ROOT).await?;
    Ok(read(&objects))
}

#[cfg(test)]
mod tests {
    use super::system;
    use std::path::Path;

    #[test]
    fn the_systems_own_filesystems_are_never_drives() {
        for kept in [
            "/",
            "/var",
            "/boot/efi",
            "/sysroot",
            "/usr/local",
            "/etc/data",
        ] {
            assert!(system(Path::new(kept)), "{kept}");
        }
        for drive in [
            "/run/media/ada/Games",
            "/var/mnt/backup",
            "/mnt/data",
            "/var/home/ada/drive",
        ] {
            assert!(!system(Path::new(drive)), "{drive}");
        }
    }
}
