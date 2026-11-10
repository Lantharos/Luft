mod level;
mod microphone;
mod pauses;
#[cfg(feature = "recorded-audio")]
mod recorded;
mod voice;
#[cfg(any(test, feature = "recorded-audio"))]
mod wav;

use std::sync::mpsc::Sender;

use anyhow::Result;

pub use level::Meter;
pub use pauses::Segmenter;
pub use voice::{FRAME, Voice};
#[cfg(test)]
pub use wav::pcm16_mono;

pub const RATE: usize = 16_000;

pub enum Input {
    Audio(Vec<f32>),
    Finish,
    Cancel,
}

pub struct Capture {
    _open_until_dropped: Box<dyn Send>,
}

impl Capture {
    #[cfg(not(feature = "recorded-audio"))]
    pub fn open(input: Sender<Input>, meter: Meter) -> Result<Self> {
        Ok(Self {
            _open_until_dropped: Box::new(microphone::Microphone::open(input, meter)?),
        })
    }

    #[cfg(feature = "recorded-audio")]
    pub fn open(input: Sender<Input>, meter: Meter) -> Result<Self> {
        let source: Box<dyn Send> = match std::env::var_os("LUFT_SPEECH_WAV") {
            Some(path) => Box::new(recorded::Recording::play(path.into(), input, meter)?),
            None => Box::new(microphone::Microphone::open(input, meter)?),
        };
        Ok(Self {
            _open_until_dropped: source,
        })
    }
}
