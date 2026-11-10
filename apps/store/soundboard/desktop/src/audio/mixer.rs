use std::ops::Range;
use std::sync::Arc;

use rtrb::{Consumer, Producer, RingBuffer};

use super::pcm::Pcm;
use super::{CHANNELS, RATE, SoundId};

const MAX_VOICES: usize = 64;
const ORDERS: usize = MAX_VOICES * 4;
const FADE_FRAMES: u32 = RATE / 200;
const KNEE: f32 = 0.8;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Output {
    Microphone,
    Monitor,
}

impl Output {
    pub const ALL: [Self; 2] = [Self::Microphone, Self::Monitor];

    const fn index(self) -> usize {
        self as usize
    }
}

#[derive(Clone, Copy)]
struct Cursor {
    at: usize,
    fading: Option<u32>,
}

pub struct Voice {
    sound: SoundId,
    pcm: Arc<Pcm>,
    range: Range<usize>,
    gain: f32,
    looping: bool,
    cursors: [Option<Cursor>; 2],
}

pub struct VoiceSpec {
    pub sound: SoundId,
    pub pcm: Arc<Pcm>,
    pub range: Range<usize>,
    pub gain: f32,
    pub looping: bool,
}

impl Voice {
    pub fn new(spec: VoiceSpec, outputs: [bool; 2]) -> Self {
        let cursor = Cursor {
            at: spec.range.start,
            fading: None,
        };
        Self {
            sound: spec.sound,
            pcm: spec.pcm,
            range: spec.range,
            gain: spec.gain,
            looping: spec.looping,
            cursors: outputs.map(|heard| heard.then_some(cursor)),
        }
    }

    pub fn sound(&self) -> SoundId {
        self.sound
    }

    fn mix(&mut self, output: Output, out: &mut [f32]) {
        let Some(cursor) = &mut self.cursors[output.index()] else {
            return;
        };
        let samples = self.pcm.samples();
        let mut done = false;
        for frame in out.as_chunks_mut::<CHANNELS>().0 {
            if cursor.at >= self.range.end {
                if !self.looping {
                    done = true;
                    break;
                }
                cursor.at = self.range.start;
            }
            let mut gain = self.gain;
            if let Some(fading) = &mut cursor.fading {
                if *fading == 0 {
                    done = true;
                    break;
                }
                gain *= *fading as f32 / FADE_FRAMES as f32;
                *fading -= 1;
            }
            let source = cursor.at * CHANNELS;
            frame[0] += samples[source] * gain;
            frame[1] += samples[source + 1] * gain;
            cursor.at += 1;
        }
        if done {
            self.cursors[output.index()] = None;
        }
    }

    fn stop(&mut self) {
        for cursor in self.cursors.iter_mut().flatten() {
            cursor.fading.get_or_insert(FADE_FRAMES);
        }
    }

    fn finished(&self) -> bool {
        self.cursors.iter().all(Option::is_none)
    }
}

pub enum Order {
    Start(Voice),
    Stop(SoundId),
    StopAll,
    Abandon(Output),
}

pub struct Mixer {
    voices: Vec<Voice>,
    orders: Consumer<Order>,
    retired: Producer<Voice>,
}

pub struct MixerControl {
    pub orders: Producer<Order>,
    pub retired: Consumer<Voice>,
}

impl Mixer {
    pub fn new() -> (Self, MixerControl) {
        let (order_sender, orders) = RingBuffer::new(ORDERS);
        let (retired, retired_receiver) = RingBuffer::new(MAX_VOICES * 2);
        (
            Self {
                voices: Vec::with_capacity(MAX_VOICES),
                orders,
                retired,
            },
            MixerControl {
                orders: order_sender,
                retired: retired_receiver,
            },
        )
    }

    pub fn take_orders(&mut self) {
        while let Ok(order) = self.orders.pop() {
            match order {
                Order::Start(voice) => self.start(voice),
                Order::Stop(sound) => self
                    .voices
                    .iter_mut()
                    .filter(|voice| voice.sound == sound)
                    .for_each(|voice| voice.stop()),
                Order::StopAll => self.voices.iter_mut().for_each(|voice| voice.stop()),
                Order::Abandon(output) => self
                    .voices
                    .iter_mut()
                    .for_each(|voice| voice.cursors[output.index()] = None),
            }
        }
        self.retire();
    }

    fn start(&mut self, voice: Voice) {
        if self.voices.len() < MAX_VOICES {
            self.voices.push(voice);
        } else {
            let _ = self.retired.push(voice);
        }
    }

    fn retire(&mut self) -> bool {
        let before = self.voices.len();
        let mut index = 0;
        while index < self.voices.len() {
            if self.voices[index].finished() && !self.retired.is_full() {
                let voice = self.voices.swap_remove(index);
                let _ = self.retired.push(voice);
            } else {
                index += 1;
            }
        }
        before != self.voices.len()
    }

    pub fn render(&mut self, output: Output, out: &mut [f32]) -> bool {
        self.take_orders();
        for voice in &mut self.voices {
            voice.mix(output, out);
        }
        self.retire()
    }
}

