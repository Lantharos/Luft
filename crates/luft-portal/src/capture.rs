use std::{
    fs::File,
    io,
    os::fd::AsFd,
    sync::{
        Arc,
        atomic::{AtomicBool, Ordering},
    },
    time::Duration,
};

use memmap2::{MmapMut, MmapOptions};
use rustix::event::{PollFd, PollFlags, Timespec, poll};
use wayland_client::{
    Connection, Dispatch, EventQueue, QueueHandle, WEnum, delegate_noop,
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

pub struct CapturedFrame {
    pub width: u32,
    pub height: u32,
    pub bgra: Vec<u8>,
}

impl CapturedFrame {
    pub fn into_rgba(mut self) -> Vec<u8> {
        for pixel in self.bgra.chunks_exact_mut(4) {
            pixel.swap(0, 2);
            pixel[3] = u8::MAX;
        }
        self.bgra
    }
}

pub struct CaptureClient {
    connection: Connection,
    queue: EventQueue<CaptureState>,
    state: CaptureState,
    session: ext_image_copy_capture_session_v1::ExtImageCopyCaptureSessionV1,
    buffer: wl_buffer::WlBuffer,
    _file: File,
    mapping: MmapMut,
}

impl CaptureClient {
    pub fn connect(draw_cursor: bool) -> Result<Self> {
        let connection = Connection::connect_to_env()?;
        let mut queue = connection.new_event_queue();
        let qh = queue.handle();
        connection.display().get_registry(&qh, ());
        let mut state = CaptureState::default();
        queue.roundtrip(&mut state)?;

        let output = state
            .output
            .as_ref()
            .ok_or_else(|| io::Error::other("Luft has no capturable output"))?;
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
        queue.roundtrip(&mut state)?;

        if !state.constraints_done {
            return Err(io::Error::other("capture constraints were not advertised").into());
        }
        if !state.argb8888 && !state.xrgb8888 {
            return Err(io::Error::other("capture does not support a CPU-readable format").into());
        }

        let width = state.width;
        let height = state.height;
        let stride = width
            .checked_mul(4)
            .ok_or_else(|| io::Error::other("capture width is too large"))?;
        let len = stride
            .checked_mul(height)
            .ok_or_else(|| io::Error::other("capture buffer is too large"))?;
        let file = tempfile::tempfile()?;
        file.set_len(u64::from(len))?;
        let mapping = unsafe { MmapOptions::new().len(len as usize).map_mut(&file)? };
        let shm = state
            .shm
            .as_ref()
            .ok_or_else(|| io::Error::other("wl_shm unavailable"))?;
        let pool = shm.create_pool(file.as_fd(), len as i32, &qh, ());
        let format = if state.argb8888 {
            wl_shm::Format::Argb8888
        } else {
            wl_shm::Format::Xrgb8888
        };
        let buffer = pool.create_buffer(
            0,
            width as i32,
            height as i32,
            stride as i32,
            format,
            &qh,
            (),
        );
        pool.destroy();

        Ok(Self {
            connection,
            queue,
            state,
            session,
            buffer,
            _file: file,
            mapping,
        })
    }

    pub fn capture(&mut self, stop: Option<&Arc<AtomicBool>>) -> Result<Option<CapturedFrame>> {
        self.state.frame_ready = false;
        self.state.frame_failed = false;
        let qh = self.queue.handle();
        let frame = self.session.create_frame(&qh, ());
        frame.attach_buffer(&self.buffer);
        frame.damage_buffer(0, 0, self.state.width as i32, self.state.height as i32);
        frame.capture();
        self.queue.flush()?;

        while !self.state.frame_ready && !self.state.frame_failed && !self.state.stopped {
            if stop.is_some_and(|stop| stop.load(Ordering::Relaxed)) {
                frame.destroy();
                return Ok(None);
            }
            self.dispatch_with_timeout(Duration::from_millis(100))?;
        }
        frame.destroy();

        if self.state.frame_ready {
            Ok(Some(CapturedFrame {
                width: self.state.width,
                height: self.state.height,
                bgra: self.mapping.to_vec(),
            }))
        } else if self.state.stopped {
            Err(io::Error::other("capture source stopped").into())
        } else {
            Err(io::Error::other("compositor rejected capture frame").into())
        }
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
    output: Option<wl_output::WlOutput>,
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
            "wl_output" if state.output.is_none() => {
                state.output = Some(registry.bind(name, version.min(4), qh, ()));
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

delegate_noop!(CaptureState: ignore wl_output::WlOutput);
delegate_noop!(CaptureState: ignore wl_shm::WlShm);
delegate_noop!(CaptureState: ignore wl_shm_pool::WlShmPool);
delegate_noop!(CaptureState: ignore wl_buffer::WlBuffer);
delegate_noop!(CaptureState: ignore ext_image_capture_source_v1::ExtImageCaptureSourceV1);
delegate_noop!(CaptureState: ignore ext_output_image_capture_source_manager_v1::ExtOutputImageCaptureSourceManagerV1);
delegate_noop!(CaptureState: ignore ext_image_copy_capture_manager_v1::ExtImageCopyCaptureManagerV1);
