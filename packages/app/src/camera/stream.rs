use std::os::fd::OwnedFd;
use std::sync::mpsc;
use std::sync::{Arc, Mutex};
use std::thread::JoinHandle;

use pipewire as pw;
use pw::properties::properties;
use pw::spa;
use spa::param::format::{FormatProperties, MediaSubtype, MediaType};
use spa::param::video::{VideoFormat, VideoInfoRaw};
use spa::pod::Pod;
use spa::utils::{Fraction, Rectangle};

use super::frame::{self, Frame, Packing};

type Latest = Arc<Mutex<Option<Frame>>>;

/// What the stream asks the camera for: the size it would like, and the
/// largest it takes.
#[derive(Clone, Copy)]
pub struct Request {
    pub app_name: &'static str,
    pub app_id: &'static str,
    pub size: (u32, u32),
    pub largest: (u32, u32),
}

/// The camera streaming on a thread of its own, keeping only its newest
/// frame for the page to pick up. Dropping it closes the camera.
pub struct Camera {
    quit: pw::channel::Sender<()>,
    thread: Option<JoinHandle<()>>,
    latest: Latest,
}

impl Camera {
    pub(super) fn start(remote: OwnedFd, request: Request) -> Result<Self, String> {
        let (quit, quit_receiver) = pw::channel::channel();
        let (opened, opened_receiver) = mpsc::channel();
        let latest = Latest::default();
        let frames = latest.clone();
        let thread = std::thread::Builder::new()
            .name("camera".into())
            .spawn(move || {
                if let Err(error) = stream(remote, request, frames, quit_receiver, &opened) {
                    let _ = opened.send(Err(error));
                }
            })
            .map_err(|error| error.to_string())?;
        opened_receiver
            .recv()
            .map_err(|_| "The camera stopped".to_string())??;
        Ok(Self {
            quit,
            thread: Some(thread),
            latest,
        })
    }

    /// The newest frame since the last one taken.
    pub fn take_frame(&self) -> Option<Frame> {
        self.latest.lock().expect("camera frame lock").take()
    }
}

impl Drop for Camera {
    fn drop(&mut self) {
        let _ = self.quit.send(());
        if let Some(thread) = self.thread.take() {
            let _ = thread.join();
        }
    }
}

fn serialized(object: spa::pod::Object) -> Result<Vec<u8>, String> {
    spa::pod::serialize::PodSerializer::serialize(
        std::io::Cursor::new(Vec::new()),
        &spa::pod::Value::Object(object),
    )
    .map(|(cursor, _)| cursor.into_inner())
    .map_err(|error| format!("{error:?}"))
}

fn formats(request: Request) -> Result<[Vec<u8>; 2], String> {
    let size = || {
        spa::pod::property!(
            FormatProperties::VideoSize,
            Choice,
            Range,
            Rectangle,
            Rectangle {
                width: request.size.0,
                height: request.size.1
            },
            Rectangle {
                width: 1,
                height: 1
            },
            Rectangle {
                width: request.largest.0,
                height: request.largest.1
            }
        )
    };
    let rate = || {
        spa::pod::property!(
            FormatProperties::VideoFramerate,
            Choice,
            Range,
            Fraction,
            Fraction { num: 30, denom: 1 },
            Fraction { num: 0, denom: 1 },
            Fraction { num: 60, denom: 1 }
        )
    };
    let jpeg = spa::pod::object!(
        spa::utils::SpaTypes::ObjectParamFormat,
        spa::param::ParamType::EnumFormat,
        spa::pod::property!(FormatProperties::MediaType, Id, MediaType::Video),
        spa::pod::property!(FormatProperties::MediaSubtype, Id, MediaSubtype::Mjpg),
        size(),
        rate(),
    );
    let raw = spa::pod::object!(
        spa::utils::SpaTypes::ObjectParamFormat,
        spa::param::ParamType::EnumFormat,
        spa::pod::property!(FormatProperties::MediaType, Id, MediaType::Video),
        spa::pod::property!(FormatProperties::MediaSubtype, Id, MediaSubtype::Raw),
        spa::pod::property!(
            FormatProperties::VideoFormat,
            Choice,
            Enum,
            Id,
            VideoFormat::YUY2,
            VideoFormat::YUY2,
            VideoFormat::RGBx,
            VideoFormat::BGRx,
            VideoFormat::RGBA,
            VideoFormat::RGB
        ),
        size(),
        rate(),
    );
    Ok([serialized(jpeg)?, serialized(raw)?])
}

fn negotiated(param: &Pod) -> Packing {
    let Ok((media, subtype)) = spa::param::format_utils::parse_format(param) else {
        return Packing::Unknown;
    };
    let mut info = VideoInfoRaw::new();
    if media != MediaType::Video {
        Packing::Unknown
    } else if subtype == MediaSubtype::Mjpg {
        Packing::Jpeg
    } else if subtype == MediaSubtype::Raw && info.parse(param).is_ok() {
        Packing::Raw {
            format: info.format(),
            width: info.size().width,
            height: info.size().height,
        }
    } else {
        Packing::Unknown
    }
}

fn stream(
    remote: OwnedFd,
    request: Request,
    latest: Latest,
    quit: pw::channel::Receiver<()>,
    opened: &mpsc::Sender<Result<(), String>>,
) -> Result<(), String> {
    let failed = |error: pw::Error| error.to_string();
    pw::init();
    let mainloop = pw::main_loop::MainLoopRc::new(None).map_err(failed)?;
    let context = pw::context::ContextRc::new(&mainloop, None).map_err(failed)?;
    let core = context.connect_fd_rc(remote, None).map_err(failed)?;
    let props = properties! {
        *pw::keys::MEDIA_TYPE => "Video",
        *pw::keys::MEDIA_CATEGORY => "Capture",
        *pw::keys::MEDIA_ROLE => "Camera",
        *pw::keys::APP_NAME => request.app_name,
        *pw::keys::APP_ID => request.app_id,
    };
    let name = format!("{} camera", request.app_name);
    let stream = pw::stream::StreamBox::new(&core, &name, props).map_err(failed)?;
    let _listener = stream
        .add_local_listener_with_user_data(Packing::default())
        .param_changed(|_, packing, id, param| {
            if let Some(param) = param
                && id == spa::param::ParamType::Format.as_raw()
            {
                *packing = negotiated(param);
            }
        })
        .process(move |stream, packing| {
            let Some(mut buffer) = stream.dequeue_buffer() else {
                return;
            };
            let Some(data) = buffer.datas_mut().first_mut() else {
                return;
            };
            let chunk = data.chunk();
            let (offset, size, stride) = (
                chunk.offset() as usize,
                chunk.size() as usize,
                chunk.stride() as usize,
            );
            let Some(bytes) = data.data() else {
                return;
            };
            let Some(pixels) = bytes.get(offset..offset + size) else {
                return;
            };
            if let Some(encoded) = frame::encode(*packing, pixels, stride) {
                *latest.lock().expect("camera frame lock") = Some(encoded);
            }
        })
        .register()
        .map_err(failed)?;
    let formats = formats(request)?;
    let mut params = formats
        .iter()
        .map(|format| Pod::from_bytes(format).ok_or("Couldn't describe the camera formats"))
        .collect::<Result<Vec<_>, _>>()?;
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
