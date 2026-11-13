use luft_identity::permissions::{self, Permission};
use zbus::Connection;

use super::{Access, drives, folders, overrides, reachable, store};

/// The entries Luft last wrote into a Flatpak app's overrides for the drives
/// and folders it was given, so the next change takes out exactly those.
const WRITTEN: Permission = Permission {
    table: "sandbox",
    id: "flatpak-places",
};
const READ_ONLY: &str = ":ro";

fn entry(path: &str, access: Access) -> String {
    match access {
        Access::ReadWrite => path.to_owned(),
        Access::ReadOnly => format!("{path}{READ_ONLY}"),
    }
}

/// Opens to a Flatpak app, from its next start, the folders it was given and
/// where the drives it was given are mounted now, and nothing it was given
/// before that it isn't any more.
pub async fn apply(connection: &Connection, id: &str) -> Result<(), String> {
    let explain = |error: zbus::Error| luft_dbus::explain(&error);
    let (given, held, before) = futures_util::try_join!(
        folders(connection, id),
        async { store::of(connection, id).await.map_err(explain) },
        async {
            permissions::values(connection, &WRITTEN, id)
                .await
                .map_err(explain)
        },
    )?;
    let mounted = if held
        .iter()
        .any(|(_, answer)| matches!(answer, store::Answer::Given(_)))
    {
        drives::mounted().await?
    } else {
        Vec::new()
    };
    let after: Vec<String> = given
        .iter()
        .map(|(folder, access)| entry(folder, *access))
        .chain(
            reachable(&held, &mounted)
                .into_iter()
                .map(|(point, access)| entry(&point.to_string_lossy(), access)),
        )
        .collect();
    if after == before {
        return Ok(());
    }
    overrides::replace(id, &before, &after)?;
    let written: Vec<&str> = after.iter().map(String::as_str).collect();
    permissions::set_values(connection, &WRITTEN, id, &written)
        .await
        .map_err(explain)
}

/// Forgets what Luft wrote for the app, once it took it out of its overrides.
pub async fn forget(connection: &Connection, id: &str) -> zbus::Result<()> {
    permissions::forget(connection, WRITTEN.table, WRITTEN.id, id).await
}
