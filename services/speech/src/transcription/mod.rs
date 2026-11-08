mod bus;
#[cfg(test)]
mod check;
mod resample;
mod job;
mod languages;
mod opus;
mod regions;

use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use anyhow::Result;
use luft_speech::types::Engine;
use tokio::signal::unix::{SignalKind, signal};

use crate::engines::{Processor, Whisper};
use crate::models::Store;
use crate::models::manifest;

pub const NAME: &str = "com.lantharos.Transcription1";
pub const PATH: &str = "/com/lantharos/Transcription1";
const WARM_FOR: Duration = Duration::from_secs(180);
const EXIT_WHEN_IDLE_FOR: Duration = Duration::from_secs(30);
const CHECK_EVERY: Duration = Duration::from_secs(5);

struct Loaded {
    whisper: Whisper,
    used: Instant,
}

/// Transcribing recordings, such as Heft's of a class: the same binary as
/// dictation, run as a service of its own at the lowest priority, so it only
/// gets time nothing else wants, and kept apart from dictation, which has to
/// answer at once.
pub struct Transcriber {
    processor: Processor,
    store: Store,
    loaded: Mutex<Option<Loaded>>,
    idle_since: Mutex<Option<Instant>>,
}

pub enum Refusal {
    NotInstalled(String),
    Unsupported,
}

impl Transcriber {
    fn transcribe(
        &self,
        file: std::fs::File,
        request: &job::Request,
    ) -> Result<Result<luft_speech::types::Transcribed, Refusal>> {
        let model = manifest::for_engine(Engine::Whisper);
        if !self.processor.runs(Engine::Whisper) {
            return Ok(Err(Refusal::Unsupported));
        }
        if !self.store.installed(model) {
            return Ok(Err(Refusal::NotInstalled(model.id.clone())));
        }
        let mut slot = self.loaded.lock().expect("model lock");
        let loaded = match slot.take() {
            Some(loaded) => loaded,
            None => Loaded {
                whisper: Whisper::load(&self.store.folder(model).join(&model.files[0].name))?,
                used: Instant::now(),
            },
        };
        let loaded = slot.insert(Loaded {
            used: Instant::now(),
            ..loaded
        });
        Ok(Ok(job::transcribe(&mut loaded.whisper, file, request)?))
    }

    fn expire(&self) {
        let mut loaded = self.loaded.lock().expect("model lock");
        if loaded
            .as_ref()
            .is_some_and(|loaded| loaded.used.elapsed() >= WARM_FOR)
        {
            *loaded = None;
            drop(loaded);
            unsafe { libc::malloc_trim(0) };
        }
    }

    fn idle_for(&self) -> Duration {
        let busy = self
            .loaded
            .try_lock()
            .map_or(true, |loaded| loaded.is_some());
        let mut idle_since = self.idle_since.lock().expect("idle lock");
        if busy {
            *idle_since = None;
            return Duration::ZERO;
        }
        idle_since.get_or_insert_with(Instant::now).elapsed()
    }
}

pub async fn serve() -> Result<()> {
    let transcriber = Arc::new(Transcriber {
        processor: Processor::detect(),
        store: Store::for_service("luft-speech")?,
        loaded: Mutex::new(None),
        idle_since: Mutex::new(None),
    });
    let connection = zbus::Connection::session().await?;
    connection
        .object_server()
        .at(PATH, bus::Transcription::new(transcriber.clone()))
        .await?;
    connection.request_name(NAME).await?;
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    let mut tick = tokio::time::interval(CHECK_EVERY);
    loop {
        tokio::select! {
            _ = terminate.recv() => return Ok(()),
            _ = interrupt.recv() => return Ok(()),
            _ = tick.tick() => {
                transcriber.expire();
                if transcriber.idle_for() >= EXIT_WHEN_IDLE_FOR {
                    return Ok(());
                }
            }
        }
    }
}
