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
mod transcription;
mod warm;

use std::sync::Arc;
use std::time::Duration;

use anyhow::Result;
use futures_util::StreamExt;
use tokio::signal::unix::{SignalKind, signal};
use tokio::sync::mpsc;
use zbus::object_server::SignalEmitter;

use bus::{Dictation, Models};
use hub::{Event, Hub, NAME, PATH};
use models::Store;

const WARM_FOR: Duration = Duration::from_secs(180);
const EXIT_WHEN_IDLE_FOR: Duration = Duration::from_secs(30);
const CHECK_EVERY: Duration = Duration::from_secs(5);
const TRANSCRIPTION: &str = "--transcription";

async fn tell_listener(
    hub: &Hub,
    everyone: &SignalEmitter<'static>,
    event: Event,
) -> zbus::Result<()> {
    let Some(listener) = hub.listener.lock().expect("listener lock").clone() else {
        return Ok(());
    };
    let listener = everyone.clone().set_destination(listener.into());
    match event {
        Event::Partial(text) => Dictation::partial(&listener, &text).await,
        Event::Typed(text) => Dictation::typed(&listener, &text).await,
        Event::Level(level) => Dictation::level(&listener, level).await,
        Event::Quiet => Dictation::quiet(&listener).await,
        Event::Sent(_) | Event::Changed => Ok(()),
    }
}

fn main() -> Result<()> {
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .enable_all()
        .build()?
        .block_on(async {
            if std::env::args().any(|argument| argument == TRANSCRIPTION) {
                transcription::serve().await
            } else {
                serve().await
            }
        })
}

async fn serve() -> Result<()> {
    let (events, mut received) = mpsc::unbounded_channel();
    let hub = Arc::new(Hub::new(Store::for_service("luft-speech")?, events));
    hub.follow();
    let following = hub.clone();
    preferences::watch(move || following.follow())?;
    let connection = zbus::Connection::session().await?;
    let names = zbus::fdo::DBusProxy::new(&connection).await?;
    let mut shell_owners = names
        .receive_name_owner_changed_with_args(&[(0, bus::SHELL.as_str())])
        .await?;
    let (dictation, models) = bus::serve(&hub, names);
    connection.object_server().at(PATH, dictation).await?;
    connection.object_server().at(PATH, models).await?;
    connection.request_name(NAME).await?;
    let everyone = SignalEmitter::new(&connection, PATH)?;
    let speaking = hub.clone();
    tokio::spawn(async move {
        while let Some(event) = received.recv().await {
            let sent = match event {
                Event::Sent(done) => {
                    let _ = done.send(());
                    Ok(())
                }
                Event::Changed => Models::changed(&everyone).await,
                heard => tell_listener(&speaking, &everyone, heard).await,
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
            Some(_) = shell_owners.next() => {
                if let Some(session) = hub.session.lock().await.take() {
                    session.cancel();
                }
            }
            _ = tick.tick() => {
                hub.warm.expire(WARM_FOR);
                if hub.idle_for() >= EXIT_WHEN_IDLE_FOR {
                    return Ok(());
                }
            }
        }
    }
}
