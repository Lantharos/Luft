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
use crate::requester::Requester;

pub const NAME: &str = "com.lantharos.Keyring1";
pub const PATH: &str = "/com/lantharos/Keyring1";

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

async fn yours(daemon: &Daemon, header: &Header<'_>) -> fdo::Result<Requester> {
    let requester = daemon.requester(header).await;
    if requester.is_you() {
        Ok(requester)
    } else {
        Err(fdo::Error::AccessDenied(
            "Apps in a sandbox can't manage the keyring".into(),
        ))
    }
}

async fn confirmed(daemon: &Arc<Daemon>, header: &Header<'_>, wants: &str) -> fdo::Result<()> {
    let requester = yours(daemon, header).await?;
    let connection = requester.connection.unwrap_or_default();
    if daemon.granted.may_manage(&connection) {
        return Ok(());
    }
    let body = format!("An app on this computer wants to {wants}.");
    if !daemon.confirm_its_you("Confirm it's you", &body).await {
        return Err(fdo::Error::AccessDenied("It wasn't confirmed".into()));
    }
    daemon.granted.let_manage(&connection);
    Ok(())
}
