//! Recognizes recorded speech with every downloaded engine and compares it
//! with what was said. Needs the models, so it only runs when asked:
//!
//! LUFT_SPEECH_MODELS=<folder of models> LUFT_SPEECH_SAMPLES=<folder of .wav
//! and .txt> LUFT_SPEECH_LANGUAGE=sr cargo test --release -- --ignored --nocapture

use std::path::PathBuf;
use std::time::Instant;

use luft_speech::types::Engine;

use super::{Pass, Recognizer};
use crate::audio::{RATE, pcm16_mono};
use crate::language::script::{self, Script};
use crate::models::manifest;

fn words(text: &str, language: &str) -> Vec<String> {
    script::write(&text.to_lowercase(), language, Script::Latin)
        .split(|character: char| !character.is_alphanumeric() && character != '\'')
        .filter(|word| !word.is_empty())
        .map(str::to_owned)
        .collect()
}

fn word_errors(heard: &[String], said: &[String]) -> usize {
    let mut previous: Vec<usize> = (0..=said.len()).collect();
    for (row, heard_word) in heard.iter().enumerate() {
        let mut current = vec![row + 1; said.len() + 1];
        for (column, said_word) in said.iter().enumerate() {
            let substitution = previous[column] + usize::from(heard_word != said_word);
            current[column + 1] = substitution
                .min(previous[column + 1] + 1)
                .min(current[column] + 1);
        }
        previous = current;
    }
    previous[said.len()]
}

#[test]
fn errors_count_words_added_dropped_and_changed() {
    let said = words("the cat sat on the mat", "en");
    assert_eq!(
        word_errors(&words("the cat sat on the mat", "en"), &said),
        0
    );
    assert_eq!(word_errors(&words("a cat sat on mat", "en"), &said), 2);
}

#[test]
#[ignore = "needs downloaded models and recorded speech"]
fn recognize_recorded_speech() {
    let models = PathBuf::from(std::env::var("LUFT_SPEECH_MODELS").expect("LUFT_SPEECH_MODELS"));
    let samples = PathBuf::from(std::env::var("LUFT_SPEECH_SAMPLES").expect("LUFT_SPEECH_SAMPLES"));
    let language = std::env::var("LUFT_SPEECH_LANGUAGE").unwrap_or_else(|_| "en".to_owned());
    let mut recordings: Vec<PathBuf> = std::fs::read_dir(&samples)
        .unwrap()
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| path.extension().is_some_and(|extension| extension == "wav"))
        .collect();
    recordings.sort();
    for engine in [Engine::Parakeet, Engine::Whisper] {
        let model = manifest::for_engine(engine);
        let folder = models.join(&model.id);
        if !folder.exists() {
            continue;
        }
        let loading = Instant::now();
        let mut recognizer = Recognizer::load(engine, &folder, &model.file_names()).unwrap();
        println!(
            "{engine:?} loaded in {:.2} s",
            loading.elapsed().as_secs_f64()
        );
        let (mut errors, mut total_words, mut audio_seconds, mut compute_seconds) =
            (0, 0, 0.0, 0.0);
        for recording in &recordings {
            let audio = pcm16_mono(&std::fs::read(recording).unwrap()).unwrap();
            let said = std::fs::read_to_string(recording.with_extension("txt")).unwrap_or_default();
            let started = Instant::now();
            let heard = recognizer
                .recognize(&audio, &language, Pass::Final)
                .unwrap();
            let took = started.elapsed().as_secs_f64();
            let said_words = words(&said, &language);
            let wrong = word_errors(&words(&heard, &language), &said_words);
            errors += wrong;
            total_words += said_words.len();
            audio_seconds += audio.len() as f64 / RATE as f64;
            compute_seconds += took;
            println!(
                "{engine:?} {took:.2} s, {wrong}/{} wrong: {heard}",
                said_words.len()
            );
        }
        println!(
            "{engine:?}: {:.1}% of words wrong, {compute_seconds:.1} s to recognize {audio_seconds:.1} s",
            100.0 * errors as f64 / total_words.max(1) as f64
        );
    }
}