pub fn limit(samples: &mut [f32]) -> f32 {
    let mut peak = 0f32;
    for sample in samples {
        let level = sample.abs();
        if level > KNEE {
            let over = (level - KNEE) / (1.0 - KNEE);
            *sample = sample.signum() * (KNEE + (1.0 - KNEE) * over.tanh());
        }
        peak = peak.max(sample.abs());
    }
    peak
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::audio::pcm;

    fn sound(samples: &[f32]) -> Arc<Pcm> {
        let folder = tempfile::tempdir().unwrap();
        let path = folder.path().join("sound.pcm");
        pcm::write(&path, samples).unwrap();
        Arc::new(Pcm::open(&path).unwrap())
    }

    fn voice(id: SoundId, pcm: &Arc<Pcm>, range: Range<usize>, gain: f32, looping: bool) -> Voice {
        let spec = VoiceSpec {
            sound: id,
            pcm: pcm.clone(),
            range,
            gain,
            looping,
        };
        Voice::new(spec, [true, true])
    }

    fn playing(voices: Vec<Voice>) -> (Mixer, MixerControl) {
        let (mixer, mut control) = Mixer::new();
        for voice in voices {
            control.orders.push(Order::Start(voice)).ok().unwrap();
        }
        (mixer, control)
    }

    #[test]
    fn sounds_add_up_with_their_levels() {
        let a = sound(&[0.5; 8]);
        let b = sound(&[0.25; 8]);
        let (mut mixer, _control) = playing(vec![
            voice(1, &a, 0..4, 0.5, false),
            voice(2, &b, 0..4, 1.0, false),
        ]);
        let mut out = [0.0; 8];
        mixer.render(Output::Microphone, &mut out);
        assert_eq!(out, [0.5; 8]);
    }

    #[test]
    fn trimming_plays_only_the_chosen_frames() {
        let samples: Vec<f32> = (0..20).map(|frame| (frame / 2) as f32 / 10.0).collect();
        let pcm = sound(&samples);
        let (mut mixer, mut control) = playing(vec![voice(1, &pcm, 2..4, 1.0, false)]);
        let mut out = [0.0; 12];
        assert!(!mixer.render(Output::Monitor, &mut out));
        assert_eq!(out[..6], [0.2, 0.2, 0.3, 0.3, 0.0, 0.0]);
        mixer.render(Output::Microphone, &mut [0.0; 12]);
        assert_eq!(control.retired.pop().map(|voice| voice.sound()), Ok(1));
    }

    #[test]
    fn looping_wraps_to_the_start_of_the_trim() {
        let pcm = sound(&[0.1, 0.1, 0.2, 0.2, 0.3, 0.3]);
        let (mut mixer, _control) = playing(vec![voice(1, &pcm, 1..3, 1.0, true)]);
        let mut out = [0.0; 10];
        mixer.render(Output::Monitor, &mut out);
        assert_eq!(out, [0.2, 0.2, 0.3, 0.3, 0.2, 0.2, 0.3, 0.3, 0.2, 0.2]);
    }

    #[test]
    fn each_output_keeps_its_own_place() {
        let pcm = sound(&[0.1, 0.1, 0.2, 0.2]);
        let (mut mixer, _control) = playing(vec![voice(1, &pcm, 0..2, 1.0, false)]);
        let mut microphone = [0.0; 2];
        mixer.render(Output::Microphone, &mut microphone);
        mixer.render(Output::Microphone, &mut microphone);
        let mut monitor = [0.0; 2];
        mixer.render(Output::Monitor, &mut monitor);
        assert_eq!(monitor, [0.1, 0.1]);
    }

    #[test]
    fn stopping_fades_out_instead_of_clicking() {
        let pcm = sound(&vec![1.0; (RATE as usize) * CHANNELS]);
        let (mut mixer, mut control) = playing(vec![voice(7, &pcm, 0..RATE as usize, 1.0, false)]);
        mixer.render(Output::Microphone, &mut [0.0; 64]);
        mixer.render(Output::Monitor, &mut [0.0; 64]);
        control.orders.push(Order::Stop(7)).ok().unwrap();
        let mut out = vec![0.0; (FADE_FRAMES as usize + 8) * CHANNELS];
        mixer.render(Output::Microphone, &mut out);
        assert!(out[0] > 0.9 && out[0] <= 1.0);
        assert!(out.windows(2).all(|pair| pair[1] <= pair[0]));
        assert_eq!(out[(FADE_FRAMES as usize) * CHANNELS], 0.0);
    }

    #[test]
    fn the_limiter_leaves_quiet_sound_alone_and_holds_loud_sound_under_full_scale() {
        let mut samples = [0.3, -0.7, 3.0, -9.0];
        limit(&mut samples);
        assert_eq!(samples[..2], [0.3, -0.7]);
        assert!(samples[2] <= 1.0 && samples[2] > KNEE);
        assert!(samples[3] >= -1.0 && samples[3] < -KNEE);
    }
}
