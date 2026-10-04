use zbus::zvariant::OwnedObjectPath;
use zbus::{Connection, proxy};

use super::sessions::Session;

#[proxy(
    interface = "org.freedesktop.Accounts",
    default_service = "org.freedesktop.Accounts",
    default_path = "/org/freedesktop/Accounts"
)]
trait Accounts {
    fn find_user_by_name(&self, name: &str) -> zbus::Result<OwnedObjectPath>;
}

#[proxy(
    interface = "org.freedesktop.Accounts.User",
    default_service = "org.freedesktop.Accounts"
)]
trait User {
    fn set_session(&self, session: &str) -> zbus::Result<()>;

    fn set_session_type(&self, session_type: &str) -> zbus::Result<()>;
}

pub async fn remember_session(
    connection: &Connection,
    username: &str,
    session: &Session,
) -> zbus::Result<()> {
    let path = AccountsProxy::new(connection)
        .await?
        .find_user_by_name(username)
        .await?;
    let user = UserProxy::builder(connection).path(path)?.build().await?;
    user.set_session(&session.id).await?;
    user.set_session_type("wayland").await
}
