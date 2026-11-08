use luft_dbus_macros::introspect;
use zbus::{Connection, OwnedObjectPath, proxy};

const SSHD: &str = "sshd";

#[introspect]
#[proxy(
    interface = "org.freedesktop.login1.Manager",
    default_service = "org.freedesktop.login1",
    default_path = "/org/freedesktop/login1"
)]
trait Login {
    fn list_sessions(&self) -> zbus::Result<Vec<(String, u32, String, String, OwnedObjectPath)>>;

    fn terminate_session(&self, id: &str) -> zbus::Result<()>;
}

#[introspect]
#[proxy(
    interface = "org.freedesktop.login1.Session",
    default_service = "org.freedesktop.login1"
)]
trait Session {
    #[zbus(property)]
    fn service(&self) -> zbus::Result<String>;
}

pub async fn end_all(connection: &Connection) -> zbus::Result<()> {
    let login = LoginProxy::new(connection).await?;
    for (id, .., path) in login.list_sessions().await? {
        let session = SessionProxy::builder(connection).path(path).build().await?;
        if session.service().await? == SSHD {
            login.terminate_session(&id).await?;
        }
    }
    Ok(())
}
