use std::path::Path;

use anyhow::{Context, Result};

use crate::system::command::Tool;

const MOUNTED: &str = "/var";
const ALLOCATIONS: [&str; 3] = ["data", "metadata", "system"];

pub struct Member {
    pub devid: u64,
    pub path: String,
    pub size: u64,
}

fn parse(listing: &str) -> Vec<Member> {
    listing
        .lines()
        .filter_map(|line| {
            let words: Vec<&str> = line.split_whitespace().collect();
            let value = |key: &str| {
                let at = words.iter().position(|word| *word == key)?;
                words.get(at + 1).copied()
            };
            Some(Member {
                devid: value("devid")?.parse().ok()?,
                size: value("size")?.parse().ok()?,
                path: value("path")?.to_owned(),
            })
        })
        .collect()
}

pub fn members() -> Result<Vec<Member>> {
    let listing = Tool::new("btrfs")
        .args(["filesystem", "show", "--raw", MOUNTED])
        .output()?;
    Ok(parse(&listing))
}

fn canonical(device: &str) -> String {
    std::fs::canonicalize(device)
        .map_or_else(|_| device.to_owned(), |path| path.display().to_string())
}

pub fn member(device: &str) -> Result<Option<Member>> {
    let device = canonical(device);
    Ok(members()?
        .into_iter()
        .find(|member| canonical(&member.path) == device))
}

pub fn add(device: &str) -> Result<()> {
    Tool::new("btrfs")
        .args(["device", "add", "--force", device, MOUNTED])
        .run()
        .with_context(|| format!("{device} couldn't join Luft's file system"))
}

pub fn remove(device: &str) -> Result<()> {
    Tool::new("btrfs")
        .args(["device", "remove", device, MOUNTED])
        .run()
        .with_context(|| format!("Luft's files couldn't move off {device}"))
}

pub fn resize(devid: u64, size: Option<u64>) -> Result<()> {
    let size = size.map_or_else(|| "max".to_owned(), |size| size.to_string());
    Tool::new("btrfs")
        .args(["filesystem", "resize", &format!("{devid}:{size}"), MOUNTED])
        .run()
        .context("Luft's file system couldn't change its size")
}

pub fn allocated(uuid: &str) -> Result<u64> {
    let root = Path::new("/sys/fs/btrfs").join(uuid).join("allocation");
    ALLOCATIONS.iter().try_fold(0, |total, kind| {
        let text = std::fs::read_to_string(root.join(kind).join("disk_total"))
            .context("Luft's file system didn't say how full it is")?;
        Ok(total + text.trim().parse::<u64>()?)
    })
}

pub fn devices(uuid: &str) -> usize {
    std::fs::read_dir(Path::new("/sys/fs/btrfs").join(uuid).join("devices"))
        .map(|entries| entries.count())
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_each_device_of_the_file_system() {
        let listing = "Label: 'luft'  uuid: 2d3c0b62-0a3e-4c1e-9a52-7d2f1f0e8a11\n\
                       \tTotal devices 2 FS bytes used 5368709120\n\
                       \tdevid    1 size 107374182400 used 7516192768 path /dev/nvme0n1p5\n\
                       \tdevid    2 size 42949672960 used 0 path /dev/nvme0n1p6\n";
        let members = parse(listing);
        assert_eq!(members.len(), 2);
        assert_eq!(members[1].devid, 2);
        assert_eq!(members[1].path, "/dev/nvme0n1p6");
        assert_eq!(members[0].size, 107374182400);
    }
}
