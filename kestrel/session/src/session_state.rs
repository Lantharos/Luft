use std::sync::Arc;

use futures_util::StreamExt;
use luft_dbus_macros::introspect;
use zbus::{Connection, proxy};

use crate::manager::{Session, SessionState};

#[introspect]
#[proxy(
    interface = "org.freedesktop.login1.Session",
    default_service = "org.freedesktop.login1",
    default_path = "/org/freedesktop/login1/session/auto"
)]
trait LoginSession {
    #[zbus(property)]
    fn active(&self) -> zbus::Result<bool>;

    #[zbus(property)]
    fn locked_hint(&self) -> zbus::Result<bool>;
}

/// Follows whether logind counts your session as active and locked.
pub async fn follow(system: Connection, session: Arc<Session>) -> zbus::Result<()> {
    let login = LoginSessionProxy::new(&system).await?;
    let mut active_changes = login.receive_active_changed().await;
    let mut locked_changes = login.receive_locked_hint_changed().await;
    let mut state = SessionState {
        active: login.active().await?,
        locked: login.locked_hint().await?,
    };
    session.set_state(state).await?;
    loop {
        tokio::select! {
            Some(change) = active_changes.next() => state.active = change.get().await?,
            Some(change) = locked_changes.next() => state.locked = change.get().await?,
        }
        session.set_state(state).await?;
    }
}
