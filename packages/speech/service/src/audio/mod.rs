mod file;
mod level;
mod microphone;
mod pauses;

use std::path::PathBuf;
use std::sync::mpsc::Sender;

use anyhow::Result;

#[cfg(test)]
pub use file::pcm16_mono;
pub use level::Meter;
pub use pauses::Segmenter;

pub const RATE: usize = 16_000;

pub enum Input {
    Audio(Vec<f32>),
    Finish,
    Cancel,
}

/// Audio coming in until this is dropped.
pub struct Capture {
    _source: Box<dyn Send>,
}

impl Capture {
    /// Records from the default microphone, or plays a 16 kHz mono WAV file in
    /// real time and then silence when `LUFT_SPEECH_WAV` names one, for checks
    /// without a microphone.
    pub fn open(input: Sender<Input>, meter: Meter) -> Result<Self> {
        let source: Box<dyn Send> = match std::env::var_os("LUFT_SPEECH_WAV") {
            Some(path) => Box::new(file::File::play(PathBuf::from(path), input, meter)?),
            None => Box::new(microphone::Microphone::open(input, meter)?),
        };
        Ok(Self { _source: source })
    }
}
