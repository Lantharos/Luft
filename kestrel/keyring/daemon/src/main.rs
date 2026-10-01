mod access;
mod daemon;
mod identity;
mod keyring;
mod manage;
mod passkeys;
mod portal;
mod prompter;
mod secrets;
mod ssh;
mod unlocking;
mod watch;

use std::process::ExitCode;
use std::sync::Arc;

use daemon::Daemon;
use keyring::{Keyring, Paths};
use zbus::fdo::RequestNameFlags;

const SECRETS: &str = "org.freedesktop.secrets";

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    unsafe {
        libc::prctl(libc::PR_SET_DUMPABLE, 0);
    }
    match run().await {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Luft Keyring stopped: {error}");
            ExitCode::FAILURE
        }
    }
}

async fn run() -> Result<(), Box<dyn std::error::Error>> {
    let keyring = Keyring::open(Paths::from_environment())?;
    let connection = zbus::connection::Builder::session()?.build().await?;
    let daemon = Arc::new(Daemon::new(connection.clone(), keyring));
    connection
        .object_server()
        .at(
            secrets::ROOT,
            secrets::Service {
                daemon: daemon.clone(),
            },
        )
        .await?;
    secrets::sync(&daemon).await;
    connection
        .object_server()
        .at(
            portal::PATH,
            portal::Portal {
                daemon: daemon.clone(),
            },
        )
        .await?;
    manage::serve(&daemon).await?;
    connection
        .request_name_with_flags(SECRETS, RequestNameFlags::DoNotQueue.into())
        .await?;
    connection
        .request_name_with_flags(manage::NAME, RequestNameFlags::DoNotQueue.into())
        .await?;
    daemon.start_unlocking().await;
    if let Err(error) = ssh::start(&daemon) {
        eprintln!("The SSH agent couldn't start: {error}");
    }
    watch::start(&daemon).await?;
    std::future::pending::<()>().await;
    Ok(())
}
