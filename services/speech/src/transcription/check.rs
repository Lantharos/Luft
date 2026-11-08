//! Transcribes recordings of mixed-language speech the way the service does
//! and compares them with what was said. Needs the Whisper model, so it only
//! runs when asked:
//!
//! LUFT_SPEECH_MODELS=<folder of models> LUFT_TRANSCRIPTION_SAMPLES=<folder of
//! .opus recordings, each with a .json list of what was said when>
//! cargo test --release transcribe -- --ignored --nocapture
//!
//! `LUFT_TRANSCRIPTION_LANGUAGES` lists the languages to choose from, by
//! default Serbian in Latin, German, English and Albanian.

use std::collections::BTreeMap;
use std::fs::File;
use std::path::PathBuf;
use std::time::Instant;

use luft_speech::types::Engine;
use serde::Deserialize;

use luft_speech::types::Said as Segment;

use super::job::{self, Request};
use crate::engines::Whisper;
use crate::engines::check::{word_errors, words};
use crate::models::manifest;

#[derive(Deserialize)]
struct Said {
    start: u64,
    end: u64,
    language: String,
    text: String,
}

#[derive(Default)]
struct Tally {
    words: usize,
    wrong: usize,
    language_right: usize,
}

fn overlap(segment: &Segment, said: &Said) -> u64 {
    segment.end.min(said.end).saturating_sub(segment.start.max(said.start))
}

#[test]
#[ignore = "needs the Whisper model and recordings"]
fn transcribe_recordings() {
    let models = PathBuf::from(std::env::var("LUFT_SPEECH_MODELS").expect("LUFT_SPEECH_MODELS"));
    let samples = PathBuf::from(
        std::env::var("LUFT_TRANSCRIPTION_SAMPLES").expect("LUFT_TRANSCRIPTION_SAMPLES"),
    );
    let languages: Vec<String> = std::env::var("LUFT_TRANSCRIPTION_LANGUAGES")
        .unwrap_or_else(|_| "sr-Latn,de,en,sq".into())
        .split(',')
        .map(str::to_owned)
        .collect();
    let model = manifest::for_engine(Engine::Whisper);
    let loading = Instant::now();
    let mut whisper = Whisper::load(&models.join(&model.id).join(&model.files[0].name)).unwrap();
    println!("Loaded in {:.1} s", loading.elapsed().as_secs_f64());
    let mut recordings: Vec<PathBuf> = std::fs::read_dir(&samples)
        .unwrap()
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| path.extension().is_some_and(|extension| extension == "opus"))
        .collect();
    recordings.sort();
    for recording in recordings {
        let said: Vec<Said> =
            serde_json::from_slice(&std::fs::read(recording.with_extension("json")).unwrap())
                .unwrap();
        let started = Instant::now();
        let mut heard = Vec::new();
        let mut request = Request {
            from: 0,
            ended: true,
            languages: languages.clone(),
        };
        loop {
            let progress =
                job::transcribe(&mut whisper, File::open(&recording).unwrap(), &request).unwrap();
            heard.extend(progress.said);
            if progress.done {
                break;
            }
            request.from = progress.next;
        }
        let took = started.elapsed().as_secs_f64();
        let length = said.last().map_or(0, |said| said.end) as f64 / 1000.0;
        let mut tallies: BTreeMap<String, Tally> = BTreeMap::new();
        for (index, utterance) in said.iter().enumerate() {
            let matched: Vec<&Segment> = heard
                .iter()
                .filter(|segment| {
                    let best = said
                        .iter()
                        .enumerate()
                        .max_by_key(|(_, candidate)| overlap(segment, candidate))
                        .map(|(best, _)| best);
                    best == Some(index) && overlap(segment, utterance) > 0
                })
                .collect();
            let text: Vec<&str> = matched.iter().map(|segment| segment.text.as_str()).collect();
            let expected = words(&utterance.text, &utterance.language);
            let got = words(&text.join(" "), &utterance.language);
            let wrong = word_errors(&got, &expected);
            let right_language = matched
                .iter()
                .any(|segment| segment.language == utterance.language);
            let tally = tallies.entry(utterance.language.clone()).or_default();
            tally.words += expected.len();
            tally.wrong += wrong;
            tally.language_right += usize::from(right_language);
            println!(
                "{} {:>6.1} s {wrong}/{} {}: {}",
                utterance.language,
                utterance.start as f64 / 1000.0,
                expected.len(),
                matched.first().map_or("--", |segment| segment.language.as_str()),
                text.join(" ")
            );
        }
        println!(
            "{}: {length:.0} s of recording in {took:.1} s ({:.1}x as fast as it was said)",
            recording.display(),
            length / took
        );
        for (language, tally) in tallies {
            let utterances = said.iter().filter(|said| said.language == language).count();
            println!(
                "  {language}: {:.1}% of words wrong, language right for {}/{utterances}",
                100.0 * tally.wrong as f64 / tally.words.max(1) as f64,
                tally.language_right
            );
        }
    }
}
