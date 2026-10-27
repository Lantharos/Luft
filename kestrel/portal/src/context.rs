use zbus::Connection;
use zbus::fdo::{self, DBusProxy};
use zbus::message::Header;
use zbus::names::BusName;

use crate::gio_thread::GioThread;
use crate::shell::Shell;

const TRUSTED: [&str; 2] = ["org.freedesktop.portal.Desktop", "com.lantharos.Kestrel"];

#[derive(Clone)]
pub struct Context {
    pub connection: Connection,
    pub gio: GioThread,
    pub shell: Shell,
}

impl Context {
    pub fn new(connection: Connection) -> Self {
        Self {
            shell: Shell::new(connection.clone()),
            gio: GioThread::start(),
            connection,
        }
    }

    pub async fn allow(&self, header: &Header<'_>) -> fdo::Result<()> {
        let bus = DBusProxy::new(&self.connection).await?;
        let sender = header
            .sender()
            .map(|sender| sender.as_str())
            .unwrap_or_default();
        for trusted in TRUSTED {
            let owner = bus
                .get_name_owner(BusName::from_static_str(trusted).expect("a valid bus name"))
                .await;
            if owner.is_ok_and(|owner| owner.as_str() == sender) {
                return Ok(());
            }
        }
        Err(fdo::Error::AccessDenied(
            "Only the desktop portal and Kestrel can call Kestrel's portal".into(),
        ))
    }
}
