use std::{
    collections::BTreeMap,
    fs::File,
    io,
    os::fd::AsFd,
    sync::{
        Arc,
        atomic::{AtomicBool, Ordering},
    },
    time::{Duration, Instant},
};

use memmap2::{MmapMut, MmapOptions};
use rustix::event::{PollFd, PollFlags, Timespec, poll};
use wayland_client::{
    Connection, Dispatch, EventQueue, Proxy, QueueHandle, WEnum, delegate_noop,
    protocol::{wl_buffer, wl_output, wl_registry, wl_shm, wl_shm_pool},
};
use wayland_protocols::ext::{
    image_capture_source::v1::client::{
        ext_image_capture_source_v1, ext_output_image_capture_source_manager_v1,
    },
    image_copy_capture::v1::client::{
        ext_image_copy_capture_frame_v1, ext_image_copy_capture_manager_v1,
        ext_image_copy_capture_session_v1,
    },
};

type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

const EVENT_POLL_INTERVAL: Duration = Duration::from_millis(50);

impl CaptureClient {
    pub fn rgba(&self) -> Vec<u8> {
        let mut rgba = self.mapping.to_vec();
        for pixel in rgba.chunks_exact_mut(4) {
            pixel.swap(0, 2);
            pixel[3] = u8::MAX;
        }
        rgba
    }
}

pub struct CaptureClient {
    connection: Connection,
    queue: EventQueue<CaptureState>,
    state: CaptureState,
    objects: CaptureObjects,
    _file: File,
    mapping: MmapMut,
}

#[derive(Default)]
struct CaptureObjects {
    source: Option<ext_image_capture_source_v1::ExtImageCaptureSourceV1>,
    session: Option<ext_image_copy_capture_session_v1::ExtImageCopyCaptureSessionV1>,
    buffer: Option<wl_buffer::WlBuffer>,
}

impl CaptureObjects {
    fn destroy(&mut self) {
        if let Some(session) = self.session.take() {
            session.destroy();
        }
        if let Some(source) = self.source.take() {
            source.destroy();
        }
        if let Some(buffer) = self.buffer.take() {
            buffer.destroy();
        }
    }
}

impl Drop for CaptureObjects {
    fn drop(&mut self) {
        self.destroy();
    }
}

impl Drop for CaptureClient {
    fn drop(&mut self) {
        self.objects.destroy();
        self.state.destroy_globals();
        let _ = self.connection.flush();
    }
}

impl CaptureClient {
    pub fn connect(connection: Connection, output_name: &str, draw_cursor: bool) -> Result<Self> {
        let mut queue = connection.new_event_queue();
        let qh = queue.handle();
        connection.display().get_registry(&qh, ());
        let mut state = CaptureState::default();
        queue.roundtrip(&mut state)?;
        queue.roundtrip(&mut state)?;

        let output = state
            .outputs
            .iter()
            .find(|output| {
                state
                    .output_names
                    .get(output.data::<u32>().expect("wl_output registry name"))
                    .is_some_and(|name| name == output_name)
            })
            .ok_or_else(|| {
                io::Error::other(format!("capture output {output_name:?} is unavailable"))
            })?;
        let source = state
            .source_manager
            .as_ref()
            .ok_or_else(|| io::Error::other("image capture source protocol unavailable"))?
            .create_source(output, &qh, ());
        let options = if draw_cursor {
            ext_image_copy_capture_manager_v1::Options::PaintCursors
        } else {
            ext_image_copy_capture_manager_v1::Options::empty()
        };
        let session = state
            .capture_manager
            .as_ref()
            .ok_or_else(|| io::Error::other("image copy capture protocol unavailable"))?
            .create_session(&source, options, &qh, ());
        let mut objects = CaptureObjects {
            source: Some(source),
            session: Some(session),
            buffer: None,
        };
        queue.roundtrip(&mut state)?;

        if !state.constraints_done {
            return Err(io::Error::other("capture constraints were not advertised").into());
        }
        if !state.argb8888 && !state.xrgb8888 {
            return Err(io::Error::other("capture does not support a CPU-readable format").into());
        }

        let width = state.width;
        let height = state.height;
        let width_i32 = i32::try_from(width)
            .map_err(|_| io::Error::other("capture width exceeds Wayland limits"))?;
        let height_i32 = i32::try_from(height)
            .map_err(|_| io::Error::other("capture height exceeds Wayland limits"))?;
        if width_i32 == 0 || height_i32 == 0 {
            return Err(io::Error::other("capture source has an empty buffer size").into());
        }
        let stride = width
            .checked_mul(4)
            .ok_or_else(|| io::Error::other("capture width is too large"))?;
        let stride_i32 = i32::try_from(stride)
            .map_err(|_| io::Error::other("capture stride exceeds Wayland limits"))?;
        let len = stride
            .checked_mul(height)
            .ok_or_else(|| io::Error::other("capture buffer is too large"))?;
        let len_i32 = i32::try_from(len)
            .map_err(|_| io::Error::other("capture buffer exceeds Wayland limits"))?;
        let file = tempfile::tempfile()?;
        file.set_len(u64::from(len))?;
        let mapping = unsafe { MmapOptions::new().len(len as usize).map_mut(&file)? };
        let shm = state
            .shm
            .as_ref()
            .ok_or_else(|| io::Error::other("wl_shm unavailable"))?;
        let pool = shm.create_pool(file.as_fd(), len_i32, &qh, ());
        let format = if state.argb8888 {
            wl_shm::Format::Argb8888
        } else {
            wl_shm::Format::Xrgb8888
        };
        let buffer = pool.create_buffer(0, width_i32, height_i32, stride_i32, format, &qh, ());
        pool.destroy();
        objects.buffer = Some(buffer);

        Ok(Self {
            connection,
            queue,
            state,
            objects,
            _file: file,
            mapping,
        })
    }

