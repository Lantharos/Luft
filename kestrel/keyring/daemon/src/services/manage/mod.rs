mod access;
mod apps;
mod ssh;
mod status;

use std::sync::Arc;

use zbus::fdo;
use zbus::message::Header;

pub use access::Access;
pub use apps::AppSecrets;
pub use status::{Status, publish};

use crate::daemon::Daemon;
use crate::identity::App;
#[cfg(debug_assertions)]
use crate::identity::Kind;

pub const NAME: &str = "com.lantharos.Keyring1";
pub const PATH: &str = "/com/lantharos/Keyring1";
const SETTINGS: &str = "app:com.lantharos.settings";

pub async fn serve(daemon: &Arc<Daemon>) -> zbus::Result<()> {
    let server = daemon.connection.object_server();
    let daemon = || daemon.clone();
    server.at(PATH, Status { daemon: daemon() }).await?;
    server.at(PATH, Access { daemon: daemon() }).await?;
    server.at(PATH, AppSecrets { daemon: daemon() }).await?;
    server.at(PATH, ssh::Ssh { daemon: daemon() }).await?;
    server
        .at(
            PATH,
            crate::services::passkeys::Passkeys { daemon: daemon() },
        )
        .await?;
    Ok(())
}

async fn settings_only(daemon: &Daemon, header: &Header<'_>) -> fdo::Result<()> {
    let (_, app) = daemon.caller(header).await;
    if app.key == SETTINGS || is_development_settings(&app) {
        Ok(())
    } else {
        Err(fdo::Error::AccessDenied(
            "Only Settings can manage the keyring".into(),
        ))
    }
}

#[cfg(debug_assertions)]
fn is_development_settings(app: &App) -> bool {
    app.kind == Kind::Host
        && std::env::var_os("LUFT_KEYRING_DEVELOPMENT_SETTINGS")
            .is_some_and(|build| build == app.executable.as_str())
}

#[cfg(not(debug_assertions))]
fn is_development_settings(_: &App) -> bool {
    false
}
