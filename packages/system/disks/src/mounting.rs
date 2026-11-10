use std::collections::HashMap;
use std::path::{Component, Path, PathBuf};

use luft_dbus::objects::Objects;
use zbus::{OwnedVariant, Variant};

use crate::udisks::system::SYSTEM_MOUNTS;
use crate::udisks::{self, BLOCK, ENCRYPTED, FILESYSTEM, SWAP, no_options, text_bytes};

const SYSTEM_TREES: &[&str] = &[
    "/usr", "/etc", "/boot", "/efi", "/sysroot", "/proc", "/sys", "/dev",
];

pub async fn mount(block: &str) -> Result<String, String> {
    udisks::call(block, FILESYSTEM, "Mount", &(no_options(),)).await
}

pub async fn unmount(block: &str) -> Result<(), String> {
    udisks::run(block, FILESYSTEM, "Unmount", &(no_options(),)).await
}

pub async fn set_label(block: &str, label: &str) -> Result<(), String> {
    udisks::run(block, FILESYSTEM, "SetLabel", &(label, no_options())).await
}

pub async fn release(block: &str) -> Result<(), String> {
    let objects = udisks::objects().await?;
    release_in(&objects, block).await
}

pub async fn release_in(objects: &Objects, block: &str) -> Result<(), String> {
    let mounted = objects
        .get(block, FILESYSTEM)
        .and_then(|filesystem| filesystem.get::<Vec<Vec<u8>>>("MountPoints"))
        .is_some_and(|points| !points.is_empty());
    if mounted {
        unmount(block).await?;
    }
    if objects
        .get(block, SWAP)
        .is_some_and(|swap| swap.flag("Active"))
    {
        udisks::run(block, SWAP, "Stop", &(no_options(),)).await?;
    }
    if objects.get(block, ENCRYPTED).is_some()
        && let Some(cleartext) = objects
            .implementing(BLOCK)
            .find(|candidate| candidate.link("CryptoBackingDevice").as_deref() == Some(block))
    {
        Box::pin(release_in(objects, cleartext.path)).await?;
        udisks::run(block, ENCRYPTED, "Lock", &(no_options(),)).await?;
    }
    Ok(())
}

fn resolved(path: &Path) -> PathBuf {
    path.ancestors()
        .find_map(|ancestor| {
            let real = ancestor.canonicalize().ok()?;
            Some(real.join(path.strip_prefix(ancestor).ok()?))
        })
        .unwrap_or_else(|| path.to_owned())
}

fn mountable(directory: &str) -> Result<(), String> {
    let typed = Path::new(directory);
    let plain = typed
        .components()
        .all(|part| matches!(part, Component::RootDir | Component::Normal(_)));
    if !typed.is_absolute() || !plain {
        return Err("Use a full folder path, such as /mnt/data".to_owned());
    }
    let real = resolved(typed);
    let covers_system = SYSTEM_MOUNTS.iter().any(|mount| {
        Path::new(mount).starts_with(typed) || resolved(Path::new(mount)).starts_with(&real)
    });
    let inside_system = SYSTEM_TREES
        .iter()
        .any(|tree| typed.starts_with(tree) || real.starts_with(tree));
    if covers_system || inside_system {
        return Err(
            "The system keeps its own files there. Choose another folder, such as /mnt/data"
                .to_owned(),
        );
    }
    Ok(())
}

pub async fn set_startup(
    block: &str,
    directory: Option<&str>,
    read_only: bool,
) -> Result<(), String> {
    if let Some(directory) = directory {
        mountable(directory)?;
    }
    let objects = udisks::objects().await?;
    let target = objects.get(block, BLOCK).ok_or("This volume is gone")?;
    let current = target
        .get::<Vec<(String, HashMap<String, OwnedVariant>)>>("Configuration")
        .unwrap_or_default()
        .into_iter()
        .find(|(kind, _)| kind == "fstab");
    if let Some(old) = &current {
        udisks::run(
            block,
            BLOCK,
            "RemoveConfigurationItem",
            &(old, no_options()),
        )
        .await?;
    }
    let Some(directory) = directory else {
        return Ok(());
    };
    let uuid = target.get::<String>("IdUUID").unwrap_or_default();
    if uuid.is_empty() {
        return Err("This volume has no identifier to mount it by".to_owned());
    }
    let options = if read_only {
        "nofail,x-gvfs-show,x-mount.mkdir,ro"
    } else {
        "nofail,x-gvfs-show,x-mount.mkdir"
    };
    let mut entry: HashMap<&str, Variant> = HashMap::new();
    entry.insert("fsname", Variant::from(text_bytes(&format!("UUID={uuid}"))));
    entry.insert("dir", Variant::from(text_bytes(directory)));
    entry.insert("type", Variant::from(text_bytes("auto")));
    entry.insert("opts", Variant::from(text_bytes(options)));
    entry.insert("freq", Variant::from(0_i32));
    entry.insert("passno", Variant::from(0_i32));
    udisks::run(
        block,
        BLOCK,
        "AddConfigurationItem",
        &(("fstab", entry), no_options()),
    )
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn startup_folders_stay_clear_of_the_system() {
        for allowed in ["/mnt/data", "/var/mnt/data", "/home/someone/drive"] {
            assert!(mountable(allowed).is_ok(), "{allowed}");
        }
        for refused in [
            "mnt/data",
            "/mnt/../etc",
            "/",
            "/home",
            "/var",
            "/boot",
            "/usr/share/data",
            "/etc/data",
            "/lib/data",
        ] {
            assert!(mountable(refused).is_err(), "{refused}");
        }
    }
}
