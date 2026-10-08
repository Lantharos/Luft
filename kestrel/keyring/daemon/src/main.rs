mod access;
mod daemon;
mod identity;
mod keyring;
mod prompter;
mod services;
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
            services::secrets::ROOT,
            services::secrets::Service {
                daemon: daemon.clone(),
            },
        )
        .await?;
    services::secrets::sync(&daemon).await;
    connection
        .object_server()
        .at(
            services::portal::PATH,
            services::portal::Portal {
                daemon: daemon.clone(),
            },
        )
        .await?;
    services::manage::serve(&daemon).await?;
    connection
        .request_name_with_flags(SECRETS, RequestNameFlags::DoNotQueue.into())
        .await?;
    connection
        .request_name_with_flags(services::manage::NAME, RequestNameFlags::DoNotQueue.into())
        .await?;
    daemon.start_unlocking().await;
    if let Err(error) = services::ssh::start(&daemon) {
        eprintln!("The SSH agent couldn't start: {error}");
    }
    watch::start(&daemon).await?;
    std::future::pending::<()>().await;
    Ok(())
}
