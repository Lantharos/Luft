use zbus::proxy::CacheProperties;
use zbus::zvariant::OwnedObjectPath;
use zbus::{Connection, proxy};

use crate::error::Error;

const GREETER_CLASS: &str = "greeter";

#[proxy(
    interface = "org.freedesktop.login1.Manager",
    default_service = "org.freedesktop.login1",
    default_path = "/org/freedesktop/login1"
)]
trait Manager {
    #[zbus(name = "GetSessionByPID")]
    fn get_session_by_pid(&self, pid: u32) -> zbus::Result<OwnedObjectPath>;
}

#[proxy(
    interface = "org.freedesktop.login1.Session",
    default_service = "org.freedesktop.login1"
)]
trait Session {
    #[zbus(property)]
    fn class(&self) -> zbus::Result<String>;
}

pub async fn require_greeter(connection: &Connection, pid: u32) -> Result<(), Error> {
    let Ok(path) = ManagerProxy::new(connection)
        .await?
        .get_session_by_pid(pid)
        .await
    else {
        return Err(Error::not_authorized());
    };
    let class = SessionProxy::builder(connection)
        .path(path)?
        .cache_properties(CacheProperties::No)
        .build()
        .await?
        .class()
        .await?;
    if class == GREETER_CLASS {
        Ok(())
    } else {
        Err(Error::not_authorized())
    }
}
