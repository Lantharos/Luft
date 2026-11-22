use luft_dbus::polkit::{self, Details, Process};
use zbus::Connection;
use zbus::proxy::CacheProperties;

use super::protection::{Answer, Question};
use super::seat::{SeatProxy, SessionProxy};

pub const ALLOW: &str = "com.lantharos.usb-protection.allow-device";

pub fn message(name: &str) -> String {
    format!("Let “{name}” connect to this computer")
}

fn cancellation(serial: u64) -> String {
    format!("portguard-{serial}")
}

async fn on_screen(connection: &Connection) -> zbus::Result<Process> {
    let (_, path) = SeatProxy::new(connection).await?.active_session().await?;
    let session = SessionProxy::builder(connection)
        .path(path)
        .cache_properties(CacheProperties::No)
        .build()
        .await?;
    let (leader, (uid, _)) = (session.leader().await?, session.user().await?);
    Process::of(leader, uid).map_err(|error| zbus::Error::Failure(error.to_string()))
}

async fn prompt(connection: &Connection, question: &Question) -> zbus::Result<bool> {
    let process = on_screen(connection).await?;
    let message = message(&question.name);
    polkit::process_is_authorized_to(
        connection,
        &process,
        ALLOW,
        &Details::message(&message),
        &cancellation(question.serial),
    )
    .await
}

/// Asks an administrator at the computer whether the device may connect,
/// while it stays disconnected, so it can't answer for itself.
pub async fn ask(connection: &Connection, question: &Question) -> Answer {
    match prompt(connection, question).await {
        Ok(true) => Answer::Approved,
        Ok(false) => Answer::Declined,
        Err(error) => {
            eprintln!("Couldn't ask about {}: {error}", question.name);
            Answer::Unanswered
        }
    }
}

pub async fn cancel(connection: &Connection, serial: u64) {
    if let Err(error) = polkit::cancel(connection, &cancellation(serial)).await {
        eprintln!("Couldn't take back the question about a device that left: {error}");
    }
}
