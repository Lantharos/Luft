//! The desktop portal's permission store, where Luft keeps what apps were allowed.

use std::collections::HashMap;

use futures_util::{Stream, StreamExt};
use zbus::OwnedVariant;
use zbus::{Connection, proxy};

const NOT_FOUND: &str = "org.freedesktop.portal.Error.NotFound";
pub const YES: &str = "yes";
pub const NO: &str = "no";

pub type Apps = HashMap<String, Vec<String>>;

/// One entry of the store: the table it is kept in and its ID there.
pub struct Permission {
    pub table: &'static str,
    pub id: &'static str,
}

/// Sandboxed apps that count as you. A Flatpak keeps running in its sandbox
/// with every opening Flatpak can make, an AppImage runs without one.
pub const FULL_ACCESS: Permission = Permission {
    table: "full-access",
    id: "full-access",
};

/// Sandboxed apps that may read and set the clipboard while in the background.
pub const BACKGROUND_CLIPBOARD: Permission = Permission {
    table: "background-clipboard",
    id: "background-clipboard",
};

/// Folders an AppImage's sandbox opens, one path per folder.
pub const FOLDERS: Permission = Permission {
    table: "sandbox",
    id: "folders",
};

/// Folders an AppImage's sandbox opens read-only, one path per folder.
pub const READ_ONLY_FOLDERS: Permission = Permission {
    table: "sandbox",
    id: "read-only-folders",
};

/// Devices an AppImage's sandbox opens: `usb`, `serial` or `all`.
pub const DEVICES: Permission = Permission {
    table: "sandbox",
    id: "devices",
};

/// AppImages whose sandbox stays offline, with `no`.
pub const NETWORK: Permission = Permission {
    table: "sandbox",
    id: "network",
};

/// Session bus names an AppImage's sandbox may call besides those every
/// sandbox may.
pub const BUS: Permission = Permission {
    table: "sandbox",
    id: "bus",
};

/// Sandboxed apps' choices about items in Luft Keyring, one entry per item.
pub const KEYRING_ITEMS: &str = "keyring-items";

#[proxy(
    interface = "org.freedesktop.impl.portal.PermissionStore",
    default_service = "org.freedesktop.impl.portal.PermissionStore",
    default_path = "/org/freedesktop/impl/portal/PermissionStore"
)]
pub trait Store {
    fn lookup(&self, table: &str, id: &str) -> zbus::Result<(Apps, OwnedVariant)>;

    fn set_permission(
        &self,
        table: &str,
        create: bool,
        id: &str,
        app: &str,
        permissions: &[&str],
    ) -> zbus::Result<()>;

    fn delete_permission(&self, table: &str, id: &str, app: &str) -> zbus::Result<()>;

    fn delete(&self, table: &str, id: &str) -> zbus::Result<()>;

    fn list(&self, table: &str) -> zbus::Result<Vec<String>>;

    #[zbus(signal)]
    fn changed(
        &self,
        table: String,
        id: String,
        deleted: bool,
        data: OwnedVariant,
        permissions: Apps,
    ) -> zbus::Result<()>;
}

fn missing(error: &zbus::Error) -> bool {
    luft_dbus::error_name(error).as_deref() == Some(NOT_FOUND)
}

/// The apps of one entry and what each was given; none when it doesn't exist.
pub async fn lookup(connection: &Connection, table: &str, id: &str) -> zbus::Result<Apps> {
    match StoreProxy::new(connection).await?.lookup(table, id).await {
        Ok((apps, _)) => Ok(apps),
        Err(error) if missing(&error) => Ok(Apps::new()),
        Err(error) => Err(error),
    }
}

/// What the app was given in one entry: yes, no, or nothing yet.
pub async fn answer(connection: &Connection, table: &str, id: &str, app: &str) -> Option<bool> {
    let apps = lookup(connection, table, id).await.ok()?;
    match apps.get(app)?.first()?.as_str() {
        YES => Some(true),
        NO => Some(false),
        _ => None,
    }
}

pub async fn allowed(connection: &Connection, permission: &Permission, app: &str) -> bool {
    answer(connection, permission.table, permission.id, app).await == Some(true)
}

/// Everything the app was given in one entry, such as the folders it may use.
pub async fn values(connection: &Connection, permission: &Permission, app: &str) -> Vec<String> {
    lookup(connection, permission.table, permission.id)
        .await
        .ok()
        .and_then(|mut apps| apps.remove(app))
        .unwrap_or_default()
}

pub async fn set_values(
    connection: &Connection,
    permission: &Permission,
    app: &str,
    values: &[&str],
) -> zbus::Result<()> {
    let store = StoreProxy::new(connection).await?;
    if values.is_empty() {
        return forget(connection, permission.table, permission.id, app).await;
    }
    store
        .set_permission(permission.table, true, permission.id, app, values)
        .await
}

pub async fn set(
    connection: &Connection,
    table: &str,
    id: &str,
    app: &str,
    allowed: bool,
) -> zbus::Result<()> {
    StoreProxy::new(connection)
        .await?
        .set_permission(table, true, id, app, &[if allowed { YES } else { NO }])
        .await
}

pub async fn forget(connection: &Connection, table: &str, id: &str, app: &str) -> zbus::Result<()> {
    match StoreProxy::new(connection)
        .await?
        .delete_permission(table, id, app)
        .await
    {
        Err(error) if !missing(&error) => Err(error),
        _ => Ok(()),
    }
}

pub async fn remove(connection: &Connection, table: &str, id: &str) -> zbus::Result<()> {
    match StoreProxy::new(connection).await?.delete(table, id).await {
        Err(error) if !missing(&error) => Err(error),
        _ => Ok(()),
    }
}

/// Every entry of a table with its apps.
pub async fn entries(connection: &Connection, table: &str) -> zbus::Result<Vec<(String, Apps)>> {
    let store = StoreProxy::new(connection).await?;
    let ids = match store.list(table).await {
        Ok(ids) => ids,
        Err(error) if missing(&error) => return Ok(Vec::new()),
        Err(error) => return Err(error),
    };
    let mut entries = Vec::with_capacity(ids.len());
    for id in ids {
        let apps = lookup(connection, table, &id).await?;
        entries.push((id, apps));
    }
    Ok(entries)
}

/// The tables whose entries change from now on.
pub async fn changes(connection: &Connection) -> zbus::Result<impl Stream<Item = String>> {
    Ok(StoreProxy::new(connection)
        .await?
        .receive_changed()
        .await?
        .filter_map(|signal| async move { signal.args().ok().map(|args| args.table) }))
}
