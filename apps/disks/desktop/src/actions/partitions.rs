use zbus::zvariant::Value;

use super::mounting;
use crate::udisks::{self, BLOCK, FILESYSTEM, PARTITION, no_options};

const ONLINE_SHRINK: u64 = 8;
const ONLINE_GROW: u64 = 16;

pub fn delete(block: &str) -> Result<(), String> {
    mounting::release(block)?;
    let mut options = no_options();
    options.insert("tear-down", Value::from(true));
    udisks::run(block, PARTITION, "Delete", &(options,))
}

pub fn resize(block: &str, size: u64) -> Result<(), String> {
    let objects = udisks::objects()?;
    let current = objects
        .get(block, PARTITION)
        .and_then(|partition| partition.get::<u64>("Size"))
        .ok_or("This partition is gone")?;
    if size == current {
        return Ok(());
    }
    let filesystem = objects.get(block, FILESYSTEM);
    let mounted = filesystem
        .and_then(|filesystem| filesystem.get::<Vec<Vec<u8>>>("MountPoints"))
        .is_some_and(|points| !points.is_empty());
    let growing = size > current;
    let remount = match (filesystem, mounted) {
        (Some(_), true) => {
            let kind = objects
                .get(block, BLOCK)
                .and_then(|target| target.get::<String>("IdType"))
                .unwrap_or_default();
            let (_, flags, _) =
                udisks::manager::<(bool, u64, String)>("CanResize", &(kind.as_str(),))?;
            let online = if growing { ONLINE_GROW } else { ONLINE_SHRINK };
            flags & online == 0
        }
        _ => false,
    };
    if remount {
        mounting::unmount(block)?;
    }
    let resized = resize_in_order(block, size, growing, filesystem.is_some());
    if remount {
        mounting::mount(block)?;
    }
    resized
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
