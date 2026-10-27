mod context;
mod gio_thread;
mod portals;
mod request;
mod shell;

use std::process::ExitCode;

use futures_util::StreamExt;
use luft_i18n::Localizer;
use tokio::signal::unix::{SignalKind, signal};
use zbus::Connection;
use zbus::fdo::DBusProxy;

use context::Context;

const NAME: &str = "com.lantharos.Kestrel.Portal";

static L10N: Localizer = luft_i18n::localizer!("locales", ["portal"]);

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    match run().await {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Couldn't serve {NAME}: {error}");
            ExitCode::FAILURE
        }
    }
}

async fn run() -> zbus::Result<()> {
    let connection = Connection::session().await?;
    let context = Context::new(connection.clone());
    portals::serve(&context).await?;
    let mut lost = DBusProxy::new(&connection)
        .await?
        .receive_name_lost_with_args(&[(0, NAME)])
        .await?;
    connection.request_name(NAME).await?;
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    tokio::select! {
        _ = terminate.recv() => {}
        _ = interrupt.recv() => {}
        _ = lost.next() => {}
    }
    Ok(())
}
