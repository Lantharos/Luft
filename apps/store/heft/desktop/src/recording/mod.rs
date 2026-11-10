mod microphone;
mod opus;

use std::fs::File;
use std::path::Path;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread::JoinHandle;
use std::time::{Duration, Instant};

use luft_app::{Commands, Empty};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::library;
use microphone::Microphone;
use opus::OpusFile;

pub const RECORDING_LEVEL: BridgeEvent<f32> = BridgeEvent::new("recording.level");
pub const RECORDING_FAILED: BridgeEvent<String> = BridgeEvent::new("recording.failed");
const LEVEL_EVERY: Duration = Duration::from_millis(100);

struct Recording {
    path: String,
    samples: Sender<Vec<f32>>,
    microphone: Option<Microphone>,
    length: Arc<AtomicU64>,
    encoder: JoinHandle<Result<u64, String>>,
}

static RECORDING: Mutex<Option<Recording>> = Mutex::new(None);

#[derive(Deserialize, Type)]
pub struct Start {
    path: String,
}

#[derive(Serialize, Type)]
pub struct RecordingState {
    path: String,
    length: u64,
    paused: bool,
}

pub fn active() -> bool {
    RECORDING.lock().expect("recording lock").is_some()
}

fn sync_folder(path: &Path) -> Result<(), String> {
    match path.parent() {
        Some(folder) => File::open(folder)
            .and_then(|folder| folder.sync_all())
            .map_err(|error| error.to_string()),
        None => Ok(()),
    }
}

fn encode(
    mut file: OpusFile,
    samples: Receiver<Vec<f32>>,
    length: Arc<AtomicU64>,
) -> Result<u64, String> {
    let mut loudest = 0.0f32;
    let mut told = Instant::now();
    while let Ok(audio) = samples.recv() {
        loudest = audio
            .iter()
            .fold(loudest, |loudest, sample| loudest.max(sample.abs()));
        if let Err(error) = file.write(&audio) {
            crate::EVENTS.emit(RECORDING_FAILED, error.clone());
            return Err(error);
        }
        length.store(file.length(), Ordering::Relaxed);
        if told.elapsed() >= LEVEL_EVERY {
            crate::EVENTS.emit(RECORDING_LEVEL, loudest.min(1.0));
            loudest = 0.0;
            told = Instant::now();
        }
    }
    file.finish()
}

fn start(Start { path }: Start) -> Result<(), String> {
    let mut slot = RECORDING.lock().expect("recording lock");
    if slot.is_some() {
        return Err("Heft is already recording".into());
    }
    let (samples, received) = mpsc::channel();
    let microphone = Microphone::open(samples.clone())?;
    let file = OpusFile::create(&library::resolve(&path)?)?;
    let length = Arc::new(AtomicU64::new(0));
    let written = length.clone();
    let encoder = std::thread::Builder::new()
        .name("recording".into())
        .spawn(move || encode(file, received, written))
        .map_err(|error| error.to_string())?;
    *slot = Some(Recording {
        path,
        samples,
        microphone: Some(microphone),
        length,
        encoder,
    });
    Ok(())
}

fn state(Empty {}: Empty) -> Result<Option<RecordingState>, String> {
    Ok(RECORDING
        .lock()
        .expect("recording lock")
        .as_ref()
        .map(|recording| RecordingState {
            path: recording.path.clone(),
            length: recording.length.load(Ordering::Relaxed),
            paused: recording.microphone.is_none(),
        }))
}

fn pause(Empty {}: Empty) -> Result<u64, String> {
    let mut slot = RECORDING.lock().expect("recording lock");
    let recording = slot.as_mut().ok_or("Heft isn't recording")?;
    recording.microphone = None;
    Ok(recording.length.load(Ordering::Relaxed))
}

fn resume(Empty {}: Empty) -> Result<u64, String> {
    let mut slot = RECORDING.lock().expect("recording lock");
    let recording = slot.as_mut().ok_or("Heft isn't recording")?;
    if recording.microphone.is_none() {
        recording.microphone = Some(Microphone::open(recording.samples.clone())?);
    }
    Ok(recording.length.load(Ordering::Relaxed))
}

fn stop(Empty {}: Empty) -> Result<u64, String> {
    let recording = RECORDING
        .lock()
        .expect("recording lock")
        .take()
        .ok_or("Heft isn't recording")?;
    drop(recording.microphone);
    drop(recording.samples);
    recording
        .encoder
        .join()
        .map_err(|_| "The recording stopped".to_string())?
}

#[derive(Deserialize, Type)]
pub struct Recorded {
    path: String,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&RECORDING_LEVEL)
        .bridge_event(&RECORDING_FAILED)
        .command("recording_start", start)
        .command("recording_state", state)
        .command("recording_pause", pause)
        .command("recording_resume", resume)
        .command("recording_stop", stop)
        .command("recording_length", |Recorded { path }| {
            opus::length(&library::resolve(&path)?)
        })
}
