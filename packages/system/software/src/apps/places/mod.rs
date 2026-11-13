//! The drives and folders a sandboxed app was given beyond its sandbox.
//!
//! A drive is given by its filesystem and the drive it's on, never by where
//! it's mounted, so it reaches the app wherever it's mounted next and a
//! different stick with the same name doesn't. Both reach the app as the
//! real mount, at the same path as outside: Flatpak apps through their
//! overrides, which Luft keeps in step as drives come and go, and AppImages
//! through their sandbox, which reads them at every start.

mod drives;
mod flatpak;
mod overrides;
mod shown;
mod store;

use std::path::PathBuf;

use luft_identity::permissions::{self, FOLDERS, READ_ONLY_FOLDERS};
use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::Connection;

pub use drives::{Drive, mounted};
pub use shown::{DriveTarget, GivenDrive, PluggedDrive, give_chosen, given, plugged, take_chosen};
pub use store::{Answer, Known};

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub enum Access {
    ReadWrite,
    ReadOnly,
}

/// Where `held`'s drives are mounted among `mounted`, with what each may do.
pub fn reachable(held: &[(Known, Answer)], mounted: &[Drive]) -> Vec<(PathBuf, Access)> {
    held.iter()
        .filter_map(|(known, answer)| match answer {
            Answer::Given(access) => Some((known, *access)),
            Answer::Refused => None,
        })
        .flat_map(|(known, access)| {
            mounted
                .iter()
                .filter(move |drive| known.is(drive))
                .flat_map(move |drive| {
                    drive
                        .mount_points
                        .iter()
                        .map(move |point| (point.clone(), access))
                })
        })
        .collect()
}

/// The drives among `mounted` the app was never told about.
pub fn unasked<'a>(held: &[(Known, Answer)], mounted: &'a [Drive]) -> Vec<&'a Drive> {
    mounted
        .iter()
        .filter(|drive| !held.iter().any(|(known, _)| known.is(drive)))
        .collect()
}

fn explain(error: zbus::Error) -> String {
    luft_dbus::explain(&error)
}

async fn applied(connection: &Connection, id: &str) -> Result<(), String> {
    if super::flatpak::is_installed(id) {
        flatpak::apply(connection, id).await
    } else {
        Ok(())
    }
}

/// What the app was told about each drive.
pub async fn held(connection: &Connection, id: &str) -> Result<Vec<(Known, Answer)>, String> {
    store::of(connection, id).await.map_err(explain)
}

/// Every drive any app was told about, with what each app was told.
pub async fn everything(
    connection: &Connection,
) -> Result<Vec<(Known, std::collections::HashMap<String, Answer>)>, String> {
    store::everything(connection).await.map_err(explain)
}

/// Gives the app the drive, from the next time it opens.
pub async fn give(
    connection: &Connection,
    id: &str,
    drive: &Drive,
    access: Access,
) -> Result<(), String> {
    store::answer(connection, id, drive, Answer::Given(access))
        .await
        .map_err(explain)?;
    applied(connection, id).await
}

/// Remembers that you didn't let the app use the drive, so it isn't asked again.
pub async fn refuse(connection: &Connection, id: &str, drive: &Drive) -> Result<(), String> {
    store::answer(connection, id, drive, Answer::Refused)
        .await
        .map_err(explain)?;
    applied(connection, id).await
}

/// Takes the drive away from the app, from the next time it opens.
pub async fn take(connection: &Connection, id: &str, known: &Known) -> Result<(), String> {
    store::forget(connection, id, known)
        .await
        .map_err(explain)?;
    applied(connection, id).await
}

/// The folders the app was given, with what it may do in each.
pub async fn folders(connection: &Connection, id: &str) -> Result<Vec<(String, Access)>, String> {
    let (changed, read) = futures_util::try_join!(
        permissions::values(connection, &FOLDERS, id),
        permissions::values(connection, &READ_ONLY_FOLDERS, id),
    )
    .map_err(explain)?;
    Ok(changed
        .into_iter()
        .map(|folder| (folder, Access::ReadWrite))
        .chain(read.into_iter().map(|folder| (folder, Access::ReadOnly)))
        .collect())
}

async fn change_folders(
    connection: &Connection,
    id: &str,
    edit: impl Fn(&permissions::Permission, &mut Vec<String>),
) -> Result<(), String> {
    for permission in [&FOLDERS, &READ_ONLY_FOLDERS] {
        let mut folders = permissions::values(connection, permission, id)
            .await
            .map_err(explain)?;
        edit(permission, &mut folders);
        let folders: Vec<&str> = folders.iter().map(String::as_str).collect();
        permissions::set_values(connection, permission, id, &folders)
            .await
            .map_err(explain)?;
    }
    applied(connection, id).await
}

