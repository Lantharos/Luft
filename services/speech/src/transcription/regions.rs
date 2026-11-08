use std::ops::Range;

use anyhow::Result;

use crate::audio::{FRAME, Voice};

const STARTS: f32 = 0.5;
const GOES_ON: f32 = 0.35;
const PAUSE: usize = 16;
const SHORTEST: usize = 8;
const AROUND: usize = 6;
const LONGEST: usize = 860;
const CUT_SEARCH: usize = 90;

/// Where someone speaks, as ranges of 32 ms frames: Silero VAD's guess for
/// each frame, with a pause of half a second ending a stretch, stretches
/// shorter than a quarter of a second dropped and a little kept on either
/// side. A stretch running past 27.5 seconds is cut at its quietest moment,
/// since Whisper hears 30 seconds at a time.
pub fn find(audio: &[f32]) -> Result<Vec<Range<usize>>> {
    let mut voice = Voice::new()?;
    let mut speaking = false;
    let mut likely = Vec::with_capacity(audio.len() / FRAME);
    for frame in audio.as_chunks::<FRAME>().0 {
        let chance = voice.hear(frame)?;
        speaking = chance >= if speaking { GOES_ON } else { STARTS };
        likely.push((speaking, loudness(frame)));
    }
    let frames = likely.len();
    let mut regions = Vec::new();
    let mut start = None;
    let mut quiet = 0;
    for (index, (speech, _)) in likely.iter().enumerate() {
        match (*speech, start) {
            (true, None) => start = Some(index),
            (true, Some(_)) => quiet = 0,
            (false, Some(first)) => {
                quiet += 1;
                if quiet >= PAUSE {
                    regions.push(first..index + 1 - quiet);
                    start = None;
                    quiet = 0;
                }
            }
            (false, None) => {}
        }
    }
    if let Some(first) = start {
        regions.push(first..frames - quiet);
    }
    Ok(regions
        .into_iter()
        .filter(|region| region.len() >= SHORTEST)
        .map(|region| region.start.saturating_sub(AROUND)..(region.end + AROUND).min(frames))
        .flat_map(|region| split(region, &likely))
        .collect())
}

fn loudness(frame: &[f32]) -> f32 {
    frame.iter().map(|sample| sample * sample).sum::<f32>()
}

fn split(region: Range<usize>, likely: &[(bool, f32)]) -> Vec<Range<usize>> {
    let mut pieces = Vec::new();
    let mut start = region.start;
    while region.end - start > LONGEST {
        let search = start + LONGEST - CUT_SEARCH..start + LONGEST;
        let cut = search
            .min_by(|a, b| likely[*a].1.total_cmp(&likely[*b].1))
            .unwrap_or(start + LONGEST);
        pieces.push(start..cut);
        start = cut;
    }
    pieces.push(start..region.end);
    pieces
}
