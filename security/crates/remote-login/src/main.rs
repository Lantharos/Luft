mod accounts;
mod choices;
mod error;
mod firewall;
mod keys;
mod service;
mod sessions;
mod sshd;

use std::sync::Arc;
use std::time::Duration;

use luft_dbus::idle::Idle;

use service::{NAME, PATH, RemoteLogin};

const IDLE_TIMEOUT: Duration = Duration::from_secs(60);

#[tokio::main(flavor = "current_thread")]
async fn main() -> anyhow::Result<()> {
    let idle = Arc::new(Idle::default());
    let connection = zbus::connection::Builder::system()
        .serve_at(PATH, RemoteLogin::new(idle.clone()))
        .name(NAME)
        .build()
        .await?;
    idle.wait(IDLE_TIMEOUT).await;
    connection.release_name(NAME).await?;
    Ok(())
}
