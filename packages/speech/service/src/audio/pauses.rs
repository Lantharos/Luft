use std::collections::VecDeque;

use super::RATE;

const FRAME: usize = RATE / 50;
const PAUSE_FRAMES: usize = 30;
const LONGEST_FRAMES: usize = 25 * 50;
const CUT_SEARCH_FRAMES: usize = 3 * 50;
const QUIETEST_SPEECH: f32 = 0.004;
const SPEECH_OVER_NOISE: f32 = 3.0;
const NOISE_RISE: f32 = 1.01;
const FIRST_NOISE: f32 = 0.003;
const KEPT_AROUND_SPEECH: usize = 15;
const SHORTEST_SPEECH: usize = 8;

/// Splits what's heard into stretches of speech at the pauses between them, so
/// each stretch is recognized once and only the one still being spoken is
/// recognized again as it grows. Stretches without speech are dropped, and the
/// silence around speech is trimmed, which Whisper would otherwise fill with
/// words nobody said.
pub struct Segmenter {
    audio: Vec<f32>,
    loudness: Vec<f32>,
    speech: Vec<bool>,
    noise: f32,
    heard: bool,
    quiet: usize,
    closed: VecDeque<Vec<f32>>,
}

impl Default for Segmenter {
    fn default() -> Self {
        Self {
            audio: Vec::new(),
            loudness: Vec::new(),
            speech: Vec::new(),
            noise: FIRST_NOISE,
            heard: false,
            quiet: 0,
            closed: VecDeque::new(),
        }
    }
}

impl Segmenter {
    pub fn push(&mut self, samples: &[f32]) {
        self.audio.extend_from_slice(samples);
        while (self.loudness.len() + 1) * FRAME <= self.audio.len() {
            let start = self.loudness.len() * FRAME;
            let frame = &self.audio[start..start + FRAME];
            let loudness =
                (frame.iter().map(|sample| sample * sample).sum::<f32>() / FRAME as f32).sqrt();
            self.listen(loudness);
        }
    }

    fn listen(&mut self, loudness: f32) {
        self.noise = loudness.min(self.noise * NOISE_RISE);
        self.loudness.push(loudness);
        let speech = loudness > QUIETEST_SPEECH.max(self.noise * SPEECH_OVER_NOISE);
        self.speech.push(speech);
        if speech {
            self.heard = true;
            self.quiet = 0;
        } else {
            self.quiet += 1;
        }
        if self.heard && self.quiet >= PAUSE_FRAMES {
            self.close(self.loudness.len() - self.quiet / 2);
        } else if self.loudness.len() >= LONGEST_FRAMES {
            self.close(self.quietest_recent_frame());
        }
    }

    fn quietest_recent_frame(&self) -> usize {
        let start = self.loudness.len() - CUT_SEARCH_FRAMES;
        (start..self.loudness.len())
            .min_by(|a, b| self.loudness[*a].total_cmp(&self.loudness[*b]))
            .unwrap_or(self.loudness.len())
    }

    fn close(&mut self, frames: usize) {
        let speech: Vec<bool> = self.speech.drain(..frames).collect();
        let segment: Vec<f32> = self.audio.drain(..frames * FRAME).collect();
        self.loudness.drain(..frames);
        self.closed.extend(trim(&segment, &speech));
        self.heard = self.speech.contains(&true);
        self.quiet = self
            .speech
            .iter()
            .rev()
            .take_while(|speech| !**speech)
            .count();
    }

    pub fn take_closed(&mut self) -> Option<Vec<f32>> {
        self.closed.pop_front()
    }

    /// The stretch still being spoken, if any speech has been heard in it.
    pub fn open(&self) -> Option<&[f32]> {
        let first = self.speech.iter().position(|speech| *speech)?;
        Some(&self.audio[first.saturating_sub(KEPT_AROUND_SPEECH) * FRAME..])
    }

    pub fn finish(mut self) -> Vec<Vec<f32>> {
        self.closed.extend(trim(&self.audio, &self.speech));
        self.closed.into()
    }
}