    pub fn size(&self) -> (u32, u32) {
        (self.state.width, self.state.height)
    }

    pub fn bgra(&self) -> &[u8] {
        &self.mapping
    }

    pub fn capture(&mut self, stop: Option<&Arc<AtomicBool>>, timeout: Duration) -> Result<bool> {
        self.state.frame_ready = false;
        self.state.frame_failed = false;
        let qh = self.queue.handle();
        let frame = self
            .objects
            .session
            .as_ref()
            .expect("capture session is alive")
            .create_frame(&qh, ());
        frame.attach_buffer(
            self.objects
                .buffer
                .as_ref()
                .expect("capture buffer is alive"),
        );
        frame.damage_buffer(0, 0, self.state.width as i32, self.state.height as i32);
        frame.capture();
        let result = (|| {
            self.queue.flush()?;
            let deadline = Instant::now() + timeout;

            while !self.state.frame_ready && !self.state.frame_failed && !self.state.stopped {
                if stop.is_some_and(|stop| stop.load(Ordering::Relaxed)) {
                    return Ok(false);
                }
                let remaining = deadline.saturating_duration_since(Instant::now());
                if remaining.is_zero() {
                    return Err(
                        io::Error::new(io::ErrorKind::TimedOut, "capture frame timed out").into(),
                    );
                }
                self.dispatch_with_timeout(remaining.min(EVENT_POLL_INTERVAL))?;
            }

            if self.state.frame_ready {
                Ok(true)
            } else if self.state.stopped {
                Err(io::Error::other("capture source stopped").into())
            } else {
                Err(io::Error::other("compositor rejected capture frame").into())
            }
        })();
        frame.destroy();
        result
    }

    fn dispatch_with_timeout(&mut self, timeout: Duration) -> Result<()> {
        if self.queue.dispatch_pending(&mut self.state)? > 0 {
            return Ok(());
        }
        let Some(guard) = self.queue.prepare_read() else {
            self.queue.dispatch_pending(&mut self.state)?;
            return Ok(());
        };
        let mut fds = [PollFd::new(
            &self.connection,
            PollFlags::IN | PollFlags::ERR,
        )];
        let timeout = Timespec::try_from(timeout)?;
        if poll(&mut fds, Some(&timeout))? > 0 {
            guard.read()?;
            self.queue.dispatch_pending(&mut self.state)?;
        }
        Ok(())
    }
}

#[derive(Default)]
struct CaptureState {
    shm: Option<wl_shm::WlShm>,
    outputs: Vec<wl_output::WlOutput>,
    output_names: BTreeMap<u32, String>,
    source_manager:
        Option<ext_output_image_capture_source_manager_v1::ExtOutputImageCaptureSourceManagerV1>,
    capture_manager: Option<ext_image_copy_capture_manager_v1::ExtImageCopyCaptureManagerV1>,
    width: u32,
    height: u32,
    argb8888: bool,
    xrgb8888: bool,
    constraints_done: bool,
    frame_ready: bool,
    frame_failed: bool,
    stopped: bool,
}

