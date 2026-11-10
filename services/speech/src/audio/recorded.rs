use std::path::PathBuf;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::Sender;
use std::thread::JoinHandle;
use std::time::Duration;

use anyhow::{Context, Result};

use super::wav::pcm16_mono;
use super::{Input, Meter, RATE};

const CHUNK: usize = RATE / 50;

pub struct Recording {
    stop: Arc<AtomicBool>,
    thread: Option<JoinHandle<()>>,
}

impl Recording {
    pub fn play(path: PathBuf, input: Sender<Input>, mut meter: Meter) -> Result<Self> {
        let bytes =
            std::fs::read(&path).with_context(|| format!("Couldn't read {}", path.display()))?;
        let samples = pcm16_mono(&bytes)?;
        let stop = Arc::new(AtomicBool::new(false));
        let stopped = stop.clone();
        let thread = std::thread::spawn(move || {
            let silence = [0.0; CHUNK];
            let chunks = samples
                .chunks(CHUNK)
                .chain(std::iter::repeat(silence.as_slice()));
            for chunk in chunks {
                if stopped.load(Ordering::Relaxed) {
                    return;
                }
                meter.measure(chunk);
                if input.send(Input::Audio(chunk.to_vec())).is_err() {
                    return;
                }
                std::thread::sleep(Duration::from_millis(20));
            }
        });
        Ok(Self {
            stop,
            thread: Some(thread),
        })
    }
}

impl Drop for Recording {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::Relaxed);
        if let Some(thread) = self.thread.take() {
            let _ = thread.join();
        }
    }
}
