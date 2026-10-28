use luft_app::dbus;
use luft_app::identity::permissions::{
    self, BUS, DEVICES, FOLDERS, FULL_ACCESS, NETWORK, NO, Permission, READ_ONLY_FOLDERS,
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
    let folders = declaration.folders();
    let paths = |writable: bool| -> Vec<String> {
        folders
            .iter()
            .filter(|(_, can_write)| *can_write == writable)
            .map(|(folder, _)| folder.display().to_string())
            .collect()
    };
    let (changed, read_only) = (paths(true), paths(false));
    store(connection, &FOLDERS, id, &changed).await?;
    store(connection, &READ_ONLY_FOLDERS, id, &read_only).await?;
    store(connection, &DEVICES, id, &declaration.devices).await?;
    store(connection, &BUS, id, &declaration.talk).await?;
    let offline = if declaration.network {
        Vec::new()
    } else {
        vec![NO.to_owned()]
    };
    store(connection, &NETWORK, id, &offline).await
}

/// What the app's sandbox opens to it, in Flatpak's words.
pub async fn granted(id: &str) -> Result<Permissions, String> {
    let connection = dbus::session().await?;
    let (folders, read_only, devices, network, talk) = futures_util::join!(
        permissions::values(connection, &FOLDERS, id),
        permissions::values(connection, &READ_ONLY_FOLDERS, id),
        permissions::values(connection, &DEVICES, id),
        permissions::values(connection, &NETWORK, id),
        permissions::values(connection, &BUS, id),
    );
    let mut permissions = Declaration {
        network: network.first().map(String::as_str) != Some(NO),
        devices,
        talk,
        ..Declaration::default()
    }
    .permissions();
    permissions.filesystems = folders
        .into_iter()
        .chain(read_only.into_iter().map(|folder| format!("{folder}:ro")))
        .collect();
    Ok(permissions)
}
