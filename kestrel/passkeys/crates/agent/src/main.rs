mod consent;
mod device;
mod platform;
mod service;
mod vault;

use std::ffi::CStr;
use std::process::ExitCode;

use zbus::Connection;

use consent::Consent;
use platform::Agent;
use service::{Notifier, PATH, Service};
use vault::Vault;

const NAME: &str = "com.lantharos.Passkeys";

fn user_name() -> Option<String> {
    let entry = unsafe { libc::getpwuid(libc::getuid()) };
    (!entry.is_null()).then(|| {
        unsafe { CStr::from_ptr((*entry).pw_name) }
            .to_string_lossy()
            .into_owned()
    })
}

async fn start() -> zbus::Result<(Agent, Notifier)> {
    let session = Connection::session().await?;
    let vault = Vault::connect(&session).await?;
    session
        .object_server()
        .at(PATH, Service::new(vault.clone()))
        .await?;
    session.request_name(NAME).await?;
    let user =
        user_name().ok_or_else(|| zbus::Error::Failure("this account has no name".into()))?;
    let notifier = Notifier::new(session.clone());
    Ok((
        Agent::new(vault, Consent::new(session, user), notifier.clone()),
        notifier,
    ))
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    match start().await {
        Ok((agent, notifier)) => device::run(agent, notifier).await,
        Err(error) => {
            eprintln!("Couldn't start passkeys: {error}");
            ExitCode::FAILURE
        }
    }
}
