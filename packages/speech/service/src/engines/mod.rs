#[cfg(test)]
mod check;
mod parakeet;
mod processor;
mod whisper;

use std::path::Path;

use anyhow::Result;
use luft_speech::types::Engine;

pub use parakeet::Parakeet;
pub use processor::Processor;
pub use whisper::Whisper;

/// Whether a recognition is a quick look at speech still going on, or the text
/// that's typed in the end.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Pass {
    Partial,
    Final,
}

pub enum Recognizer {
    Parakeet(Parakeet),
    Whisper(Whisper),
}

impl Recognizer {
    pub fn load(engine: Engine, folder: &Path, files: &[String]) -> Result<Self> {
        Ok(match engine {
            Engine::Parakeet => Recognizer::Parakeet(Parakeet::load(folder)?),
            Engine::Whisper => Recognizer::Whisper(Whisper::load(&folder.join(&files[0]))?),
        })
    }

    pub fn recognize(&mut self, audio: &[f32], language: &str, pass: Pass) -> Result<String> {
        match self {
            Recognizer::Parakeet(parakeet) => parakeet.recognize(audio),
            Recognizer::Whisper(whisper) => whisper.recognize(audio, language, pass),
        }
    }
}

pub fn threads() -> usize {
    std::thread::available_parallelism().map_or(2, |count| (count.get() / 2).clamp(1, 4))
}
