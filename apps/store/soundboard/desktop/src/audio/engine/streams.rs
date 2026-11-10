use std::io::Cursor;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};

use parking_lot::Mutex;
use pipewire as pw;
use pw::properties::properties;
use pw::spa;
use pw::stream::{Stream, StreamBox, StreamFlags, StreamListener, StreamState};
use rtrb::{Consumer, Producer, RingBuffer};
use rustix::fd::OwnedFd;
use spa::param::audio::{AudioFormat, AudioInfoRaw};
use spa::pod::Pod;
use spa::pod::serialize::PodSerializer;

use super::super::mixer::{Mixer, Output, limit};
use super::super::{CHANNELS, RATE};
use super::{Mix, SOURCE_DESCRIPTION, SOURCE_NAME};

const GROUP: &str = "soundboard";
const LATENCY: &str = "256/48000";
const CAPTURE_NODE: &str = "soundboard-capture";
const MONITOR_NODE: &str = "soundboard-monitor";
const VOICE_RING_FRAMES: usize = 8192;
const SPA_AUDIO_CHANNEL_FL: u32 = 3;
const SPA_AUDIO_CHANNEL_FR: u32 = 4;
const BYTES_PER_FRAME: usize = CHANNELS * size_of::<f32>();
const GAIN_STEP_FRAMES: f32 = 480.0;

fn store(cell: &AtomicU32, value: f32) {
    cell.store(value.to_bits(), Ordering::Relaxed);
}

fn load(cell: &AtomicU32) -> f32 {
    f32::from_bits(cell.load(Ordering::Relaxed))
}

pub struct Levels {
    microphone: AtomicU32,
    monitor: AtomicU32,
    monitor_on: AtomicBool,
    voice_peak: AtomicU32,
    output_peak: AtomicU32,
}

impl Levels {
    pub fn new(mix: &Mix) -> Self {
        let levels = Self {
            microphone: AtomicU32::new(0),
            monitor: AtomicU32::new(0),
            monitor_on: AtomicBool::new(false),
            voice_peak: AtomicU32::new(0),
            output_peak: AtomicU32::new(0),
        };
        levels.apply(mix);
        levels
    }

    pub fn apply(&self, mix: &Mix) {
        let voice = if mix.microphone_muted {
            0.0
        } else {
            mix.microphone_level
        };
        store(&self.microphone, voice);
        store(&self.monitor, mix.monitor_level);
        self.monitor_on.store(mix.monitor_on, Ordering::Relaxed);
    }

    pub fn take_peaks(&self) -> (f32, f32) {
        let take = |cell: &AtomicU32| f32::from_bits(cell.swap(0, Ordering::Relaxed));
        (take(&self.voice_peak), take(&self.output_peak))
    }

    fn raise(cell: &AtomicU32, peak: f32) {
        if peak > load(cell) {
            store(cell, peak);
        }
    }
}

pub struct Shared {
    pub mixer: Mutex<Mixer>,
    pub levels: Arc<Levels>,
    wake: OwnedFd,
}

impl Shared {
    pub fn new(mixer: Mixer, levels: Arc<Levels>, wake: OwnedFd) -> Self {
        Self {
            mixer: Mutex::new(mixer),
            levels,
            wake,
        }
    }

    fn wake_control(&self) {
        let _ = rustix::io::write(&self.wake, &1u64.to_ne_bytes());
    }

    fn render(&self, output: Output, out: &mut [f32]) {
        if self
            .mixer
            .try_lock()
            .is_some_and(|mut mixer| mixer.render(output, out))
        {
            self.wake_control();
        }
    }
}

pub struct Handle<'c, D> {
    pub stream: StreamBox<'c>,
    _listener: StreamListener<D>,
}

pub(super) fn format_pod() -> Result<Vec<u8>, pw::Error> {
    let mut info = AudioInfoRaw::new();
    info.set_format(AudioFormat::F32LE);
    info.set_rate(RATE);
    info.set_channels(CHANNELS as u32);
    let mut position = [0; spa::param::audio::MAX_CHANNELS];
    position[0] = SPA_AUDIO_CHANNEL_FL;
    position[1] = SPA_AUDIO_CHANNEL_FR;
    info.set_position(position);
    let object = spa::pod::Object {
        type_: spa::utils::SpaTypes::ObjectParamFormat.as_raw(),
        id: spa::param::ParamType::EnumFormat.as_raw(),
        properties: info.into(),
    };
    PodSerializer::serialize(Cursor::new(Vec::new()), &spa::pod::Value::Object(object))
        .map(|(bytes, _)| bytes.into_inner())
        .map_err(|_| pw::Error::CreationFailed)
}

