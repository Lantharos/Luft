use std::collections::BTreeSet;
use std::path::Path;

use luft_dbus as dbus;
use luft_identity::permissions::{
    self, BUS, CAMERA, DEVICES, DOWNLOADS, FOLDERS, FULL_ACCESS, MICROPHONE, NETWORK, NO,
    Permission, READ_ONLY_FOLDERS, X11, YES,
};
use zbus::Connection;

use super::Declaration;
use crate::apps::flatpak::Permissions;

async fn store(
    connection: &Connection,
    permission: &Permission,
    id: &str,
    values: &[String],
) -> Result<(), String> {
    let values: Vec<&str> = values.iter().map(String::as_str).collect();
    permissions::set_values(connection, permission, id, &values)
        .await
        .map_err(|error| dbus::explain(&error))
}

async fn held(
    connection: &Connection,
    permission: &Permission,
    id: &str,
) -> Result<Vec<String>, String> {
    permissions::values(connection, permission, id)
        .await
        .map_err(|error| dbus::explain(&error))
}

async fn given(connection: &Connection, permission: &Permission, id: &str) -> Result<bool, String> {
    Ok(held(connection, permission, id)
        .await?
        .first()
        .map(String::as_str)
        == Some(YES))
}

const EVERYTHING: [&Permission; 10] = [
    &FULL_ACCESS,
    &FOLDERS,
    &READ_ONLY_FOLDERS,
    &DEVICES,
    &BUS,
    &NETWORK,
    &DOWNLOADS,
    &X11,
    &MICROPHONE,
    &CAMERA,
];
const ALL_DEVICES: &str = "all";

/// Forgets everything the app was given, drives included, so another app
/// that later takes its id starts with nothing.
pub async fn forget(id: &str) -> Result<(), String> {
    let connection = dbus::session().await?;
    for permission in EVERYTHING {
        permissions::forget(connection, permission.table, permission.id, id)
            .await
            .map_err(|error| dbus::explain(&error))?;
    }
    crate::apps::places::forget(connection, id).await
}

/// Gives a newly installed app what it declared and nothing an earlier app
/// with its id was given.
pub async fn reset(
    id: &str,
    declaration: Option<&Declaration>,
    full_access: bool,
) -> Result<(), String> {
    forget(id).await?;
    match declaration {
        Some(declaration) => grant(id, declaration, full_access).await,
        None => Ok(()),
    }
}

/// Writes what the app may use to the permission store, where its sandbox
/// reads it at every start: what it declared, and full access when it asked
/// to run unsandboxed and you allowed it.
pub async fn grant(id: &str, declaration: &Declaration, full_access: bool) -> Result<(), String> {
    let connection = dbus::session().await?;
    if declaration.unsandboxed.is_some() {
        return permissions::set(
            connection,
            FULL_ACCESS.table,
            FULL_ACCESS.id,
            id,
            full_access,
        )
        .await
        .map_err(|error| dbus::explain(&error));
    }
    let (changed, read_only) = folder_names(declaration);
    store(connection, &FOLDERS, id, &changed).await?;
    store(connection, &READ_ONLY_FOLDERS, id, &read_only).await?;
    store(connection, &DEVICES, id, &declaration.devices).await?;
    store(connection, &BUS, id, &declaration.talk).await?;
    let offline = if declaration.network {
        Vec::new()
    } else {
        vec![NO.to_owned()]
    };
    store(connection, &NETWORK, id, &offline).await?;
    store(connection, &X11, id, &answer(declaration.x11)).await?;
    for (asked, permission) in [
        (declaration.microphone, &MICROPHONE),
        (declaration.camera, &CAMERA),
    ] {
        if asked {
            store(connection, permission, id, &answer(true)).await?;
        }
    }
    Ok(())
}

fn answer(given: bool) -> Vec<String> {
    if given {
        vec![YES.to_owned()]
    } else {
        Vec::new()
    }
}

/// One of the switches on an installed AppImage's sandbox.
#[derive(Clone, Copy)]
pub enum Switch {
    Downloads,
    X11,
    Microphone,
    Camera,
}

/// Turns one switch of the app's sandbox on or off: recording sound and
/// cameras at once, the rest from its next start.
pub async fn set_switch(id: &str, switch: Switch, on: bool) -> Result<(), String> {
    let connection = dbus::session().await?;
    match switch {
        Switch::Downloads => {
            let closed = if on { Vec::new() } else { vec![NO.to_owned()] };
            store(connection, &DOWNLOADS, id, &closed).await
        }
        Switch::X11 => store(connection, &X11, id, &answer(on)).await,
        Switch::Microphone => store(connection, &MICROPHONE, id, &answer(on)).await,
        Switch::Camera => store(connection, &CAMERA, id, &answer(on)).await,
    }
}

fn names(values: &[String]) -> BTreeSet<&str> {
    values.iter().map(String::as_str).collect()
}

fn within(folder: &str, held: &[String]) -> bool {
    held.iter().any(|held| Path::new(folder).starts_with(held))
}

fn reaches(held: &[String], name: &str) -> bool {
    held.iter().any(|held| {
        held == name
            || held
                .strip_suffix('*')
                .is_some_and(|prefix| name.starts_with(prefix))
    })
}

