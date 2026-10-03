use std::collections::HashMap;

use luft_app::dbus::objects::Objects;
use zbus::zvariant::Value;

use crate::udisks::{self, BLOCK, ENCRYPTED, FILESYSTEM, SWAP, no_options, text_bytes};

pub fn mount(block: &str) -> Result<String, String> {
    udisks::call(block, FILESYSTEM, "Mount", &(no_options(),))
}

pub fn unmount(block: &str) -> Result<(), String> {
    udisks::run(block, FILESYSTEM, "Unmount", &(no_options(),))
}

pub fn set_label(block: &str, label: &str) -> Result<(), String> {
    udisks::run(block, FILESYSTEM, "SetLabel", &(label, no_options()))
}

pub fn release(block: &str) -> Result<(), String> {
    let objects = udisks::objects()?;
    release_in(&objects, block)
}

pub fn release_in(objects: &Objects, block: &str) -> Result<(), String> {
    let mounted = objects
        .get(block, FILESYSTEM)
        .and_then(|filesystem| filesystem.get::<Vec<Vec<u8>>>("MountPoints"))
        .is_some_and(|points| !points.is_empty());
    if mounted {
        unmount(block)?;
    }
    if objects
        .get(block, SWAP)
        .is_some_and(|swap| swap.flag("Active"))
    {
        udisks::run(block, SWAP, "Stop", &(no_options(),))?;
    }
    if objects.get(block, ENCRYPTED).is_some()
        && let Some(cleartext) = objects
            .implementing(BLOCK)
            .find(|candidate| candidate.link("CryptoBackingDevice").as_deref() == Some(block))
    {
        release_in(objects, cleartext.path)?;
        udisks::run(block, ENCRYPTED, "Lock", &(no_options(),))?;
    }
    Ok(())
}

pub fn set_startup(block: &str, directory: Option<&str>, read_only: bool) -> Result<(), String> {
    let objects = udisks::objects()?;
    let target = objects.get(block, BLOCK).ok_or("This volume is gone")?;
    let current = target
        .get::<Vec<(String, HashMap<String, zbus::zvariant::OwnedValue>)>>("Configuration")
        .unwrap_or_default()
        .into_iter()
        .find(|(kind, _)| kind == "fstab");
    if let Some(old) = &current {
        udisks::run(
            block,
            BLOCK,
            "RemoveConfigurationItem",
            &(old, no_options()),
        )?;
    }
    let Some(directory) = directory else {
        return Ok(());
    };
    let uuid = target.get::<String>("IdUUID").unwrap_or_default();
    if uuid.is_empty() {
        return Err("This volume has no identifier to mount it by".to_owned());
    }
    let options = if read_only {
        "nofail,x-gvfs-show,ro"
    } else {
        "nofail,x-gvfs-show"
    };
    let mut entry: HashMap<&str, Value> = HashMap::new();
    entry.insert("fsname", Value::from(text_bytes(&format!("UUID={uuid}"))));
    entry.insert("dir", Value::from(text_bytes(directory)));
    entry.insert("type", Value::from(text_bytes("auto")));
    entry.insert("opts", Value::from(text_bytes(options)));
    entry.insert("freq", Value::from(0_i32));
    entry.insert("passno", Value::from(0_i32));
    udisks::run(
        block,
        BLOCK,
        "AddConfigurationItem",
        &(("fstab", entry), no_options()),
    )
}
