use std::fs::File;
use std::sync::Arc;

use anyhow::Context;
use luft_dbus_macros::introspect;
use zbus::OwnedFd;
use zbus::interface;

use super::job::Request;
use super::{Refusal, Transcriber};

luft_dbus::errors!("com.lantharos.Transcription1.Error" {
    NotInstalled,
    Unsupported,
    Paused,
});

pub struct Transcription {
    transcriber: Arc<Transcriber>,
}

impl Transcription {
    pub fn new(transcriber: Arc<Transcriber>) -> Self {
        Self { transcriber }
    }
}

#[introspect]
#[interface(name = "com.lantharos.Transcription1")]
impl Transcription {
    async fn transcribe(
        &self,
        audio: OwnedFd,
        from: u64,
        ended: bool,
        languages: Vec<String>,
    ) -> Result<String, Error> {
        if luft_dbus::power::saving_battery().await {
            return Err(Error::Paused("The battery is low.".into()));
        }
        let transcriber = self.transcriber.clone();
        let file = File::from(std::os::fd::OwnedFd::from(audio));
        let request = Request {
            from,
            ended,
            languages,
        };
        let progress = tokio::task::spawn_blocking(move || transcriber.transcribe(file, &request))
            .await
            .context("Transcribing stopped unexpectedly.")??
            .map_err(|refusal| match refusal {
                Refusal::NotInstalled(model) => Error::NotInstalled(model),
                Refusal::Unsupported => Error::Unsupported(
                    "This computer's processor can't transcribe recordings.".into(),
                ),
            })?;
        Ok(serde_json::to_string(&progress).expect("progress always serializes"))
    }
}