impl CaptureState {
    fn destroy_globals(&mut self) {
        if let Some(manager) = self.capture_manager.take() {
            manager.destroy();
        }
        if let Some(manager) = self.source_manager.take() {
            manager.destroy();
        }
        for output in self.outputs.drain(..) {
            if output.version() >= 3 {
                output.release();
            }
        }
    }
}

impl Drop for CaptureState {
    fn drop(&mut self) {
        self.destroy_globals();
    }
}

impl Dispatch<wl_registry::WlRegistry, ()> for CaptureState {
    fn event(
        state: &mut Self,
        registry: &wl_registry::WlRegistry,
        event: wl_registry::Event,
        _: &(),
        _: &Connection,
        qh: &QueueHandle<Self>,
    ) {
        let wl_registry::Event::Global {
            name,
            interface,
            version,
        } = event
        else {
            return;
        };
        match interface.as_str() {
            "wl_shm" if state.shm.is_none() => {
                state.shm = Some(registry.bind(name, version.min(1), qh, ()));
            }
            "wl_output" => {
                state
                    .outputs
                    .push(registry.bind(name, version.min(4), qh, name));
            }
            "ext_output_image_capture_source_manager_v1" if state.source_manager.is_none() => {
                state.source_manager = Some(registry.bind(name, version.min(1), qh, ()));
            }
            "ext_image_copy_capture_manager_v1" if state.capture_manager.is_none() => {
                state.capture_manager = Some(registry.bind(name, version.min(1), qh, ()));
            }
            _ => {}
        }
    }
}

impl Dispatch<ext_image_copy_capture_session_v1::ExtImageCopyCaptureSessionV1, ()>
    for CaptureState
{
    fn event(
        state: &mut Self,
        _: &ext_image_copy_capture_session_v1::ExtImageCopyCaptureSessionV1,
        event: ext_image_copy_capture_session_v1::Event,
        _: &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        match event {
            ext_image_copy_capture_session_v1::Event::BufferSize { width, height } => {
                state.width = width;
                state.height = height;
            }
            ext_image_copy_capture_session_v1::Event::ShmFormat {
                format: WEnum::Value(wl_shm::Format::Argb8888),
            } => state.argb8888 = true,
            ext_image_copy_capture_session_v1::Event::ShmFormat {
                format: WEnum::Value(wl_shm::Format::Xrgb8888),
            } => state.xrgb8888 = true,
            ext_image_copy_capture_session_v1::Event::Done => {
                state.constraints_done = true;
            }
            ext_image_copy_capture_session_v1::Event::Stopped => state.stopped = true,
            _ => {}
        }
    }
}

impl Dispatch<ext_image_copy_capture_frame_v1::ExtImageCopyCaptureFrameV1, ()> for CaptureState {
    fn event(
        state: &mut Self,
        _: &ext_image_copy_capture_frame_v1::ExtImageCopyCaptureFrameV1,
        event: ext_image_copy_capture_frame_v1::Event,
        _: &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        match event {
            ext_image_copy_capture_frame_v1::Event::Ready => state.frame_ready = true,
            ext_image_copy_capture_frame_v1::Event::Failed { .. } => state.frame_failed = true,
            _ => {}
        }
    }
}

impl Dispatch<wl_output::WlOutput, u32> for CaptureState {
    fn event(
        state: &mut Self,
        _: &wl_output::WlOutput,
        event: wl_output::Event,
        registry_name: &u32,
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let wl_output::Event::Name { name } = event {
            state.output_names.insert(*registry_name, name);
        }
    }
}
delegate_noop!(CaptureState: ignore wl_shm::WlShm);
delegate_noop!(CaptureState: ignore wl_shm_pool::WlShmPool);
delegate_noop!(CaptureState: ignore wl_buffer::WlBuffer);
delegate_noop!(CaptureState: ignore ext_image_capture_source_v1::ExtImageCaptureSourceV1);
delegate_noop!(CaptureState: ignore ext_output_image_capture_source_manager_v1::ExtOutputImageCaptureSourceManagerV1);
delegate_noop!(CaptureState: ignore ext_image_copy_capture_manager_v1::ExtImageCopyCaptureManagerV1);