/// Gives the app a folder, from the next time it opens.
pub async fn give_folder(
    connection: &Connection,
    id: &str,
    folder: &str,
    access: Access,
) -> Result<(), String> {
    let kept = match access {
        Access::ReadWrite => &FOLDERS,
        Access::ReadOnly => &READ_ONLY_FOLDERS,
    };
    change_folders(connection, id, |permission, folders| {
        folders.retain(|held| held != folder);
        if permission.id == kept.id {
            folders.push(folder.to_owned());
        }
    })
    .await
}

/// Takes a folder away from the app, from the next time it opens.
pub async fn take_folder(connection: &Connection, id: &str, folder: &str) -> Result<(), String> {
    change_folders(connection, id, |_, folders| {
        folders.retain(|held| held != folder)
    })
    .await
}

/// Opens again what a Flatpak app was given after something else rewrote its
/// overrides, such as full access being turned off.
pub async fn reapply(connection: &Connection, id: &str) -> Result<(), String> {
    flatpak::forget(connection, id).await.map_err(explain)?;
    flatpak::apply(connection, id).await
}

/// Keeps every Flatpak app that was given a drive in step with where drives
/// are mounted now.
pub async fn follow_mounts(connection: &Connection) -> Result<(), String> {
    let mut apps: Vec<String> = everything(connection)
        .await?
        .into_iter()
        .flat_map(|(_, answers)| answers.into_keys())
        .filter(|id| super::flatpak::is_installed(id))
        .collect();
    apps.sort();
    apps.dedup();
    for id in apps {
        flatpak::apply(connection, &id).await?;
    }
    Ok(())
}

/// Forgets every drive and folder the app was given, and takes them out of
/// its overrides, so an app installed later under its ID starts without them.
pub async fn forget(connection: &Connection, id: &str) -> Result<(), String> {
    for (known, _) in held(connection, id).await? {
        store::forget(connection, id, &known)
            .await
            .map_err(explain)?;
    }
    for permission in [&FOLDERS, &READ_ONLY_FOLDERS] {
        permissions::forget(connection, permission.table, permission.id, id)
            .await
            .map_err(explain)?;
    }
    flatpak::apply(connection, id).await?;
    flatpak::forget(connection, id).await.map_err(explain)
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use super::*;

    fn drive(uuid: &str, drive: &str, label: &str, point: &str) -> Drive {
        Drive {
            uuid: uuid.to_owned(),
            drive: drive.to_owned(),
            label: label.to_owned(),
            size: 500_000_000_000,
            removable: false,
            mount_points: vec![PathBuf::from(point)],
        }
    }

    fn known(uuid: &str, drive: &str) -> Known {
        Known {
            uuid: uuid.to_owned(),
            drive: drive.to_owned(),
            label: "Games".to_owned(),
            size: 500_000_000_000,
        }
    }

    #[test]
    fn a_drive_reaches_the_app_wherever_it_is_mounted() {
        let held = [(
            known("4f1c", "Samsung-870-S6PX"),
            Answer::Given(Access::ReadWrite),
        )];
        let mounted = [drive("4f1c", "Samsung-870-S6PX", "Games", "/var/mnt/games")];
        assert_eq!(
            reachable(&held, &mounted),
            [(PathBuf::from("/var/mnt/games"), Access::ReadWrite)]
        );
    }

    #[test]
    fn another_stick_with_the_same_name_or_a_copy_on_another_drive_gets_nothing() {
        let held = [(
            known("4f1c", "SanDisk-Ultra-0401"),
            Answer::Given(Access::ReadOnly),
        )];
        let mounted = [
            drive(
                "77aa",
                "SanDisk-Ultra-0401",
                "TRAVEL",
                "/run/media/ada/TRAVEL",
            ),
            drive("9b02", "Kingston-DT-11", "Games", "/run/media/ada/Games"),
            drive("4f1c", "Kingston-DT-11", "Games", "/run/media/ada/Games1"),
        ];
        assert!(reachable(&held, &mounted).is_empty());
    }

    #[test]
    fn nothing_reaches_the_app_before_it_was_given_or_after_it_said_no() {
        let mounted = [drive(
            "4f1c",
            "Samsung-870-S6PX",
            "Games",
            "/run/media/ada/Games",
        )];
        assert!(reachable(&[], &mounted).is_empty());
        let refused = [(known("4f1c", "Samsung-870-S6PX"), Answer::Refused)];
        assert!(reachable(&refused, &mounted).is_empty());
        assert!(unasked(&refused, &mounted).is_empty());
        assert_eq!(unasked(&[], &mounted).len(), 1);
    }
}
