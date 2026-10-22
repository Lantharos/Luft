use luft_app::dbus;
use luft_app::identity::permissions::{self, FULL_ACCESS};

/// Starts the AppImage without its sandbox from its next launch, or puts it
/// back in its sandbox.
pub async fn set_full_access(id: &str, on: bool) -> Result<(), String> {
    permissions::set(
        dbus::session().await?,
        FULL_ACCESS.table,
        FULL_ACCESS.id,
        id,
        on,
    )
    .await
    .map_err(|error| dbus::explain(&error))
}
