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

use anyhow::Result;
use futures_util::StreamExt;
use tokio::sync::mpsc;
use zbus::object_server::SignalEmitter;

use bus::{Dictation, Models};
use hub::{Event, Hub, NAME, PATH};

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

#[cfg(feature = "measure")]
fn measure(what: &str) -> Result<()> {
    match what {
        "recognize" => engines::measure::recognize_recorded_speech(),
        "dictate" => dictation::measure::dictate_long_recordings(),
        "transcribe" => transcription::measure::transcribe_recordings(),
        _ => anyhow::bail!("Measure recognize, dictate or transcribe"),
    }
    Ok(())
}

fn main() -> Result<()> {
    #[cfg(feature = "measure")]
    if let [_, measuring, what] = std::env::args().collect::<Vec<_>>().as_slice()
        && measuring == "measure"
    {
        return measure(what);
    }
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
    let hub = Arc::new(Hub::new(events)?);
    hub.follow_settings();
    let following = hub.clone();
    preferences::watch(move || following.follow_settings())?;
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
    let dictating = hub.clone();
    tokio::spawn(async move {
        while shell_owners.next().await.is_some() {
            if let Some(session) = dictating.session.lock().await.take() {
                session.cancel();
            }
        }
    });
    Ok(luft_dbus::idle::until_idle(|| hub.busy()).await?)
}
