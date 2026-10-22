use anyhow::{Context, Result, bail};

use super::top_level::TopLevel;
use crate::disk::SystemDisk;
use crate::disk::unlock::keys;
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use crate::system::secrets::secret::Secret;

const SECTOR: u64 = 512;
const ALIGNMENT: u64 = 2048;
const GPT_BACKUP: u64 = 33;
const UDISKS: &str = "org.freedesktop.UDisks2";
const UDISKS_BLOCKS: &str = "/org/freedesktop/UDisks2/block_devices";
const UDISKS_PARTITION: &str = "org.freedesktop.UDisks2.Partition";

fn sysfs_number(name: &str, file: &str) -> Option<u64> {
    std::fs::read_to_string(format!("/sys/class/block/{name}/{file}"))
        .ok()?
        .trim()
        .parse()
        .ok()
}

fn room_ends_at(partition: &str, start: u64) -> Result<u64> {
    let disk = blocks::disk_of(partition).context("The system's partition isn't on a disk.")?;
    let disk_end = sysfs_number(&disk, "size")
        .context("The system's disk has no size.")?
        .saturating_sub(GPT_BACKUP);
    let next = blocks::partitions_of(&disk)
        .iter()
        .filter_map(|name| sysfs_number(name, "start"))
        .filter(|other| *other > start)
        .min()
        .unwrap_or(disk_end);
    Ok(next.min(disk_end) / ALIGNMENT * ALIGNMENT)
}

fn grow_partition(partition: &str) -> Result<()> {
    let start = sysfs_number(partition, "start").context("The system's partition has no start.")?;
    let size = sysfs_number(partition, "size").context("The system's partition has no size.")?;
    let end = room_ends_at(partition, start)?;
    if end < start + size + ALIGNMENT {
        return Ok(());
    }
    Tool::new("busctl")
        .args(["call", UDISKS, &format!("{UDISKS_BLOCKS}/{partition}")])
        .args([UDISKS_PARTITION, "Resize", "ta{sv}"])
        .arg(((end - start) * SECTOR).to_string())
        .arg("0")
        .status()
}

fn sectors_in(status: &str, field: &str) -> Option<u64> {
    status.lines().find_map(|line| {
        line.trim()
            .strip_prefix(field)?
            .strip_prefix(':')?
            .split_whitespace()
            .next()?
            .parse()
            .ok()
    })
}

fn grow_encryption(disk: &SystemDisk, mapping: &str, typed: &Secret) -> Result<()> {
    let status = Tool::new("cryptsetup")
        .arg("status")
        .arg(mapping)
        .output()?;
    let (Some(offset), Some(size)) = (sectors_in(&status, "offset"), sectors_in(&status, "size"))
    else {
        bail!("The disk's encryption didn't say how big it is.");
    };
    if offset + size + ALIGNMENT > disk.size() / SECTOR {
        return Ok(());
    }
    match keys::unlock_key(&disk.device(), None, typed) {
        Ok(key) => Tool::new("cryptsetup")
            .args(["resize", "--key-file", "-"])
            .arg(mapping)
            .input(&key)
            .status(),
        Err(_)
            if typed.is_empty()
                && Tool::new("cryptsetup")
                    .args(["resize", "--token-only"])
                    .arg(mapping)
                    .succeeds() =>
        {
            Ok(())
        }
        Err(error) => Err(error),
    }
}

fn usable(disk: &SystemDisk) -> u64 {
    blocks::kernel_name(&disk.root.source).map_or(0, |name| blocks::size_bytes(&name))
}

pub fn grow(typed: &Secret) -> Result<u64> {
    let disk = SystemDisk::find()?;
    let before = usable(&disk);
    grow_partition(&disk.partition)?;
    if let Some(mapping) = &disk.mapping {
        grow_encryption(&disk, mapping, typed)?;
    }
    let top = TopLevel::mount(&disk)?;
    Tool::new("btrfs")
        .args(["filesystem", "resize", "max"])
        .arg(top.path())
        .status()?;
    Ok(usable(&disk).saturating_sub(before))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_size_of_an_encrypted_mapping() {
        let status = "/dev/mapper/root is active and is in use.\n  type:    LUKS2\n  cipher:  aes-xts-plain64\n  \
                      offset:  32768 sectors\n  size:    209678336 sectors\n  mode:    read/write\n";
        assert_eq!(sectors_in(status, "offset"), Some(32_768));
        assert_eq!(sectors_in(status, "size"), Some(209_678_336));
    }
}
