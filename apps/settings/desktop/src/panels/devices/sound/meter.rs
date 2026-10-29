use std::io::Cursor;
use std::thread::JoinHandle;

use luft_app::Events;
use luft_i18n::t;
use pipewire as pw;
use pw::properties::properties;
use pw::spa;
use sabine::BridgeEvent;
use spa::param::audio::{AudioFormat, AudioInfoRaw};
use spa::pod::Pod;
use spa::pod::serialize::PodSerializer;

use crate::L10N;

pub const SOUND_LEVEL: BridgeEvent<f32> = BridgeEvent::new("sound.level");
const UPDATES_PER_SECOND: u32 = 25;

pub struct Meter {
    source: String,
    quit: pw::channel::Sender<()>,
    thread: Option<JoinHandle<()>>,
}

impl Meter {
    pub fn start(source: String, events: Events) -> Option<Self> {
        let (quit, quit_receiver) = pw::channel::channel();
        let target = source.clone();
        let thread = std::thread::Builder::new()
            .name("sound-meter".into())
            .spawn(move || {
                measure(&target, events, quit_receiver);
            })
            .ok()?;
        Some(Self {
            source,
            quit,
            thread: Some(thread),
        })
    }

    pub fn source(&self) -> &str {
        &self.source
    }
}

impl Drop for Meter {
    fn drop(&mut self) {
        let _ = self.quit.send(());
        if let Some(thread) = self.thread.take() {
            let _ = thread.join();
        }
    }
}

fn format() -> Option<Vec<u8>> {
    let mut info = AudioInfoRaw::new();
    info.set_format(AudioFormat::F32LE);
    info.set_rate(UPDATES_PER_SECOND);
    info.set_channels(1);
    let object = spa::pod::Object {
        type_: spa::utils::SpaTypes::ObjectParamFormat.as_raw(),
        id: spa::param::ParamType::EnumFormat.as_raw(),
        properties: info.into(),
    };
    PodSerializer::serialize(Cursor::new(Vec::new()), &spa::pod::Value::Object(object))
        .ok()
        .map(|(bytes, _)| bytes.into_inner())
}

fn peak(stream: &pw::stream::Stream) -> Option<f32> {
    let mut buffer = stream.dequeue_buffer()?;
    let data = buffer.datas_mut().first_mut()?;
    let size = data.chunk().size() as usize;
    let bytes = data.data()?;
    let samples = bytes[..size.min(bytes.len())].as_chunks::<4>().0;
    samples.last().map(|sample| f32::from_le_bytes(*sample))
}

fn measure(source: &str, events: Events, quit: pw::channel::Receiver<()>) -> Option<()> {
    pw::init();
    let mainloop = pw::main_loop::MainLoopRc::new(None).ok()?;
    let context = pw::context::ContextRc::new(&mainloop, None).ok()?;
    let core = context.connect_rc(None).ok()?;
    let name = t!(L10N, "desktop-sound-meter-stream");
    let props = properties! {
        *pw::keys::MEDIA_TYPE => "Audio",
        *pw::keys::MEDIA_CATEGORY => "Capture",
        *pw::keys::APP_NAME => t!(L10N, "desktop-app-name"),
        *pw::keys::APP_ID => "com.lantharos.settings",
        *pw::keys::APP_ICON_NAME => "preferences-system",
        "target.object" => source,
        *pw::keys::NODE_DONT_RECONNECT => "true",
        *pw::keys::NODE_LATENCY => format!("1/{UPDATES_PER_SECOND}"),
        "resample.peaks" => "true",
    };
    let stream = pw::stream::StreamBox::new(&core, &name, props).ok()?;
    let _listener = stream
        .add_local_listener_with_user_data(events)
        .process(|stream, events| {
            if let Some(level) = peak(stream) {
                events.emit(SOUND_LEVEL, level.abs().clamp(0.0, 1.0));
            }
        })
        .register()
        .ok()?;
    let format = format()?;
    let mut params = [Pod::from_bytes(&format)?];
    stream
        .connect(
            spa::utils::Direction::Input,
            None,
            pw::stream::StreamFlags::AUTOCONNECT | pw::stream::StreamFlags::MAP_BUFFERS,
            &mut params,
        )
        .ok()?;
    let quitting = mainloop.clone();
    let _quit = quit.attach(mainloop.loop_(), move |()| quitting.quit());
    mainloop.run();
    Some(())
}