fn connect(
    stream: &Stream,
    direction: spa::utils::Direction,
    flags: StreamFlags,
) -> Result<(), pw::Error> {
    let format = format_pod()?;
    let pod = Pod::from_bytes(&format).ok_or(pw::Error::CreationFailed)?;
    stream.connect(
        direction,
        None,
        flags | StreamFlags::AUTOCONNECT | StreamFlags::MAP_BUFFERS | StreamFlags::RT_PROCESS,
        &mut [pod],
    )
}

fn fill(stream: &Stream, write: impl FnOnce(&mut [f32])) {
    let Some(mut buffer) = stream.dequeue_buffer() else {
        return;
    };
    let requested = buffer.requested() as usize;
    let Some(data) = buffer.datas_mut().first_mut() else {
        return;
    };
    let Some(bytes) = data.data() else {
        return;
    };
    let available = bytes.len() / BYTES_PER_FRAME;
    let frames = if requested == 0 {
        available
    } else {
        requested.min(available)
    };
    let size = frames * BYTES_PER_FRAME;
    // SAFETY: every bit pattern is a valid f32, and the buffer is at least f32 aligned.
    let (_, samples, _) = unsafe { bytes[..size].align_to_mut::<f32>() };
    samples.fill(0.0);
    write(samples);
    let chunk = data.chunk_mut();
    *chunk.offset_mut() = 0;
    *chunk.stride_mut() = BYTES_PER_FRAME as i32;
    *chunk.size_mut() = size as u32;
}

pub type VoiceWriter = Arc<Mutex<Producer<f32>>>;

pub struct VoiceRing {
    producer: VoiceWriter,
    consumer: Consumer<f32>,
    gain: f32,
}

impl VoiceRing {
    pub fn new() -> Self {
        let (producer, consumer) = RingBuffer::new(VOICE_RING_FRAMES * CHANNELS);
        Self {
            producer: Arc::new(Mutex::new(producer)),
            consumer,
            gain: 0.0,
        }
    }

    pub fn writer(&self) -> VoiceWriter {
        self.producer.clone()
    }

    fn pull(&mut self, target: f32, out: &mut [f32]) {
        let wanted = out.len();
        let backlog = self.consumer.slots().saturating_sub(wanted);
        if backlog > 0
            && let Ok(stale) = self.consumer.read_chunk(backlog)
        {
            stale.commit_all();
        }
        let available = self.consumer.slots().min(wanted);
        let Ok(chunk) = self.consumer.read_chunk(available) else {
            return;
        };
        let step = (target - self.gain) / GAIN_STEP_FRAMES / CHANNELS as f32;
        let (first, second) = chunk.as_slices();
        for (slot, sample) in out.iter_mut().zip(first.iter().chain(second)) {
            if (target - self.gain).abs() > step.abs() {
                self.gain += step;
            } else {
                self.gain = target;
            }
            *slot += sample * self.gain;
        }
        chunk.commit_all();
    }
}

pub fn virtual_microphone<'c>(
    core: &'c pw::core::Core,
    shared: Arc<Shared>,
    voice: VoiceRing,
) -> Result<Handle<'c, (Arc<Shared>, VoiceRing)>, pw::Error> {
    let props = properties! {
        *pw::keys::MEDIA_CLASS => "Audio/Source",
        *pw::keys::NODE_NAME => SOURCE_NAME,
        *pw::keys::NODE_DESCRIPTION => SOURCE_DESCRIPTION,
        *pw::keys::NODE_NICK => SOURCE_DESCRIPTION,
        *pw::keys::NODE_GROUP => GROUP,
        *pw::keys::NODE_LATENCY => LATENCY,
        *pw::keys::PRIORITY_SESSION => "-1",
        *pw::keys::APP_ID => "com.lantharos.soundboard",
        *pw::keys::APP_ICON_NAME => "com.lantharos.soundboard",
        "audio.position" => "[ FL FR ]",
    };
    let stream = StreamBox::new(core, SOURCE_DESCRIPTION, props)?;
    let listener = stream
        .add_local_listener_with_user_data((shared, voice))
        .process(|stream, (shared, voice)| {
            fill(stream, |out| {
                voice.pull(load(&shared.levels.microphone), out);
                shared.render(Output::Microphone, out);
                Levels::raise(&shared.levels.output_peak, limit(out));
            });
        })
        .register()?;
    connect(
        &stream,
        spa::utils::Direction::Output,
        StreamFlags::INACTIVE,
    )?;
    Ok(Handle {
        stream,
        _listener: listener,
    })
}

