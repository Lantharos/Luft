pub mod decode;
pub mod engine;
pub mod mixer;
pub mod pcm;

pub const RATE: u32 = 48_000;
pub const CHANNELS: usize = 2;

pub type SoundId = u32;
