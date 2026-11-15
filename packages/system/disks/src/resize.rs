use luft_dbus::objects::Objects;
use luft_i18n::t;

use crate::udisks::{self, BLOCK, FILESYSTEM, PARTITION, no_options};
use crate::{L10N, mounting};

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

    pub async fn mode(&self, growing: bool) -> Result<Mode, String> {
        let Some(kind) = &self.filesystem else {
            return if self.usage.is_empty() {
                Ok(Mode::InPlace)
            } else {
                Err(t!(L10N, "luft-disks-resize-unknown-file-system"))
            };
        };
        let (_, flags, _) =
            udisks::manager::<(bool, u64, String)>("CanResize", &(kind.as_str(),)).await?;
        let (online, offline) = if growing {
            (ONLINE_GROW, OFFLINE_GROW)
        } else {
            (ONLINE_SHRINK, OFFLINE_SHRINK)
        };
        match (flags & online != 0, flags & offline != 0) {
            (true, _) if self.mounted => Ok(Mode::InPlace),
            (_, true) if !self.mounted => Ok(Mode::InPlace),
            (_, true) => Ok(Mode::Unmounted),
            (true, false) => Ok(Mode::Mounted),
            (false, false) if growing => Err(t!(
                L10N,
                "luft-disks-resize-cannot-grow",
                kind = kind.as_str()
            )),
            (false, false) => Err(t!(
                L10N,
                "luft-disks-resize-cannot-shrink",
                kind = kind.as_str()
            )),
        }
    }

    async fn prepare(&self, block: &str, mode: Mode) -> Result<(), String> {
        let offline = mode == Mode::Unmounted || (mode == Mode::InPlace && !self.mounted);
        match &self.filesystem {
            Some(kind) if offline && CHECKED_FIRST.contains(&kind.as_str()) => {
                let repaired: bool =
                    udisks::call(block, FILESYSTEM, "Repair", &(no_options(),)).await?;
                if repaired {
                    Ok(())
                } else {
                    Err(t!(L10N, "luft-disks-resize-unrepaired"))
                }
            }
            _ => Ok(()),
        }
    }
}

pub async fn resize(block: &str, size: u64, may_unmount: bool) -> Result<(), String> {
    let objects = udisks::objects().await?;
    let current = objects
        .get(block, PARTITION)
        .and_then(|partition| partition.get::<u64>("Size"))
        .ok_or_else(|| t!(L10N, "luft-disks-partition-gone"))?;
    if size == current {
        return Ok(());
    }
    let growing = size > current;
    let contents = Contents::read(&objects, block);
    let mode = contents.mode(growing).await?;
    if mode == Mode::Unmounted && !may_unmount {
        return Err(t!(L10N, "luft-disks-resize-in-use"));
    }
    match mode {
        Mode::Unmounted => mounting::unmount(block).await?,
        Mode::Mounted => {
            mounting::mount(block).await?;
        }
        Mode::InPlace => {}
    }
    let resized = match contents.prepare(block, mode).await {
        Ok(()) => resize_in_order(block, size, growing, contents.filesystem.is_some()).await,
        Err(error) => Err(error),
    };
    let restored = match mode {
        Mode::Unmounted => mounting::mount(block).await.map(drop),
        Mode::Mounted => mounting::unmount(block).await,
        Mode::InPlace => Ok(()),
    };
    resized.and(restored)
}

async fn resize_in_order(
    block: &str,
    size: u64,
    growing: bool,
    has_filesystem: bool,
) -> Result<(), String> {
    if growing {
        udisks::run(block, PARTITION, "Resize", &(size, no_options())).await?;
    }
    if has_filesystem {
        udisks::run(
            block,
            FILESYSTEM,
            "Resize",
            &(if growing { 0 } else { size }, no_options()),
        )
        .await?;
    }
    if !growing {
        udisks::run(block, PARTITION, "Resize", &(size, no_options())).await?;
    }
    Ok(())
}
