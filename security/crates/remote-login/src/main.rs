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
use remoted::choices::Choices;
use zbus::object_server::InterfaceRef;

use service::{NAME, PATH, RemoteLogin};

const IDLE_TIMEOUT: Duration = Duration::from_secs(60);
const WRITE_SSHD_CONFIG: &str = "--write-sshd-config";

fn main() -> anyhow::Result<()> {
    luft_dbus::panics::report();
    match std::env::args().nth(1).as_deref() {
        None => serve(),
        Some(WRITE_SSHD_CONFIG) => Ok(Choices::load()?.effective().write_sshd_config()?),
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
    let remote_login = connection
        .object_server()
        .interface::<_, RemoteLogin>(PATH)
        .await?;
    remote_login.get().await.follow_policy(&remote_login).await;
    tokio::select! {
        () = idle.wait(IDLE_TIMEOUT) => {}
        followed = follow_policy(&remote_login) => followed?,
    }
    connection.release_name(NAME).await?;
    Ok(())
}

async fn follow_policy(remote_login: &InterfaceRef<RemoteLogin>) -> anyhow::Result<()> {
    let mut policy = luft_policy::Follow::start()?;
    loop {
        policy.changed().await?;
        remote_login.get().await.follow_policy(remote_login).await;
    }
}
