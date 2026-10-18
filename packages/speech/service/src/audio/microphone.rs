use std::sync::mpsc::{self, Sender};
use std::thread::JoinHandle;

use anyhow::{Context, Result, anyhow};
use pipewire as pw;
use pw::properties::properties;
use pw::spa;
use spa::param::audio::{AudioFormat, AudioInfoRaw};
use spa::pod::Pod;

use super::{Input, Meter, RATE};

/// Records the default microphone at 16 kHz mono on its own thread. PipeWire
/// converts from whatever the microphone gives. Dropping it closes the stream,
/// so the microphone is only open while dictating.
pub struct Microphone {
    quit: pw::channel::Sender<()>,
    thread: Option<JoinHandle<()>>,
}

impl Microphone {
    pub fn open(input: Sender<Input>, meter: Meter) -> Result<Self> {
        let (quit, quit_receiver) = pw::channel::channel();
        let (opened, opened_receiver) = mpsc::channel();
        let thread = std::thread::Builder::new()
            .name("microphone".into())
            .spawn(move || {
                if let Err(error) = record(input, meter, quit_receiver, &opened) {
                    let _ = opened.send(Err(error));
                }
            })?;
        opened_receiver
            .recv()
            .context("The microphone thread stopped")??;
        Ok(Self {
            quit,
            thread: Some(thread),
        })
    }
}

impl Drop for Microphone {
    fn drop(&mut self) {
        let _ = self.quit.send(());
        if let Some(thread) = self.thread.take() {
            let _ = thread.join();
        }
    }
}

fn format() -> Result<Vec<u8>> {
    let mut info = AudioInfoRaw::new();
    info.set_format(AudioFormat::F32LE);
    info.set_rate(RATE as u32);
    info.set_channels(1);
    let object = spa::pod::Object {
        type_: spa::utils::SpaTypes::ObjectParamFormat.as_raw(),
        id: spa::param::ParamType::EnumFormat.as_raw(),
        properties: info.into(),
    };
    Ok(spa::pod::serialize::PodSerializer::serialize(
        std::io::Cursor::new(Vec::new()),
        &spa::pod::Value::Object(object),
    )
    .map_err(|error| anyhow!("{error:?}"))?
    .0
    .into_inner())
}

fn record(
    input: Sender<Input>,
    meter: Meter,
    quit: pw::channel::Receiver<()>,
    opened: &Sender<Result<()>>,
) -> Result<()> {
    pw::init();
    let mainloop = pw::main_loop::MainLoopRc::new(None)?;
    let context = pw::context::ContextRc::new(&mainloop, None)?;
    let core = context.connect_rc(None)?;
    let props = properties! {
        *pw::keys::MEDIA_TYPE => "Audio",
        *pw::keys::MEDIA_CATEGORY => "Capture",
        *pw::keys::MEDIA_ROLE => "Communication",
        *pw::keys::APP_NAME => "Dictation",
        *pw::keys::APP_ID => "com.lantharos.Speech",
        *pw::keys::APP_ICON_NAME => "audio-input-microphone-symbolic",
        *pw::keys::NODE_NAME => "luft-speech",
    };
    let stream = pw::stream::StreamBox::new(&core, "Dictation", props)?;
    let _listener = stream
        .add_local_listener_with_user_data((input, meter))
        .process(|stream, (input, meter)| {
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
            let samples: Vec<f32> = bytes[..size.min(bytes.len())]
                .as_chunks::<4>()
                .0
                .iter()
                .map(|sample| f32::from_le_bytes(*sample))
                .collect();
            meter.measure(&samples);
            let _ = input.send(Input::Audio(samples));
        })
        .register()?;
    let format = format()?;
    let mut params = [Pod::from_bytes(&format).context("Couldn't describe the audio format")?];
    stream.connect(
        spa::utils::Direction::Input,
        None,
        pw::stream::StreamFlags::AUTOCONNECT | pw::stream::StreamFlags::MAP_BUFFERS,
        &mut params,
    )?;
    let quitting = mainloop.clone();
    let _quit = quit.attach(mainloop.loop_(), move |()| quitting.quit());
    let _ = opened.send(Ok(()));
    mainloop.run();
    Ok(())
}
