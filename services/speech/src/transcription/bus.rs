use std::fs::File;
use std::sync::Arc;

use luft_dbus_macros::introspect;
use zbus::interface;
use zbus::OwnedFd;

use super::job::Request;
use super::{Refusal, Transcriber};

#[derive(Debug, zbus::DBusError)]
#[zbus(prefix = "com.lantharos.Transcription1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotInstalled(String),
    Unsupported(String),
    Paused(String),
    Failed(String),
}

impl From<anyhow::Error> for Error {
    fn from(error: anyhow::Error) -> Self {
        Error::Failed(format!("{error:#}"))
    }
}

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
        if let Ok(system) = luft_dbus::system().await
            && luft_dbus::power::battery_low(system).await
        {
            return Err(Error::Paused("The battery is low".into()));
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
            .map_err(|error| Error::Failed(error.to_string()))??
            .map_err(|refusal| match refusal {
                Refusal::NotInstalled(model) => Error::NotInstalled(model),
                Refusal::Unsupported => {
                    Error::Unsupported("This computer's processor can't run Whisper".into())
                }
            })?;
        Ok(serde_json::to_string(&progress).expect("progress always serializes"))
    }
}