fn trim(audio: &[f32], speech: &[bool]) -> Option<Vec<f32>> {
    if speech.iter().filter(|speech| **speech).count() < SHORTEST_SPEECH {
        return None;
    }
    let first = speech.iter().position(|speech| *speech)?;
    let last = speech.iter().rposition(|speech| *speech)?;
    let start = first.saturating_sub(KEPT_AROUND_SPEECH) * FRAME;
    let end = ((last + 1 + KEPT_AROUND_SPEECH) * FRAME).min(audio.len());
    Some(audio[start..end].to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn speech(seconds: f32) -> Vec<f32> {
        (0..(seconds * RATE as f32) as usize)
            .map(|index| {
                let time = index as f32 / RATE as f32;
                let syllables = 0.55 + 0.45 * (std::f32::consts::TAU * 4.0 * time).sin();
                0.2 * syllables * (index as f32 * 0.07).sin()
            })
            .collect()
    }

    fn silence(seconds: f32) -> Vec<f32> {
        vec![0.0; (seconds * RATE as f32) as usize]
    }

    fn feed(parts: &[Vec<f32>]) -> Segmenter {
        let mut segmenter = Segmenter::default();
        for part in parts {
            for chunk in part.chunks(RATE / 100) {
                segmenter.push(chunk);
            }
        }
        segmenter
    }

    #[test]
    fn a_pause_closes_a_stretch_of_speech() {
        let mut segmenter = feed(&[silence(0.3), speech(1.0), silence(1.0), speech(0.5)]);
        let first = segmenter
            .take_closed()
            .expect("the pause closes the first stretch");
        assert!(first.len() > RATE && first.len() < 2 * RATE);
        assert!(segmenter.take_closed().is_none());
        assert!(segmenter.open().is_some());
        assert_eq!(segmenter.finish().len(), 1);
    }

    #[test]
    fn short_gaps_inside_speech_stay_together() {
        let mut segmenter = feed(&[speech(1.0), silence(0.2), speech(1.0)]);
        assert!(segmenter.take_closed().is_none());
        assert_eq!(segmenter.finish().len(), 1);
    }

    #[test]
    fn silence_alone_is_never_recognized() {
        let mut segmenter = feed(&[silence(3.0)]);
        assert!(segmenter.take_closed().is_none());
        assert!(segmenter.open().is_none());
        assert!(segmenter.finish().is_empty());
    }

    #[test]
    fn speech_without_pauses_is_cut_before_it_grows_too_long() {
        let mut segmenter = feed(&[speech(30.0)]);
        let first = segmenter.take_closed().expect("a long stretch is cut");
        assert!(first.len() <= LONGEST_FRAMES * FRAME);
        assert!(first.len() >= (LONGEST_FRAMES - CUT_SEARCH_FRAMES) * FRAME);
    }

    #[test]
    fn a_click_is_not_speech() {
        assert!(
            feed(&[silence(1.0), speech(0.06), silence(1.0)])
                .finish()
                .is_empty()
        );
    }

    #[test]
    fn silence_around_speech_is_trimmed() {
        let segments = feed(&[silence(2.0), speech(1.0), silence(0.4)]).finish();
        let kept = segments[0].len() as f32 / RATE as f32;
        assert!(
            kept > 1.0 && kept < 1.0 + 2.0 * KEPT_AROUND_SPEECH as f32 / 50.0 + 0.05,
            "{kept}"
        );
    }

    #[test]
    fn steady_background_noise_is_not_speech() {
        let hum: Vec<f32> = (0..3 * RATE)
            .map(|index| 0.01 * (index as f32 * 0.3).sin())
            .collect();
        let mut segmenter = feed(std::slice::from_ref(&hum));
        segmenter.push(&speech(0.1));
        assert!(segmenter.open().is_some());
        let mut quiet = feed(&[hum]);
        assert!(quiet.take_closed().is_none());
    }
}
