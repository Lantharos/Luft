use luft_app::dbus::objects::Objects;

use crate::actions::mounting;
use crate::udisks::{self, BLOCK, FILESYSTEM, PARTITION, no_options};

const OFFLINE_SHRINK: u64 = 2;
const OFFLINE_GROW: u64 = 4;
const ONLINE_SHRINK: u64 = 8;
const ONLINE_GROW: u64 = 16;
const CHECKED_FIRST: &[&str] = &["ext2", "ext3", "ext4"];

#[derive(Clone, Copy, PartialEq)]
pub enum Mode {
    InPlace,
    Unmounted,
    Mounted,
}

pub struct Contents {
    pub filesystem: Option<String>,
    pub usage: String,
    pub mounted: bool,
}

impl Contents {
    pub fn read(objects: &Objects, block: &str) -> Self {
        let target = objects.get(block, BLOCK);
        let text = |name: &str| {
            target
                .and_then(|target| target.get::<String>(name))
                .unwrap_or_default()
        };
        let filesystem = objects.get(block, FILESYSTEM);
        Self {
            mounted: filesystem
                .and_then(|filesystem| filesystem.get::<Vec<Vec<u8>>>("MountPoints"))
                .is_some_and(|points| !points.is_empty()),
            filesystem: filesystem.map(|_| text("IdType")),
            usage: text("IdUsage"),
        }
    }

    pub fn mode(&self, growing: bool) -> Result<Mode, String> {
        let Some(kind) = &self.filesystem else {
            return if self.usage.is_empty() {
                Ok(Mode::InPlace)
            } else {
                Err("Disks can only resize partitions that hold a file system it knows".to_owned())
            };
        };
        let (_, flags, _) = udisks::manager::<(bool, u64, String)>("CanResize", &(kind.as_str(),))?;
        let (online, offline) = if growing {
            (ONLINE_GROW, OFFLINE_GROW)
        } else {
            (ONLINE_SHRINK, OFFLINE_SHRINK)
        };
        let direction = if growing { "grow" } else { "shrink" };
        match (flags & online != 0, flags & offline != 0) {
            (true, _) if self.mounted => Ok(Mode::InPlace),
            (_, true) if !self.mounted => Ok(Mode::InPlace),
            (_, true) => Ok(Mode::Unmounted),
            (true, false) => Ok(Mode::Mounted),
            (false, false) => Err(format!("{kind} file systems can't {direction} here")),
        }
    }

    fn prepare(&self, block: &str, mode: Mode) -> Result<(), String> {
        let offline = mode == Mode::Unmounted || (mode == Mode::InPlace && !self.mounted);
        match &self.filesystem {
            Some(kind) if offline && CHECKED_FIRST.contains(&kind.as_str()) => {
                let repaired: bool = udisks::call(block, FILESYSTEM, "Repair", &(no_options(),))?;
                if repaired {
                    Ok(())
                } else {
                    Err("Its file system has problems that couldn't be repaired".to_owned())
                }
            }
            _ => Ok(()),
        }
    }
}

pub fn resize(block: &str, size: u64, may_unmount: bool) -> Result<(), String> {
    let objects = udisks::objects()?;
    let current = objects
        .get(block, PARTITION)
        .and_then(|partition| partition.get::<u64>("Size"))
        .ok_or("This partition is gone")?;
    if size == current {
        return Ok(());
    }
    let growing = size > current;
    let contents = Contents::read(&objects, block);
    let mode = contents.mode(growing)?;
    if mode == Mode::Unmounted && !may_unmount {
        return Err("It has to be unmounted to resize, and the system is using it".to_owned());
    }
    match mode {
        Mode::Unmounted => mounting::unmount(block)?,
        Mode::Mounted => {
            mounting::mount(block)?;
        }
        Mode::InPlace => {}
    }
    let resized = contents
        .prepare(block, mode)
        .and_then(|()| resize_in_order(block, size, growing, contents.filesystem.is_some()));
    let restored = match mode {
        Mode::Unmounted => mounting::mount(block).map(drop),
        Mode::Mounted => mounting::unmount(block),
        Mode::InPlace => Ok(()),
    };
    resized.and(restored)
}

fn resize_in_order(
    block: &str,
    size: u64,
    growing: bool,
    has_filesystem: bool,
) -> Result<(), String> {
    if growing {
        udisks::run(block, PARTITION, "Resize", &(size, no_options()))?;
    }
    if has_filesystem {
        udisks::run(
            block,
            FILESYSTEM,
            "Resize",
            &(if growing { 0 } else { size }, no_options()),
        )?;
    }
    if !growing {
        udisks::run(block, PARTITION, "Resize", &(size, no_options()))?;
    }
    Ok(())
}
