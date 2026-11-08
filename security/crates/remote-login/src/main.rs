mod accounts;
mod error;
mod firewall;
mod keys;
mod service;
mod sessions;
mod sshd;

use std::sync::Arc;
use std::time::Duration;

use anyhow::bail;
use luft_dbus::idle::Idle;
use luft_remote_login::choices::Choices;

use service::{NAME, PATH, RemoteLogin};

const IDLE_TIMEOUT: Duration = Duration::from_secs(60);
const WRITE_SSHD_CONFIG: &str = "--write-sshd-config";

fn main() -> anyhow::Result<()> {
    match std::env::args().nth(1).as_deref() {
        None => serve(),
        Some(WRITE_SSHD_CONFIG) => Ok(Choices::load()?.write_sshd_config()?),
        Some(argument) => bail!("Unknown argument {argument}"),
    }
}

#[tokio::main(flavor = "current_thread")]
async fn serve() -> anyhow::Result<()> {
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
