mod audio;
mod bus;
mod dictation;
mod engines;
mod hub;
mod language;
mod models;
mod onnx;
mod plan;
mod preferences;
mod warm;

use std::sync::Arc;
use std::time::Duration;

use anyhow::Result;
use tokio::signal::unix::{SignalKind, signal};
use tokio::sync::mpsc;

use hub::{Event, Hub, NAME, PATH};
use models::Store;

const WARM_FOR: Duration = Duration::from_secs(180);
const EXIT_WHEN_IDLE_FOR: Duration = Duration::from_secs(30);
const CHECK_EVERY: Duration = Duration::from_secs(5);

async fn to_shell<B>(
    connection: &zbus::Connection,
    names: &zbus::fdo::DBusProxy<'_>,
    member: &str,
    body: &B,
) -> zbus::Result<()>
where
    B: serde::Serialize + zbus::zvariant::DynamicType,
{
    let shell = names.get_name_owner(bus::SHELL).await?;
    connection
        .emit_signal(Some(shell.as_ref()), PATH, NAME, member, body)
        .await
}

fn main() -> Result<()> {
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .enable_all()
        .build()?
        .block_on(serve())
}

async fn serve() -> Result<()> {
    let (events, mut received) = mpsc::unbounded_channel();
    let hub = Arc::new(Hub::new(Store::from_environment()?, events));
    hub.follow();
    let following = hub.clone();
    preferences::watch(move || following.follow())?;
    let connection = zbus::Connection::session().await?;
    let names = zbus::fdo::DBusProxy::new(&connection).await?;
    let (dictation, models) = bus::serve(&hub, names.clone());
    connection.object_server().at(PATH, dictation).await?;
    connection.object_server().at(PATH, models).await?;
    connection.request_name(NAME).await?;
    let emitter = connection.clone();
    tokio::spawn(async move {
        while let Some(event) = received.recv().await {
            let sent = match event {
                Event::Partial(text) => to_shell(&emitter, &names, "Partial", &(text,)).await,
                Event::Typed(text) => to_shell(&emitter, &names, "Typed", &(text,)).await,
                Event::Sent(done) => {
                    let _ = done.send(());
                    Ok(())
                }
                Event::Level(level) => to_shell(&emitter, &names, "Level", &(level,)).await,
                Event::Quiet => to_shell(&emitter, &names, "Quiet", &()).await,
                Event::Changed => {
                    emitter
                        .emit_signal(
                            None::<&str>,
                            PATH,
                            "com.lantharos.Speech1.Models",
                            "Changed",
                            &(),
                        )
                        .await
                }
            };
            if let Err(error) = sent {
                eprintln!("Couldn't send a signal: {error}");
            }
        }
    });
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    let mut tick = tokio::time::interval(CHECK_EVERY);
    loop {
        tokio::select! {
            _ = terminate.recv() => return Ok(()),
            _ = interrupt.recv() => return Ok(()),
            _ = tick.tick() => {
                hub.warm.expire(WARM_FOR);
                if hub.idle_for() >= EXIT_WHEN_IDLE_FOR {
                    return Ok(());
                }
            }
        }
    }
}
