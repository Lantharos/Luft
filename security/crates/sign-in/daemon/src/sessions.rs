use luft_dbus_macros::introspect;
use zbus::{Connection, OwnedObjectPath, proxy};

type Listed = (String, u32, String, String, OwnedObjectPath);

#[introspect]
#[proxy(
    interface = "org.freedesktop.login1.Manager",
    default_service = "org.freedesktop.login1",
    default_path = "/org/freedesktop/login1"
)]
trait Logind {
    fn list_sessions(&self) -> zbus::Result<Vec<Listed>>;

    fn lock_session(&self, session_id: &str) -> zbus::Result<()>;
}

/// Locks every session `uid` has at the computer's own screen; sessions
/// without a seat, such as the user manager's, have no screen to lock.
pub async fn lock(connection: &Connection, uid: u32) -> zbus::Result<()> {
    let logind = LogindProxy::new(connection).await?;
    for (id, owner, _, seat, _) in logind.list_sessions().await? {
        if owner == uid && !seat.is_empty() {
            logind.lock_session(&id).await?;
        }
    }
    Ok(())
}
