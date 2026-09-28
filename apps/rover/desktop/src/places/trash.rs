use std::fs;
use std::path::PathBuf;

use crate::drives;

pub fn count() -> Result<usize, String> {
    let uid = unsafe { libc::geteuid() };
    let home = dirs::data_dir()
        .map(|data| data.join("Trash"))
        .ok_or("Could not find the home trash")?;
    let drive_trashes = drives::list_drives().into_iter().flat_map(|drive| {
        let mount = PathBuf::from(drive.mount_point);
        [
            mount.join(".Trash").join(uid.to_string()),
            mount.join(format!(".Trash-{uid}")),
        ]
    });
    let mut trashes: Vec<PathBuf> = std::iter::once(home).chain(drive_trashes).collect();
    trashes.sort();
    trashes.dedup();
    Ok(trashes
        .iter()
        .filter_map(|trash| fs::read_dir(trash.join("files")).ok())
        .map(Iterator::count)
        .sum())
}
