use super::*;
use crate::audio::pcm16_mono;

const SPOKEN: f32 = 0.9;
const SILENT: f32 = 0.02;

fn segmenter() -> Segmenter {
    Segmenter::new(Voice::new().unwrap())
}

fn hear(segmenter: &mut Segmenter, likely: f32, seconds: f32) {
    for _ in 0..(seconds * RATE as f32) as usize / FRAME {
        segmenter.audio.extend_from_slice(&[0.0; FRAME]);
        segmenter.listen(likely, 1.0);
    }
}

fn heard(parts: &[(f32, f32)]) -> Segmenter {
    let mut segmenter = segmenter();
    for (likely, seconds) in parts {
        hear(&mut segmenter, *likely, *seconds);
    }
    segmenter
}

fn seconds(audio: &[f32]) -> f32 {
    audio.len() as f32 / RATE as f32
}

fn recorded() -> Vec<f32> {
    pcm16_mono(include_bytes!("../../../testdata/speech.wav")).unwrap()
}

fn noise(seconds: f32, loudness: f32) -> Vec<f32> {
    let mut seed = 0x2545_f491_u32;
    let mut low = 0.0;
    (0..(seconds * RATE as f32) as usize)
        .map(|_| {
            seed ^= seed << 13;
            seed ^= seed >> 17;
            seed ^= seed << 5;
            let white = seed as f32 / u32::MAX as f32 - 0.5;
            low = 0.97 * low + 0.03 * white;
            loudness * (white + 8.0 * low)
        })
        .collect()
}

fn mixed(speech: &[f32], noise: &[f32]) -> Vec<f32> {
    speech.iter().zip(noise).map(|(a, b)| a + b).collect()
}

fn feed(audio: &[f32]) -> Segmenter {
    let mut segmenter = segmenter();
    for chunk in audio.chunks(RATE / 50) {
        segmenter.push(chunk).unwrap();
    }
    segmenter
}

#[test]
fn a_pause_closes_a_stretch_of_speech() {
    let mut segmenter = heard(&[(SILENT, 0.3), (SPOKEN, 1.0), (SILENT, 1.0), (SPOKEN, 0.5)]);
    let first = segmenter
        .take_closed()
        .expect("the pause closes the first stretch");
    assert!(seconds(&first) > 1.0 && seconds(&first) < 2.0);
    assert!(segmenter.take_closed().is_none());
    assert!(segmenter.open().is_some());
    assert_eq!(segmenter.finish().len(), 1);
}

#[test]
fn short_gaps_inside_speech_stay_together() {
    let mut segmenter = heard(&[(SPOKEN, 1.0), (SILENT, 0.3), (SPOKEN, 1.0)]);
    assert!(segmenter.take_closed().is_none());
    assert_eq!(segmenter.finish().len(), 1);
}

#[test]
fn speech_needs_a_likely_start_but_goes_on_while_fairly_likely() {
    let mut unsure = heard(&[(0.4, 2.0)]);
    assert!(unsure.open().is_none());
    assert!(unsure.take_closed().is_none());
    let going = heard(&[(SPOKEN, 0.5), (0.4, 2.0)]);
    assert!(going.quiet_for() < Duration::from_millis(100));
}

#[test]
fn silence_alone_is_never_recognized() {
    let mut segmenter = heard(&[(SILENT, 3.0)]);
    assert!(segmenter.take_closed().is_none());
    assert!(segmenter.open().is_none());
    assert!(segmenter.finish().is_empty());
}

#[test]
fn speech_without_pauses_is_cut_at_its_quietest_before_it_grows_too_long() {
    let mut segmenter = segmenter();
    for frame in 0..frames(30_000) {
        segmenter.audio.extend_from_slice(&[0.0; FRAME]);
        let dip = frame == LONGEST_FRAMES - CUT_SEARCH_FRAMES / 2;
        segmenter.listen(SPOKEN, if dip { 0.1 } else { 1.0 });
    }
    let first = segmenter.take_closed().expect("a long stretch is cut");
    assert_eq!(
        first.len(),
        (LONGEST_FRAMES - CUT_SEARCH_FRAMES / 2) * FRAME
    );
}

#[test]
fn quiet_counts_from_the_last_speech_across_pauses() {
    let segmenter = heard(&[(SILENT, 2.0)]);
    assert!(!segmenter.spoken());
    assert!((segmenter.quiet_for().as_secs_f32() - 2.0).abs() < 0.05);
    let mut segmenter = heard(&[(SILENT, 1.0), (SPOKEN, 1.0), (SILENT, 2.5)]);
    assert!(segmenter.take_closed().is_some());
    assert!(segmenter.spoken());
    assert!((segmenter.quiet_for().as_secs_f32() - 2.5).abs() < 0.05);
}

#[test]
fn a_blip_is_not_speech() {
    assert!(
        heard(&[(SILENT, 1.0), (SPOKEN, 0.07), (SILENT, 1.0)])
            .finish()
            .is_empty()
    );
}

#[test]
fn silence_around_speech_is_trimmed() {
    let segments = heard(&[(SILENT, 2.0), (SPOKEN, 1.0), (SILENT, 0.4)]).finish();
    let kept = seconds(&segments[0]);
    let padding = (2 * KEPT_AROUND_SPEECH * FRAME) as f32 / RATE as f32;
    assert!(kept > 0.95 && kept < 1.05 + padding, "{kept}");
}

#[test]
fn recorded_speech_is_heard_from_start_to_end() {
    let speech = recorded();
    let silence = vec![0.0; RATE];
    let segments = feed(&[silence.as_slice(), &speech, &silence].concat()).finish();
    assert_eq!(segments.len(), 1);
    let kept = seconds(&segments[0]);
    assert!(
        kept >= seconds(&speech) && kept < seconds(&speech) + 1.0,
        "{kept}"
    );
}

#[test]
fn a_minute_of_talking_without_pauses_stays_speech() {
    let speech = recorded().repeat(20);
    let mut segmenter = segmenter();
    let mut longest_quiet = Duration::ZERO;
    for chunk in speech.chunks(RATE / 50) {
        segmenter.push(chunk).unwrap();
        longest_quiet = longest_quiet.max(segmenter.quiet_for());
    }
    assert!(longest_quiet < Duration::from_secs(1), "{longest_quiet:?}");
    let kept: f32 = segmenter
        .finish()
        .iter()
        .map(|segment| seconds(segment))
        .sum();
    assert!(kept > 0.97 * seconds(&speech), "{kept}");
}

#[test]
fn noise_is_not_speech() {
    let hum: Vec<f32> = (0..5 * RATE)
        .map(|index| 0.05 * (index as f32 * 0.04).sin())
        .collect();
    for sound in [noise(5.0, 0.05), hum] {
        let segmenter = feed(&sound);
        assert!(!segmenter.spoken());
        assert!(segmenter.finish().is_empty());
    }
}

#[test]
fn speech_in_a_noisy_room_is_heard() {
    let speech = [noise(1.0, 0.0), recorded(), noise(1.0, 0.0)].concat();
    let room = noise(seconds(&speech), 0.02);
    let segments = feed(&mixed(&speech, &room)).finish();
    assert_eq!(segments.len(), 1);
    assert!(seconds(&segments[0]) >= seconds(&recorded()) - 0.2);
}
