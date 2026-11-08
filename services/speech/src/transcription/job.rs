use std::fs::File;
use std::ops::Range;

use anyhow::Result;
use luft_speech::types::{Said, Transcribed};

use super::languages::{Choice, Spoken};
use super::{opus, regions, resample};
use crate::audio::{FRAME, RATE};
use crate::engines::Whisper;

const WINDOW: u64 = 120_000;
const MARGIN: u64 = 30_000;
const FRAME_MS: u64 = (FRAME * 1000 / RATE) as u64;
const LONGEST_CHUNK: usize = 860;
const LONGEST_GAP: usize = 47;
const TELLS_LANGUAGE: usize = 31;
const SETTLES: usize = 24;

pub struct Request {
    pub from: u64,
    pub ended: bool,
    pub languages: Vec<String>,
}

struct Chunk<'a> {
    frames: Range<usize>,
    language: &'a Spoken,
}

/// Transcribes about two minutes of a recording from `from`, cut where
/// nobody speaks. Speech running into the end of what's recorded so far is
/// left for later, unless the recording has ended.
pub fn transcribe(whisper: &mut Whisper, file: File, request: &Request) -> Result<Transcribed> {
    let stretch = opus::decode(file, request.from, request.from + WINDOW + MARGIN)?;
    let audio = resample::downsample(&stretch.samples);
    let frames = audio.len() / FRAME;
    let complete = stretch.last && request.ended;
    let window = (WINDOW / FRAME_MS) as usize;
    let (ready, waiting): (Vec<_>, Vec<_>) = regions::find(&audio)?
        .into_iter()
        .partition(|region| region.start < window && (complete || region.end + SETTLES <= frames));
    let choice = Choice::new(&request.languages);
    let mut chunks: Vec<Chunk> = Vec::new();
    for region in ready {
        let before = chunks.last().map(|chunk| chunk.language);
        let language = match before {
            Some(before) if region.len() < TELLS_LANGUAGE => before,
            _ => choice.pick(&whisper.languages(&audio[samples(&region)])?, before),
        };
        match chunks.last_mut() {
            Some(chunk)
                if chunk.language == language
                    && region.start - chunk.frames.end <= LONGEST_GAP
                    && region.end - chunk.frames.start <= LONGEST_CHUNK =>
            {
                chunk.frames.end = region.end;
            }
            _ => chunks.push(Chunk {
                frames: region,
                language,
            }),
        }
    }
    let mut said = Vec::new();
    for chunk in &chunks {
        let start = request.from + chunk.frames.start as u64 * FRAME_MS;
        let end = request.from + chunk.frames.end as u64 * FRAME_MS;
        for heard in whisper.timed(&audio[samples(&chunk.frames)], &chunk.language.code)? {
            said.push(Said {
                start: (start + heard.start as u64 * 10).min(end),
                end: (start + heard.end as u64 * 10).min(end),
                language: chunk.language.code.clone(),
                text: chunk.language.write(&heard.text),
            });
        }
    }
    let processed = chunks.last().map_or(0, |chunk| chunk.frames.end);
    let next_frame = match waiting.first() {
        Some(region) => region.start,
        None if complete => frames,
        None => processed.max(frames.saturating_sub(SETTLES)),
    };
    Ok(Transcribed {
        said,
        next: request.from + next_frame as u64 * FRAME_MS,
        done: complete && waiting.is_empty(),
    })
}

fn samples(frames: &Range<usize>) -> Range<usize> {
    frames.start * FRAME..frames.end * FRAME
}
