mod bus;
mod job;
mod languages;
#[cfg(feature = "measure")]
pub mod measure;
mod opus;
mod regions;
mod resample;

use std::sync::Arc;
use std::time::Duration;

use anyhow::Result;
use luft_models::{Store, Warm};
use luft_speech::types::Engine;

use crate::engines::{Processor, Whisper};
use crate::models::manifest;

pub const NAME: &str = "com.lantharos.Transcription1";
pub const PATH: &str = "/com/lantharos/Transcription1";
const WARM_FOR: Duration = Duration::from_secs(180);

pub struct Transcriber {
    processor: Processor,
    store: Store,
    whisper: Warm<Whisper>,
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
        self.whisper
            .with(
                || Whisper::load(&self.store.folder(model).join(&model.files[0].name)),
                |whisper| job::transcribe(whisper, file, request),
            )
            .map(Ok)
    }

    fn busy(&self) -> bool {
        if self.whisper.expire(WARM_FOR) {
            unsafe { libc::malloc_trim(0) };
        }
        self.whisper.loaded()
    }
}

pub async fn serve() -> Result<()> {
    let transcriber = Arc::new(Transcriber {
        processor: Processor::detect(),
        store: Store::for_service("luft-speech")?,
        whisper: Warm::default(),
    });
    let connection = zbus::Connection::session().await?;
    connection
        .object_server()
        .at(PATH, bus::Transcription::new(transcriber.clone()))
        .await?;
    connection.request_name(NAME).await?;
    Ok(luft_dbus::idle::until_idle(|| transcriber.busy()).await?)
}
