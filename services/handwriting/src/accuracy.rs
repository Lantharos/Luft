use std::collections::BTreeMap;
use std::path::PathBuf;
use std::time::Instant;

use luft_handwriting::types::Stroke;

use crate::ink;
use crate::recognizer::Recognizer;

fn edits<T: PartialEq>(expected: &[T], read: &[T]) -> usize {
    let mut row: Vec<usize> = (0..=read.len()).collect();
    for (i, wanted) in expected.iter().enumerate() {
        let mut diagonal = row[0];
        row[0] = i + 1;
        for (j, got) in read.iter().enumerate() {
            let above = row[j + 1];
            row[j + 1] = (above + 1)
                .min(row[j] + 1)
                .min(diagonal + usize::from(wanted != got));
            diagonal = above;
        }
    }
    row[read.len()]
}

fn words(text: &str) -> Vec<String> {
    text.split_whitespace().map(str::to_owned).collect()
}

#[derive(Default)]
struct Tally {
    lines: usize,
    characters: usize,
    character_errors: usize,
    words: usize,
    word_errors: usize,
    milliseconds: Vec<f64>,
}

/// With `LUFT_HANDWRITING_MODELS` pointing at a downloaded model's folder and
/// `LUFT_HANDWRITING_SAMPLES` at a folder of lines, each a `.json` list of
/// strokes next to a `.txt` of what it says, reads every line the way the
/// service does and reports the error rates for each group of samples, named
/// by what comes before the first `-` of their file names.
#[test]
#[ignore]
fn accuracy() {
    let models =
        PathBuf::from(std::env::var("LUFT_HANDWRITING_MODELS").expect("LUFT_HANDWRITING_MODELS"));
    let samples =
        PathBuf::from(std::env::var("LUFT_HANDWRITING_SAMPLES").expect("LUFT_HANDWRITING_SAMPLES"));
    let mut recognizer = Recognizer::load(&models).unwrap();
    let mut tallies: BTreeMap<String, Tally> = BTreeMap::new();
    let mut files: Vec<_> = std::fs::read_dir(&samples)
        .unwrap()
        .flatten()
        .map(|entry| entry.path())
        .collect();
    files.sort();
    for path in files
        .into_iter()
        .filter(|path| path.extension().is_some_and(|ext| ext == "json"))
    {
        let strokes: Vec<Stroke> =
            serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
        let expected = std::fs::read_to_string(path.with_extension("txt"))
            .unwrap()
            .trim()
            .to_owned();
        let started = Instant::now();
        let read = recognizer.read(&ink::draw(&strokes).unwrap()).unwrap();
        let took = started.elapsed().as_secs_f64() * 1000.0;
        let name = path.file_stem().unwrap().to_string_lossy().into_owned();
        println!("{name}\t{took:.1} ms\t{expected}\t{read}");
        let group = name.split('-').next().unwrap().to_owned();
        let tally = tallies.entry(group).or_default();
        let (wanted, got): (Vec<char>, Vec<char>) =
            (expected.chars().collect(), read.chars().collect());
        tally.lines += 1;
        tally.characters += wanted.len();
        tally.character_errors += edits(&wanted, &got);
        tally.words += words(&expected).len();
        tally.word_errors += edits(&words(&expected), &words(&read));
        tally.milliseconds.push(took);
    }
    for (group, mut tally) in tallies {
        tally.milliseconds.sort_by(f64::total_cmp);
        println!(
            "{group}: {} lines, character error rate {:.1}%, word error rate {:.1}%, median {:.1} ms",
            tally.lines,
            100.0 * tally.character_errors as f64 / tally.characters as f64,
            100.0 * tally.word_errors as f64 / tally.words as f64,
            tally.milliseconds[tally.milliseconds.len() / 2],
        );
    }
}