/// What stays of `held` when an app that declared `before` now declares
/// `after`: what you added yourself, and what it still asks for and
/// `still_given` finds among what is held.
fn narrowed(
    held: &[String],
    before: &[String],
    after: &[String],
    still_given: impl Fn(&str) -> bool,
) -> Vec<String> {
    let before = names(before);
    let kept: BTreeSet<&str> = held
        .iter()
        .map(String::as_str)
        .filter(|value| !before.contains(value))
        .chain(
            after
                .iter()
                .map(String::as_str)
                .filter(|value| still_given(value)),
        )
        .collect();
    kept.into_iter().map(str::to_owned).collect()
}

fn folder_names(declaration: &Declaration) -> (Vec<String>, Vec<String>) {
    let folders = declaration.folders();
    let paths = |writable: bool| {
        folders
            .iter()
            .filter(|(_, can_write)| *can_write == writable)
            .map(|(folder, _)| folder.display().to_string())
            .collect()
    };
    (paths(true), paths(false))
}

/// Moves an updated app from what it declared `before` to what it declares
/// now without opening anything to it: it keeps what it still asks for among
/// what it holds and what you added yourself, and loses the rest. What you
/// took away from it stays away.
pub async fn narrow(id: &str, before: &Declaration, after: &Declaration) -> Result<(), String> {
    if after.unsandboxed.is_some() {
        return Ok(());
    }
    let connection = dbus::session().await?;
    let (changed, read_only, devices, talk) = futures_util::try_join!(
        held(connection, &FOLDERS, id),
        held(connection, &READ_ONLY_FOLDERS, id),
        held(connection, &DEVICES, id),
        held(connection, &BUS, id),
    )?;
    let (changed_before, read_only_before) = folder_names(before);
    let (changed_after, read_only_after) = folder_names(after);
    let declared_before = [changed_before, read_only_before].concat();
    let declared_after = [changed_after.clone(), read_only_after].concat();
    let still_changed = narrowed(&changed, &declared_before, &changed_after, |folder| {
        within(folder, &changed)
    });
    let still_read = narrowed(&read_only, &declared_before, &declared_after, |folder| {
        !still_changed.iter().any(|kept| kept == folder)
            && (within(folder, &read_only) || within(folder, &changed))
    });
    let still_devices = narrowed(&devices, &before.devices, &after.devices, |device| {
        devices
            .iter()
            .any(|held| held == device || held == ALL_DEVICES)
    });
    let still_talk = narrowed(&talk, &before.talk, &after.talk, |name| {
        reaches(&talk, name)
    });
    store(connection, &FOLDERS, id, &still_changed).await?;
    store(connection, &READ_ONLY_FOLDERS, id, &still_read).await?;
    store(connection, &DEVICES, id, &still_devices).await?;
    store(connection, &BUS, id, &still_talk).await?;
    if !after.x11 {
        store(connection, &X11, id, &[]).await?;
    }
    if before.microphone && !after.microphone {
        store(connection, &MICROPHONE, id, &[]).await?;
    }
    if before.camera && !after.camera {
        store(connection, &CAMERA, id, &[]).await?;
    }
    if after.network {
        Ok(())
    } else {
        store(connection, &NETWORK, id, &[NO.to_owned()]).await
    }
}

/// What the app's sandbox opens to it, in Flatpak's words.
pub async fn granted(id: &str) -> Result<Permissions, String> {
    let connection = dbus::session().await?;
    let (folders, read_only, devices, network, talk, downloads, x11, microphone, camera) = futures_util::try_join!(
        held(connection, &FOLDERS, id),
        held(connection, &READ_ONLY_FOLDERS, id),
        held(connection, &DEVICES, id),
        held(connection, &NETWORK, id),
        held(connection, &BUS, id),
        held(connection, &DOWNLOADS, id),
        given(connection, &X11, id),
        given(connection, &MICROPHONE, id),
        given(connection, &CAMERA, id),
    )?;
    let closed = |answer: &[String]| answer.first().map(String::as_str) == Some(NO);
    Ok(Declaration {
        network: !closed(&network),
        filesystems: folders
            .into_iter()
            .chain(read_only.into_iter().map(|folder| format!("{folder}:ro")))
            .collect(),
        devices,
        talk,
        x11,
        microphone,
        camera,
        unsandboxed: None,
    }
    .opened(!closed(&downloads)))
}

#[cfg(test)]
mod tests {
    use super::{narrowed, within};

    fn owned(values: &[&str]) -> Vec<String> {
        values.iter().map(|value| (*value).to_owned()).collect()
    }

    #[test]
    fn an_update_keeps_what_is_held_and_still_asked_for() {
        let held = owned(&["/home/me", "/srv/projects"]);
        let before = owned(&["/home/me", "/home/me/Pictures"]);
        let after = owned(&["/home/me/Documents", "/home/me/Music"]);
        assert_eq!(
            narrowed(&held, &before, &after, |folder| within(folder, &held)),
            owned(&["/home/me/Documents", "/home/me/Music", "/srv/projects"])
        );
    }

    #[test]
    fn an_update_does_not_bring_back_what_was_taken_away() {
        let held = owned(&["/home/me/Music"]);
        let before = owned(&["/home/me/Music", "/home/me/Pictures"]);
        let after = owned(&["/home/me/Pictures", "/home/me/Videos"]);
        assert!(narrowed(&held, &before, &after, |folder| within(folder, &held)).is_empty());
    }
}
