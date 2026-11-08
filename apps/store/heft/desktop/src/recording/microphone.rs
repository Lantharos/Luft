use std::sync::mpsc::{self, Sender};
use std::thread::JoinHandle;

use pipewire as pw;
use pw::properties::properties;
use pw::spa;
use spa::param::audio::{AudioFormat, AudioInfoRaw};
use spa::pod::Pod;

pub const RATE: u32 = 48_000;

/// The default microphone at 48 kHz mono on a thread of its own, handing
/// every buffer on as it arrives. PipeWire converts from whatever the
/// microphone gives. Dropping it closes the stream, so the microphone is open
/// only while recording and not while paused.
pub struct Microphone {
    quit: pw::channel::Sender<()>,
    thread: Option<JoinHandle<()>>,
}

impl Microphone {
    pub fn open(samples: Sender<Vec<f32>>) -> Result<Self, String> {
        let (quit, quit_receiver) = pw::channel::channel();
        let (opened, opened_receiver) = mpsc::channel();
        let thread = std::thread::Builder::new()
            .name("microphone".into())
            .spawn(move || {
                if let Err(error) = record(samples, quit_receiver, &opened) {
                    let _ = opened.send(Err(error));
                }
            })
            .map_err(|error| error.to_string())?;
        opened_receiver
            .recv()
            .map_err(|_| "The microphone stopped".to_string())??;
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

fn format() -> Result<Vec<u8>, String> {
    let mut info = AudioInfoRaw::new();
    info.set_format(AudioFormat::F32LE);
    info.set_rate(RATE);
    info.set_channels(1);
    let object = spa::pod::Object {
        type_: spa::utils::SpaTypes::ObjectParamFormat.as_raw(),
        id: spa::param::ParamType::EnumFormat.as_raw(),
        properties: info.into(),
    };
    spa::pod::serialize::PodSerializer::serialize(
        std::io::Cursor::new(Vec::new()),
        &spa::pod::Value::Object(object),
    )
    .map(|(cursor, _)| cursor.into_inner())
    .map_err(|error| format!("{error:?}"))
}

fn record(
    samples: Sender<Vec<f32>>,
    quit: pw::channel::Receiver<()>,
    opened: &Sender<Result<(), String>>,
) -> Result<(), String> {
    let failed = |error: pw::Error| error.to_string();
    pw::init();
    let mainloop = pw::main_loop::MainLoopRc::new(None).map_err(failed)?;
    let context = pw::context::ContextRc::new(&mainloop, None).map_err(failed)?;
    let core = context.connect_rc(None).map_err(failed)?;
    let props = properties! {
        *pw::keys::MEDIA_TYPE => "Audio",
        *pw::keys::MEDIA_CATEGORY => "Capture",
        *pw::keys::MEDIA_ROLE => "Production",
        *pw::keys::APP_NAME => "Heft",
        *pw::keys::APP_ID => "com.lantharos.Heft",
        *pw::keys::APP_ICON_NAME => "com.lantharos.Heft",
        *pw::keys::NODE_NAME => "heft-recording",
        *pw::keys::NODE_DESCRIPTION => "Heft recording a class",
    };
    let stream = pw::stream::StreamBox::new(&core, "Heft recording", props).map_err(failed)?;
    let _listener = stream
        .add_local_listener_with_user_data(samples)
        .process(|stream, samples| {
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
            let audio: Vec<f32> = bytes[..size.min(bytes.len())]
                .as_chunks::<4>()
                .0
                .iter()
                .map(|sample| f32::from_le_bytes(*sample))
                .collect();
            let _ = samples.send(audio);
        })
        .register()
        .map_err(failed)?;
    let format = format()?;
    let mut params = [Pod::from_bytes(&format).ok_or("Couldn't describe the audio format")?];
    stream
        .connect(
            spa::utils::Direction::Input,
            None,
            pw::stream::StreamFlags::AUTOCONNECT | pw::stream::StreamFlags::MAP_BUFFERS,
            &mut params,
        )
        .map_err(failed)?;
    let quitting = mainloop.clone();
    let _quit = quit.attach(mainloop.loop_(), move |()| quitting.quit());
    let _ = opened.send(Ok(()));
    mainloop.run();
    Ok(())
}
