use crate::audio::CHANNELS;
use crate::audio::pcm::Pcm;

pub fn peaks(pcm: &Pcm, buckets: usize) -> Vec<f32> {
    let samples = pcm.samples();
    let size = (samples.len() / buckets)
        .next_multiple_of(CHANNELS)
        .max(CHANNELS);
    samples
        .chunks(size)
        .take(buckets)
        .map(|slice| {
            slice
                .iter()
                .fold(0f32, |peak, sample| peak.max(sample.abs()))
        })
        .collect()
}
