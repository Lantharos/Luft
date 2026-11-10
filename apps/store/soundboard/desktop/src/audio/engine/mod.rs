mod default_input;
mod graph;
mod streams;
#[cfg(test)]
mod tests;

use std::ops::Range;
use std::sync::Arc;
use std::thread::JoinHandle;

use pipewire as pw;
use serde::{Deserialize, Serialize};
use specta::Type;

pub use default_input::use_as_default;
pub use streams::Levels;

use super::SoundId;
use super::pcm::Pcm;

pub const SOURCE_NAME: &str = "soundboard";
pub const SOURCE_DESCRIPTION: &str = "Soundboard";

pub struct Play {
    pub sound: SoundId,
    pub pcm: Arc<Pcm>,
    pub range: Range<usize>,
    pub gain: f32,
    pub looping: bool,
    pub stop_others: bool,
    pub preview: bool,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Mix {
    pub microphone: Option<String>,
    pub microphone_level: f32,
    pub microphone_muted: bool,
    pub monitor_level: f32,
    pub monitor_on: bool,
}

impl Default for Mix {
    fn default() -> Self {
        Self {
            microphone: None,
            microphone_level: 1.0,
            microphone_muted: false,
            monitor_level: 0.7,
            monitor_on: true,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Type)]
pub struct Microphone {
    pub name: String,
    pub description: String,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub connected: bool,
    pub listeners: u32,
    pub microphones: Vec<Microphone>,
    pub passing: Option<String>,
    pub default_input: Option<String>,
    pub playing: Vec<SoundId>,
}

enum Command {
    Play(Box<Play>),
    Stop(SoundId),
    StopAll,
    Mix(Mix),
    Quit,
}

pub struct Engine {
    commands: pw::channel::Sender<Command>,
    levels: Arc<Levels>,
    thread: Option<JoinHandle<()>>,
}

impl Engine {
    pub fn start(mix: Mix, report: impl FnMut(&Status) + Send + 'static) -> Self {
        let (commands, receiver) = pw::channel::channel();
        let levels = Arc::new(Levels::new(&mix));
        let shared = levels.clone();
        let thread = std::thread::Builder::new()
            .name("soundboard-audio".into())
            .spawn(move || graph::run(receiver, mix, shared, report))
            .expect("the audio thread starts");
        Self {
            commands,
            levels,
            thread: Some(thread),
        }
    }

    pub fn play(&self, play: Play) {
        let _ = self.commands.send(Command::Play(Box::new(play)));
    }

    pub fn stop(&self, sound: SoundId) {
        let _ = self.commands.send(Command::Stop(sound));
    }

    pub fn stop_all(&self) {
        let _ = self.commands.send(Command::StopAll);
    }

    pub fn set_mix(&self, mix: Mix) {
        let _ = self.commands.send(Command::Mix(mix));
    }

    pub fn meters(&self) -> (f32, f32) {
        self.levels.take_peaks()
    }
}

impl Drop for Engine {
    fn drop(&mut self) {
        let _ = self.commands.send(Command::Quit);
        if let Some(thread) = self.thread.take() {
            let _ = thread.join();
        }
    }
}
