use std::{
    io,
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
        mpsc,
    },
    thread,
    time::Duration,
};

use pipewire as pw;
use pw::{properties::properties, spa};
use spa::pod::Pod;

use crate::capture::CaptureClient;

type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;
type SharedFrame = Arc<Mutex<Vec<u8>>>;
type CaptureStartup = (u32, u32, SharedFrame);

pub struct CastHandle {
    stop: Arc<AtomicBool>,
}

pub struct CastInfo {
    pub handle: CastHandle,
    pub node_id: u32,
    pub width: u32,
    pub height: u32,
}

impl Drop for CastHandle {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::Relaxed);
    }
}

pub fn start(draw_cursor: bool) -> Result<CastInfo> {
    let stop = Arc::new(AtomicBool::new(false));
    let (frame_tx, frame_rx) = mpsc::sync_channel(1);
    let capture_stop = Arc::clone(&stop);
    thread::Builder::new()
        .name("luft-capture".into())
        .spawn(move || capture_frames(draw_cursor, capture_stop, frame_tx))?;

    let (width, height, latest) = frame_rx
        .recv_timeout(Duration::from_secs(5))
        .map_err(|error| io::Error::other(format!("capture startup timed out: {error}")))??;
    let (node_tx, node_rx) = mpsc::sync_channel(1);
    let pipewire_stop = Arc::clone(&stop);
    thread::Builder::new()
        .name("luft-pipewire".into())
        .spawn(move || {
            if let Err(error) = run_pipewire(width, height, latest, pipewire_stop, node_tx) {
                tracing::error!(%error, "PipeWire screencast stopped");
            }
        })?;
    let node_id = node_rx
        .recv_timeout(Duration::from_secs(5))
        .map_err(|error| io::Error::other(format!("PipeWire startup timed out: {error}")))??;

    Ok(CastInfo {
        handle: CastHandle { stop },
        node_id,
        width,
        height,
    })
}

fn capture_frames(
    draw_cursor: bool,
    stop: Arc<AtomicBool>,
    ready: mpsc::SyncSender<Result<CaptureStartup>>,
) {
    let started = (|| -> Result<_> {
        let mut client = CaptureClient::connect(draw_cursor)?;
        let frame = client
            .capture(Some(&stop))?
            .ok_or_else(|| io::Error::other("capture stopped before its first frame"))?;
        let width = frame.width;
        let height = frame.height;
        let latest = Arc::new(Mutex::new(frame.bgra));
        Ok((client, width, height, latest))
    })();
    let Ok((mut client, width, height, latest)) = started else {
        let _ = ready.send(started.map(|_| unreachable!()));
        return;
    };
    if ready
        .send(Ok((width, height, Arc::clone(&latest))))
        .is_err()
    {
        return;
    }

    while !stop.load(Ordering::Relaxed) {
        match client.capture(Some(&stop)) {
            Ok(Some(frame)) => {
                *latest.lock().unwrap() = frame.bgra;
            }
            Ok(None) => break,
            Err(error) => {
                tracing::warn!(%error, "Wayland screencast capture stopped");
                break;
            }
        }
    }
}

fn run_pipewire(
    width: u32,
    height: u32,
    latest: SharedFrame,
    stop: Arc<AtomicBool>,
    ready: mpsc::SyncSender<Result<u32>>,
) -> Result<()> {
    pw::init();
    let mainloop = pw::main_loop::MainLoopRc::new(None)?;
    let context = pw::context::ContextRc::new(&mainloop, None)?;
    let core = context.connect_rc(None)?;
    let stream = pw::stream::StreamBox::new(
        &core,
        "Luft screen cast",
        properties! {
            *pw::keys::MEDIA_TYPE => "Video",
            *pw::keys::MEDIA_CATEGORY => "Capture",
            *pw::keys::MEDIA_ROLE => "Screen",
            *pw::keys::MEDIA_CLASS => "Video/Source",
            *pw::keys::NODE_NAME => "luft.portal.screencast",
        },
    )?;

    let ready = Mutex::new(Some(ready));
    let _listener = stream
        .add_local_listener_with_user_data(latest)
        .state_changed(move |stream, _, _, new| match new {
            pw::stream::StreamState::Paused | pw::stream::StreamState::Streaming => {
                if let Some(ready) = ready.lock().unwrap().take() {
                    let _ = ready.send(Ok(stream.node_id()));
                }
            }
            pw::stream::StreamState::Error(error) => {
                if let Some(ready) = ready.lock().unwrap().take() {
                    let _ = ready.send(Err(io::Error::other(error.clone()).into()));
                }
            }
            _ => {}
        })
        .process(move |stream, latest| {
            let Some(mut buffer) = stream.dequeue_buffer() else {
                return;
            };
            let Some(data) = buffer.datas_mut().first_mut() else {
                return;
            };
            let Some(target) = data.data() else {
                return;
            };
            let latest = latest.lock().unwrap();
            let len = target.len().min(latest.len());
            target[..len].copy_from_slice(&latest[..len]);
            let chunk = data.chunk_mut();
            *chunk.offset_mut() = 0;
            *chunk.stride_mut() = (width * 4) as i32;
            *chunk.size_mut() = len as u32;
        })
        .register()?;

    let object = pw::spa::pod::object!(
        pw::spa::utils::SpaTypes::ObjectParamFormat,
        pw::spa::param::ParamType::EnumFormat,
        pw::spa::pod::property!(
            pw::spa::param::format::FormatProperties::MediaType,
            Id,
            pw::spa::param::format::MediaType::Video
        ),
        pw::spa::pod::property!(
            pw::spa::param::format::FormatProperties::MediaSubtype,
            Id,
            pw::spa::param::format::MediaSubtype::Raw
        ),
        pw::spa::pod::property!(
            pw::spa::param::format::FormatProperties::VideoFormat,
            Id,
            pw::spa::param::video::VideoFormat::BGRx
        ),
        pw::spa::pod::property!(
            pw::spa::param::format::FormatProperties::VideoSize,
            Rectangle,
            pw::spa::utils::Rectangle { width, height }
        ),
        pw::spa::pod::property!(
            pw::spa::param::format::FormatProperties::VideoFramerate,
            Fraction,
            pw::spa::utils::Fraction { num: 60, denom: 1 }
        ),
    );
    let values = pw::spa::pod::serialize::PodSerializer::serialize(
        std::io::Cursor::new(Vec::new()),
        &pw::spa::pod::Value::Object(object),
    )?
    .0
    .into_inner();
    let mut params = [Pod::from_bytes(&values)
        .ok_or_else(|| io::Error::other("failed to build PipeWire video format"))?];
    stream.connect(
        spa::utils::Direction::Output,
        None,
        pw::stream::StreamFlags::DRIVER | pw::stream::StreamFlags::MAP_BUFFERS,
        &mut params,
    )?;

    while !stop.load(Ordering::Relaxed) {
        mainloop
            .loop_()
            .iterate(pw::loop_::Timeout::Finite(Duration::from_millis(100)));
    }
    Ok(())
}
