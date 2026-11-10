//! Writes notes of transcripts the way Heft asks for them, part by part, and
//! prints them with how long they took. Needs the model, so it only runs when
//! asked:
//!
//! LUFT_LANGUAGE_MODELS=<folder holding the model> LUFT_LANGUAGE_SAMPLES=<folder
//! of .json transcripts, each { "language": "sq", "lines": [{ "at", "text" }] }>
//! cargo test --release notes -- --ignored --nocapture

use std::path::PathBuf;
use std::time::Instant;

use luft_language::types::{HeadingRequest, NotesRequest};

use crate::model::Writer;

const LINES_A_PART: usize = 120;

#[test]
#[ignore = "needs the model and transcripts"]
fn notes_of_transcripts() {
    let models =
        PathBuf::from(std::env::var("LUFT_LANGUAGE_MODELS").expect("LUFT_LANGUAGE_MODELS"));
    let samples =
        PathBuf::from(std::env::var("LUFT_LANGUAGE_SAMPLES").expect("LUFT_LANGUAGE_SAMPLES"));
    let loading = Instant::now();
    let writer = Writer::load(&models).unwrap();
    println!("Loaded in {:.1} s", loading.elapsed().as_secs_f64());
    let mut transcripts: Vec<PathBuf> = std::fs::read_dir(&samples)
        .unwrap()
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            path.extension()
                .is_some_and(|extension| extension == "json")
        })
        .collect();
    transcripts.sort();
    for path in transcripts {
        let transcript: NotesRequest =
            serde_json::from_slice(&std::fs::read(&path).unwrap()).unwrap();
        println!("== {}", path.display());
        let started = Instant::now();
        let mut points = Vec::new();
        for part in transcript.lines.chunks(LINES_A_PART) {
            let part_started = Instant::now();
            let notes = super::notes(
                &writer,
                &NotesRequest {
                    language: transcript.language.clone(),
                    lines: part.to_vec(),
                },
            )
            .unwrap();
            println!(
                "{} lines in {:.1} s:\n{}",
                part.len(),
                part_started.elapsed().as_secs_f64(),
                serde_json::to_string_pretty(&notes).unwrap()
            );
            points.extend(notes.points.into_iter().map(|point| point.text));
        }
        let heading = super::heading(
            &writer,
            &HeadingRequest {
                language: transcript.language.clone(),
                points,
            },
        )
        .unwrap();
        println!(
            "{}\n{}\nAll in {:.1} s",
            heading.title,
            heading.summary,
            started.elapsed().as_secs_f64()
        );
    }
}
