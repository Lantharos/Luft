use std::path::Path;

use anyhow::{Result, anyhow};
use luft_whisper::{Listen, Whisper as Model};

use super::Pass;

pub struct Whisper {
    model: Model,
}

impl Whisper {
    pub fn load(path: &Path) -> Result<Self> {
        let model = Model::load(path).map_err(|error| anyhow!("Couldn't load Whisper: {error}"))?;
        Ok(Self { model })
    }

    pub fn recognize(&mut self, audio: &[f32], language: &str, pass: Pass) -> Result<String> {
        let listen = Listen {
            language,
            threads: super::threads(),
            timed: false,
            retry: pass != Pass::Partial,
        };
        let text: String = self
            .model
            .listen(audio, &listen)
            .map_err(|error| anyhow!("Whisper couldn't listen: {error}"))?
            .into_iter()
            .map(|segment| segment.text)
            .collect();
        Ok(text.trim().to_owned())
    }

    pub fn languages(&mut self, audio: &[f32]) -> Result<Vec<f32>> {
        self.model
            .languages(audio, super::threads())
            .map_err(|error| anyhow!("Whisper couldn't tell the language: {error}"))
    }

    pub fn timed(&mut self, audio: &[f32], language: &str) -> Result<Vec<Heard>> {
        let listen = Listen {
            language,
            threads: super::threads(),
            timed: true,
            retry: true,
        };
        Ok(self
            .model
            .listen(audio, &listen)
            .map_err(|error| anyhow!("Whisper couldn't listen: {error}"))?
            .into_iter()
            .filter(|segment| segment.not_speech < NOT_SPEECH)
            .map(|segment| Heard {
                start: segment.start,
                end: segment.end,
                text: segment.text.trim().to_owned(),
            })
            .filter(|heard| !heard.text.is_empty())
            .collect())
    }
}

const NOT_SPEECH: f32 = 0.6;

pub struct Heard {
    pub start: i64,
    pub end: i64,
    pub text: String,
}
