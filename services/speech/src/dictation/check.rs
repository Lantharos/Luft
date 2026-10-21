//! Dictates long recordings the way the service does, stretch by stretch, and
//! compares what's typed with what was said: until the end, and until the
//! service would tell a toggled dictation that nobody is speaking anymore.
//! Needs the models, so it only runs when asked:
//!
//! LUFT_SPEECH_MODELS=<folder of models> LUFT_SPEECH_SAMPLES=<folder of .wav
//! and .txt> LUFT_SPEECH_LANGUAGE=de cargo test --release dictate -- --ignored --nocapture

use std::path::PathBuf;
use std::time::{Duration, Instant};

use luft_speech::types::Engine;

use super::worker::quiet_long_enough;
use crate::audio::{RATE, Segmenter, Voice, pcm16_mono};
use crate::engines::check::{said_in_order, words};
use crate::engines::{Pass, Recognizer};
use crate::models::manifest;

const CHUNK: usize = RATE / 50;
const SILENCE_AFTER: usize = 4 * RATE;

struct Dictated {
    typed: Vec<String>,
    typed_when_quiet: Vec<String>,
    quiet_at: Option<Duration>,
    recognizing: Duration,
    segmenting: Duration,
}

fn dictate(recognizer: &mut Recognizer, audio: &[f32], language: &str) -> Dictated {
    let mut segments = Segmenter::new(Voice::new().unwrap());
    let mut typed = Vec::new();
    let mut typed_when_quiet = None;
    let mut quiet_at = None;
    let mut recognizing = Duration::ZERO;
    let mut segmenting = Duration::ZERO;
    let mut recognize = |audio: &[f32]| {
        let started = Instant::now();
        let text = recognizer.recognize(audio, language, Pass::Final).unwrap();
        recognizing += started.elapsed();
        text
    };
    let silence = vec![0.0; SILENCE_AFTER];
    for (index, chunk) in audio.chunks(CHUNK).chain(silence.chunks(CHUNK)).enumerate() {
        let started = Instant::now();
        segments.push(chunk).unwrap();
        segmenting += started.elapsed();
        while let Some(segment) = segments.take_closed() {
            typed.push(recognize(&segment));
        }
        if quiet_at.is_none() && quiet_long_enough(&segments) {
            quiet_at = Some(Duration::from_secs_f64(
                ((index + 1) * CHUNK) as f64 / RATE as f64,
            ));
            let mut then = typed.clone();
            if let Some(open) = segments.open() {
                then.push(recognize(open));
            }
            typed_when_quiet = Some(then);
        }
    }
    for segment in segments.finish() {
        typed.push(recognize(&segment));
    }
    Dictated {
        typed_when_quiet: typed_when_quiet.unwrap_or_else(|| typed.clone()),
        typed,
        quiet_at,
        recognizing,
        segmenting,
    }
}

#[test]
#[ignore = "needs downloaded models and recorded speech"]
fn dictate_long_recordings() {
    let models = PathBuf::from(std::env::var("LUFT_SPEECH_MODELS").expect("LUFT_SPEECH_MODELS"));
    let samples = PathBuf::from(std::env::var("LUFT_SPEECH_SAMPLES").expect("LUFT_SPEECH_SAMPLES"));
    let language = std::env::var("LUFT_SPEECH_LANGUAGE").unwrap_or_else(|_| "en".to_owned());
    let engines = match std::env::var("LUFT_SPEECH_ENGINE").as_deref() {
        Ok("whisper") => vec![Engine::Whisper],
        Ok("parakeet") => vec![Engine::Parakeet],
        _ => vec![Engine::Parakeet, Engine::Whisper],
    };
    let mut recordings: Vec<PathBuf> = std::fs::read_dir(&samples)
        .unwrap()
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| path.extension().is_some_and(|extension| extension == "wav"))
        .collect();
    recordings.sort();
    for engine in engines {
        let model = manifest::for_engine(engine);
        let folder = models.join(&model.id);
        if !folder.exists() {
            continue;
        }
        let mut recognizer = Recognizer::load(engine, &folder, &model.file_names()).unwrap();
        for recording in &recordings {
            let audio = pcm16_mono(&std::fs::read(recording).unwrap()).unwrap();
            let said = words(
                &std::fs::read_to_string(recording.with_extension("txt")).unwrap(),
                &language,
            );
            let dictated = dictate(&mut recognizer, &audio, &language);
            let typed = words(&dictated.typed.join(" "), &language);
            let typed_when_quiet = words(&dictated.typed_when_quiet.join(" "), &language);
            let seconds = audio.len() as f64 / RATE as f64;
            println!(
                "{engine:?} {}: {seconds:.0} s, {} words; typed {:.1}% in {} stretches; quiet at {}, {:.1}% typed by then; recognizing {:.1} s, finding speech {:.0} ms",
                recording.file_stem().unwrap().to_string_lossy(),
                said.len(),
                100.0 * said_in_order(&typed, &said) as f64 / said.len() as f64,
                dictated.typed.len(),
                dictated.quiet_at.map_or("never".to_owned(), |at| format!(
                    "{:.1} s",
                    at.as_secs_f64()
                )),
                100.0 * said_in_order(&typed_when_quiet, &said) as f64 / said.len() as f64,
                dictated.recognizing.as_secs_f64(),
                dictated.segmenting.as_secs_f64() * 1000.0,
            );
        }
    }
}