pub fn monitor<'c>(
    core: &'c pw::core::Core,
    shared: Arc<Shared>,
) -> Result<Handle<'c, Arc<Shared>>, pw::Error> {
    let props = properties! {
        *pw::keys::MEDIA_TYPE => "Audio",
        *pw::keys::MEDIA_CATEGORY => "Playback",
        *pw::keys::MEDIA_ROLE => "Game",
        *pw::keys::NODE_NAME => MONITOR_NODE,
        *pw::keys::NODE_LATENCY => LATENCY,
        *pw::keys::APP_NAME => SOURCE_DESCRIPTION,
        *pw::keys::APP_ID => "com.lantharos.soundboard",
        *pw::keys::APP_ICON_NAME => "com.lantharos.soundboard",
    };
    let stream = StreamBox::new(core, SOURCE_DESCRIPTION, props)?;
    let listener = stream
        .add_local_listener_with_user_data(shared)
        .process(|stream, shared| {
            fill(stream, |out| {
                shared.render(Output::Monitor, out);
                let level = if shared.levels.monitor_on.load(Ordering::Relaxed) {
                    load(&shared.levels.monitor)
                } else {
                    0.0
                };
                out.iter_mut().for_each(|sample| *sample *= level);
                limit(out);
            });
        })
        .register()?;
    connect(
        &stream,
        spa::utils::Direction::Output,
        StreamFlags::INACTIVE,
    )?;
    Ok(Handle {
        stream,
        _listener: listener,
    })
}

pub fn capture<'c>(
    core: &'c pw::core::Core,
    target: &str,
    writer: VoiceWriter,
    levels: Arc<Levels>,
) -> Result<Handle<'c, (VoiceWriter, Arc<Levels>)>, pw::Error> {
    let props = properties! {
        *pw::keys::MEDIA_TYPE => "Audio",
        *pw::keys::MEDIA_CATEGORY => "Capture",
        *pw::keys::MEDIA_ROLE => "Production",
        *pw::keys::NODE_NAME => CAPTURE_NODE,
        *pw::keys::NODE_GROUP => GROUP,
        *pw::keys::NODE_LATENCY => LATENCY,
        "target.object" => target,
        *pw::keys::APP_NAME => SOURCE_DESCRIPTION,
        *pw::keys::APP_ID => "com.lantharos.soundboard",
        *pw::keys::APP_ICON_NAME => "com.lantharos.soundboard",
    };
    let stream = StreamBox::new(core, SOURCE_DESCRIPTION, props)?;
    let listener = stream
        .add_local_listener_with_user_data((writer, levels))
        .process(|stream, (writer, levels)| {
            let Some(mut buffer) = stream.dequeue_buffer() else {
                return;
            };
            let Some(data) = buffer.datas_mut().first_mut() else {
                return;
            };
            let size = data.chunk().size() as usize;
            let Some(bytes) = data.data() else {
                return;
            };
            // SAFETY: every bit pattern is a valid f32, and the buffer is at least f32 aligned.
            let (_, samples, _) = unsafe { bytes[..size.min(bytes.len())].align_to::<f32>() };
            let mut writer = writer.lock();
            let mut peak = 0f32;
            let free = writer.slots().min(samples.len());
            if let Ok(mut chunk) = writer.write_chunk_uninit(free) {
                let (first, second) = chunk.as_mut_slices();
                for (slot, sample) in first.iter_mut().chain(second).zip(samples) {
                    slot.write(*sample);
                    peak = peak.max(sample.abs());
                }
                // SAFETY: the loop above wrote every slot of the chunk.
                unsafe { chunk.commit_all() };
            }
            Levels::raise(&levels.voice_peak, peak);
        })
        .register()?;
    connect(&stream, spa::utils::Direction::Input, StreamFlags::empty())?;
    Ok(Handle {
        stream,
        _listener: listener,
    })
}

pub fn streaming(stream: &Stream) -> bool {
    matches!(stream.state(), StreamState::Streaming)
}
