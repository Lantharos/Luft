use std::process::ExitCode;
use std::sync::Arc;
use std::time::Duration;

use luft_dbus_macros::introspect;
use tokio::sync::Mutex;
use tokio::task::spawn_blocking;
use tokio::time::timeout;
use zbus::message::Header;
use zbus::{Connection, OwnedFd, interface};

use super::error::Error;
use crate::access;
use crate::idle::Idle;

const NAME: &str = "com.lantharos.Password1";
const PATH: &str = "/com/lantharos/Password1";
const CHANGE: &str = "com.lantharos.password.change";
const IDLE_TIMEOUT: Duration = Duration::from_secs(30);
const READ_LIMIT: Duration = Duration::from_secs(10);

struct Passwords {
    idle: Arc<Idle>,
    changing: Mutex<()>,
}

async fn within<T: Send + 'static>(
    work: impl FnOnce() -> Result<T, Error> + Send + 'static,
) -> Result<T, Error> {
    match timeout(READ_LIMIT, spawn_blocking(work)).await {
        Ok(Ok(result)) => result,
        Ok(Err(_)) | Err(_) => Err(Error::failed()),
    }
}

#[introspect]
#[interface(name = "com.lantharos.Password1")]
impl Passwords {
    async fn change_password(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        current: OwnedFd,
        new: OwnedFd,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        if !luft_dbus::polkit::is_authorized(connection, &header, CHANGE).await? {
            return Err(Error::not_authorized());
        }
        let uid = access::caller_uid(connection, &header)
            .await
            .map_err(|_| Error::not_authorized())?;
        let current = within(move || super::read(current.into())).await?;
        let new = within(move || super::read(new.into())).await?;
        let _changing = self.changing.lock().await;
        spawn_blocking(move || super::change(uid, &current, &new))
            .await
            .unwrap_or_else(|_| Err(Error::failed()))
    }
}

pub async fn serve() -> ExitCode {
    let idle = Arc::new(Idle::default());
    let passwords = Passwords {
        idle: idle.clone(),
        changing: Mutex::default(),
    };
    let served = async {
        let connection = zbus::connection::Builder::system()
            .serve_at(PATH, passwords)
            .name(NAME)
            .build()
            .await?;
        idle.wait(IDLE_TIMEOUT).await;
        connection.release_name(NAME).await
    };
    match served.await {
        Ok(_) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Couldn't serve {NAME}: {error}");
            ExitCode::FAILURE
        }
    }
}
