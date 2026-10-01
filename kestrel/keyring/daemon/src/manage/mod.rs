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
    Ok(())
}

const SETTINGS_BUILDS: [&str; 2] = [
    "/apps/settings/desktop/target/release/settings",
    "/apps/settings/desktop/target/debug/settings",
];

async fn settings_only(daemon: &Daemon, header: &Header<'_>) -> fdo::Result<()> {
    let (_, app) = daemon.caller(header).await;
    let development = app.kind == Kind::Host
        && SETTINGS_BUILDS
            .iter()
            .any(|build| app.executable.ends_with(build));
    if app.key == SETTINGS || development {
        Ok(())
    } else {
        Err(fdo::Error::AccessDenied(
            "Only Settings can manage the keyring".into(),
        ))
    }
}
