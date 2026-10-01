mod context;
mod modules;
mod options;
mod shared;

use std::process::ExitCode;

use futures_util::StreamExt;
use futures_util::future::join_all;
use tokio::signal::unix::{SignalKind, signal};
use zbus::fdo::DBusProxy;

use context::Context;
use options::Options;

const NAME: &str = "com.lantharos.Settings";

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    let options = match Options::parse(std::env::args().skip(1)) {
        Ok(options) => options,
        Err(message) => {
            eprintln!("{message}");
            return ExitCode::from(2);
        }
    };
    match run(options).await {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Couldn't serve {NAME}: {error}");
            ExitCode::FAILURE
        }
    }
}

async fn run(options: Options) -> zbus::Result<()> {
    let context = Context::connect().await?;
    join_all(
        options
            .modules
            .into_iter()
            .map(|module| module.start(&context)),
    )
    .await;
    let mut lost = DBusProxy::new(&context.session)
        .await?
        .receive_name_lost_with_args(&[(0, NAME)])
        .await?;
    context.session.request_name(NAME).await?;
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    tokio::select! {
        _ = terminate.recv() => {}
        _ = interrupt.recv() => {}
        _ = lost.next() => {}
    }
    Ok(())
}
