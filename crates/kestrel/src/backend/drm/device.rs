use self::outputs::{ConnectedOutput, descriptors};
use super::{DrmError, dmabuf_feedback::SurfaceDmabufFeedback, redraw::OutputFrameState};
use crate::output::OutputDescriptor;
use luft_config::DisplayConfig;
use smithay::{
    backend::{
        SwapBuffersError,
        allocator::{
            Fourcc,
            dmabuf::Dmabuf,
            gbm::{GbmAllocator, GbmBufferFlags, GbmDevice},
        },
        drm::{
            DrmDevice, DrmDeviceFd, DrmDeviceNotifier, DrmError as SmithayDrmError,
            exporter::gbm::GbmFramebufferExporter,
            output::{DrmOutput, DrmOutputManager, DrmOutputRenderElements},
        },
        egl::{EGLContext, EGLDisplay},
        libinput::{LibinputInputBackend, LibinputSessionInterface},
        renderer::{Bind, gles::GlesRenderer},
        session::{Session, libseat::LibSeatSession, libseat::LibSeatSessionNotifier},
        udev::{UdevBackend, UdevEvent, primary_gpu},
    },
    desktop::utils::OutputPresentationFeedback,
    output::OutputModeSource,
    reexports::{
        drm::{control::crtc, node::DrmNode},
        input::Libinput,
        rustix::fs::OFlags,
        rustix::fs::stat,
        wayland_server::DisplayHandle,
    },
    utils::{DeviceFd, Scale},
};
use tracing::info;

mod output_link;
mod outputs;

const SUPPORTED_COLOR_FORMATS: [Fourcc; 4] = [
    Fourcc::Xrgb8888,
    Fourcc::Xbgr8888,
    Fourcc::Argb8888,
    Fourcc::Abgr8888,
];

pub struct QueuedFrameData {
    pub presentation: OutputPresentationFeedback,
}

type SessionAllocator = GbmAllocator<DrmDeviceFd>;
type SessionExporter = GbmFramebufferExporter<DrmDeviceFd>;
pub type SessionCompositor =
    DrmOutput<SessionAllocator, SessionExporter, QueuedFrameData, DrmDeviceFd>;
pub type SessionRawCompositor = smithay::backend::drm::compositor::DrmCompositor<
    SessionAllocator,
    SessionExporter,
    QueuedFrameData,
    DrmDeviceFd,
>;
type SessionOutputManager =
    DrmOutputManager<SessionAllocator, SessionExporter, QueuedFrameData, DrmDeviceFd>;

pub struct OpenedSessionDevice {
    pub device: SessionDevice,
    pub sources: SessionSources,
}

pub struct SessionSources {
    pub session_notifier: LibSeatSessionNotifier,
    pub udev: UdevBackend,
    pub drm_notifier: DrmDeviceNotifier,
    pub input: LibinputInputBackend,
}

pub struct SessionDevice {
    _session: LibSeatSession,
    pub active_device_id: u64,
    output_manager: SessionOutputManager,
    connected: Vec<ConnectedOutput>,
    outputs: Vec<SessionOutput>,
    primary: usize,
    import_node: Option<DrmNode>,
    libinput: Libinput,
    pub renderer: GlesRenderer,
}

pub fn open(
    _display: &DisplayHandle,
    display_config: &DisplayConfig,
) -> Result<OpenedSessionDevice, DrmError> {
    let (mut session, session_notifier) = LibSeatSession::new().map_err(|error| {
        DrmError::Unsupported(format!("failed to open libseat session: {error}"))
    })?;
    let seat = session.seat();
    let udev = UdevBackend::new(&seat).map_err(|error| {
        DrmError::Unsupported(format!("failed to scan DRM devices on {seat}: {error}"))
    })?;
    let path = primary_gpu(&seat)
        .map_err(|error| {
            DrmError::Unsupported(format!(
                "failed to select a primary DRM device on {seat}: {error}"
            ))
        })?
        .or_else(|| {
            udev.device_list()
                .next()
                .map(|(_, path)| path.to_path_buf())
        })
        .ok_or_else(|| DrmError::Unsupported(format!("no DRM devices found on {seat}")))?;

    let fd = session
        .open(
            &path,
            OFlags::RDWR | OFlags::CLOEXEC | OFlags::NOCTTY | OFlags::NONBLOCK,
        )
        .map_err(|error| {
            DrmError::Unsupported(format!(
                "failed to open {} through libseat: {error}",
                path.display()
            ))
        })?;
    let active_device_id = stat(&path)
        .map_err(|error| {
            DrmError::Unsupported(format!(
                "failed to read DRM device id for {}: {error}",
                path.display()
            ))
        })?
        .st_rdev as u64;
    let drm_fd = DrmDeviceFd::new(DeviceFd::from(fd));
    let (drm, drm_notifier) = DrmDevice::new(drm_fd.clone(), true).map_err(|error| {
        DrmError::Unsupported(format!(
            "failed to initialize DRM device {}: {error}",
            path.display()
        ))
    })?;
    let connected = ConnectedOutput::discover_all(&drm, display_config)?;
    let output = connected
        .iter()
        .find(|output| output.enabled)
        .cloned()
        .ok_or_else(|| {
            DrmError::Unsupported("display configuration disables every output".into())
        })?;

    let gbm = GbmDevice::new(drm_fd.clone())
        .map_err(|error| DrmError::Unsupported(format!("failed to create GBM device: {error}")))?;
    let egl = unsafe { EGLDisplay::new(gbm.clone()) }
        .map_err(|error| DrmError::Unsupported(format!("failed to create EGL display: {error}")))?;
    let context = EGLContext::new(&egl)
        .map_err(|error| DrmError::Unsupported(format!("failed to create EGL context: {error}")))?;
    let mut renderer = unsafe { GlesRenderer::new(context) }.map_err(|error| {
        DrmError::Unsupported(format!("failed to create GLES renderer: {error}"))
    })?;
    let renderer_formats = <GlesRenderer as Bind<Dmabuf>>::supported_formats(&renderer)
        .ok_or_else(|| {
            DrmError::Unsupported("GLES renderer exposes no GBM render formats".to_string())
        })?
        .into_iter()
        .collect::<Vec<_>>();
    let import_node = DrmNode::from_file(&drm_fd).ok();
    let allocator = GbmAllocator::new(
        gbm.clone(),
        GbmBufferFlags::RENDERING | GbmBufferFlags::SCANOUT,
    );
    let exporter = GbmFramebufferExporter::new(gbm.clone(), import_node.into());
    let mut output_manager = DrmOutputManager::new(
        drm,
        allocator,
        exporter,
        Some(gbm.clone()),
        SUPPORTED_COLOR_FORMATS,
        renderer_formats.clone(),
    );
    let outputs = create_session_outputs(
        &mut output_manager,
        &mut renderer,
        connected.iter().filter(|output| output.enabled).cloned(),
    )?;

    let mut libinput = Libinput::new_with_udev(LibinputSessionInterface::from(session.clone()));
    libinput
        .udev_assign_seat(&seat)
        .map_err(|()| DrmError::Unsupported(format!("failed to assign libinput to {seat}")))?;
    let input = LibinputInputBackend::new(libinput.clone());

    info!(
        device = %path.display(),
        connector = %output.descriptor.name,
        width = output.descriptor.size.w,
        height = output.descriptor.size.h,
        refresh_millihertz = output.descriptor.refresh_millihertz,
        "opened DRM session device"
    );

    Ok(OpenedSessionDevice {
        device: SessionDevice {
            _session: session,
            active_device_id,
            output_manager,
            connected,
            outputs,
            primary: 0,
            import_node,
            libinput,
            renderer,
        },
        sources: SessionSources {
            session_notifier,
            udev,
            drm_notifier,
            input,
        },
    })
}

impl SessionDevice {
    pub fn queue_redraw(&mut self, name: &str) {
        if let Some(output) = self.output_by_name_mut(name) {
            output.frame_state.queue_redraw();
        }
    }

    pub fn queue_full_redraws(&mut self) {
        for output in &mut self.outputs {
            output.frame_state.queue_full_redraw();
        }
    }

    pub fn any_output_should_render(&self) -> bool {
        self.outputs
            .iter()
            .any(|output| output.frame_state.redraw_state.should_render())
    }

    pub fn output_by_name_mut(&mut self, name: &str) -> Option<&mut SessionOutput> {
        self.outputs
            .iter_mut()
            .find(|output| output.descriptor.name == name)
    }

    pub fn output_names(&self) -> Vec<String> {
        self.outputs
            .iter()
            .map(|output| output.descriptor.name.clone())
            .collect()
    }

    pub fn renderer_and_output_by_name(
        &mut self,
        name: &str,
    ) -> Option<(&mut GlesRenderer, &mut SessionOutput)> {
        let index = self
            .outputs
            .iter()
            .position(|output| output.descriptor.name == name)?;
        Some((&mut self.renderer, &mut self.outputs[index]))
    }

    pub fn rescan_outputs(&mut self, display_config: &DisplayConfig) -> Result<bool, DrmError> {
        let connected =
            ConnectedOutput::discover_all(self.output_manager.device(), display_config)?;
        let output = connected.iter().find(|output| output.enabled).cloned();
        if !connected.is_empty() && output.is_none() {
            return Err(DrmError::Unsupported(
                "display configuration disables every output".into(),
            ));
        }
        let descriptors = descriptors(&connected);
        let descriptors_changed = self.descriptors() != descriptors;
        let topology_changed = self.connected.len() != connected.len()
            || self
                .connected
                .iter()
                .zip(&connected)
                .any(|(current, next)| !current.matches(next) || current.enabled != next.enabled);
        let primary_changed = match (self.outputs.get(self.primary), output.as_ref()) {
            (Some(current), Some(output)) => !current.output.matches(output),
            (None, None) => false,
            _ => true,
        };
        if !primary_changed && !descriptors_changed && !topology_changed {
            return Ok(false);
        }

        self.reset_surfaces()?;
        drop(std::mem::take(&mut self.outputs));
        self.outputs = create_session_outputs(
            &mut self.output_manager,
            &mut self.renderer,
            connected.iter().filter(|output| output.enabled).cloned(),
        )?;
        self.connected = connected;
        self.discard_pending_frame();
        self.primary = 0;
        Ok(true)
    }

    pub fn handles_udev_event(&self, event: &UdevEvent) -> bool {
        match event {
            UdevEvent::Changed { device_id } | UdevEvent::Removed { device_id } => {
                *device_id == self.active_device_id
            }
            UdevEvent::Added { .. } => false,
        }
    }

    pub fn descriptors(&self) -> Vec<OutputDescriptor> {
        self.connected
            .iter()
            .map(|output| output.descriptor.clone())
            .collect()
    }

    pub fn primary_descriptor(&self) -> Option<&OutputDescriptor> {
        self.outputs
            .get(self.primary)
            .map(|output| &output.descriptor)
    }

    pub fn drm_device_fd(&self) -> DrmDeviceFd {
        self.output_manager.device().device_fd().clone()
    }

    pub fn dmabuf_main_device(&self) -> u64 {
        self.active_device_id
    }

    pub fn frame_pending(&self) -> bool {
        self.outputs.iter().any(SessionOutput::has_pending_frame)
    }

    pub fn discard_pending_frame(&mut self) {
        for output in &mut self.outputs {
            output.discard_pending_frame();
        }
    }

    pub fn frame_submitted(
        &mut self,
        crtc: crtc::Handle,
    ) -> Result<Option<SubmittedFrameInfo>, DrmError> {
        let Some(index) = self
            .outputs
            .iter()
            .position(|output| output.compositor.crtc() == crtc)
        else {
            return Ok(None);
        };
        let output = &mut self.outputs[index];
        if !output.frame_queued {
            return Ok(None);
        }
        let queued = match output
            .compositor
            .frame_submitted()
            .map_err(Into::<SwapBuffersError>::into)
        {
            Ok(queued) => queued,
            Err(error) => {
                output.frame_queued = false;
                match error {
                    SwapBuffersError::AlreadySwapped | SwapBuffersError::TemporaryFailure(_) => {
                        tracing::warn!(output = %output.descriptor.name, "DRM completion failed; scheduling a clean retry");
                        output.frame_state.reject_submission();
                        output
                            .compositor
                            .with_compositor(|compositor| compositor.reset_buffer_ages());
                        return Ok(None);
                    }
                    SwapBuffersError::ContextLost(error)
                        if matches!(
                            error.downcast_ref::<SmithayDrmError>(),
                            Some(SmithayDrmError::TestFailed(_))
                        ) =>
                    {
                        tracing::warn!(output = %output.descriptor.name, %error, "DRM completion state test failed; resetting KMS state");
                        output
                            .compositor
                            .with_compositor(|compositor| compositor.reset_state())
                            .map_err(compositor_error)?;
                        output.frame_state.reject_submission();
                        return Ok(None);
                    }
                    SwapBuffersError::ContextLost(error) => {
                        return Err(DrmError::Unsupported(format!(
                            "DRM completion context was lost: {error}"
                        )));
                    }
                }
            }
        };
        let Some(queued) = queued else {
            tracing::warn!(
                output = %output.descriptor.name,
                "DRM completion advanced Smithay state without presenting the queued Kestrel frame"
            );
            output.frame_queued = false;
            output.frame_state.reject_submission();
            return Ok(None);
        };
        output.frame_queued = false;
        let redraw_needed = output.frame_state.frame_submitted();
        Ok(Some(SubmittedFrameInfo {
            descriptor_name: output.descriptor.name.clone(),
            queued,
            redraw_needed,
            sequence: output.frame_state.frame_callback_sequence,
        }))
    }

    pub fn pause(&mut self) {
        self.libinput.suspend();
        self.discard_pending_frame();
        self.output_manager.pause();
    }

    pub fn activate(&mut self) -> Result<(), DrmError> {
        self.libinput
            .resume()
            .map_err(|()| DrmError::Unsupported("failed to resume libinput context".to_string()))?;
        if let Err(error) = self.output_manager.lock().activate(false) {
            self.libinput.suspend();
            return Err(DrmError::Unsupported(format!(
                "failed to reactivate DRM device: {error}"
            )));
        }
        self.discard_pending_frame();
        Ok(())
    }

    fn reset_surfaces(&mut self) -> Result<(), DrmError> {
        for output in &mut self.outputs {
            output.compositor.reset_buffers();
        }
        Ok(())
    }
}

pub struct SubmittedFrameInfo {
    pub descriptor_name: String,
    pub queued: QueuedFrameData,
    pub redraw_needed: bool,
    pub sequence: u32,
}

pub struct SessionOutput {
    pub descriptor: OutputDescriptor,
    output: ConnectedOutput,
    pub compositor: SessionCompositor,
    pub frame_state: OutputFrameState,
    pub dmabuf_feedback: Option<SurfaceDmabufFeedback>,
    frame_queued: bool,
}

impl SessionOutput {
    pub fn mark_frame_queued(&mut self) {
        self.frame_queued = true;
    }

    pub fn has_pending_frame(&self) -> bool {
        self.frame_queued
    }

    fn discard_pending_frame(&mut self) {
        self.frame_queued = false;
        self.frame_state.discard_pending_frame();
    }
}

fn create_compositor(
    output_manager: &mut SessionOutputManager,
    renderer: &mut GlesRenderer,
    output: &ConnectedOutput,
) -> Result<SessionCompositor, DrmError> {
    let mode_source = OutputModeSource::Static {
        size: output.descriptor.size,
        scale: output_scale(output.descriptor.scale),
        transform: output.descriptor.transform,
    };
    let render_elements = DrmOutputRenderElements::<
        GlesRenderer,
        smithay::backend::renderer::element::solid::SolidColorRenderElement,
    >::new();
    output_manager
        .lock()
        .initialize_output(
            output.crtc,
            output.mode,
            &[output.connector],
            mode_source,
            None,
            renderer,
            &render_elements,
        )
        .map_err(compositor_error)
}

fn create_session_outputs(
    output_manager: &mut SessionOutputManager,
    renderer: &mut GlesRenderer,
    outputs: impl IntoIterator<Item = ConnectedOutput>,
) -> Result<Vec<SessionOutput>, DrmError> {
    outputs
        .into_iter()
        .map(|output| {
            let descriptor = output.descriptor.clone();
            let compositor = create_compositor(output_manager, renderer, &output)?;
            Ok(SessionOutput {
                descriptor,
                output,
                compositor,
                frame_state: OutputFrameState::new(),
                dmabuf_feedback: None,
                frame_queued: false,
            })
        })
        .collect()
}

fn output_scale(scale: f64) -> Scale<f64> {
    Scale::from(scale.clamp(0.5, 4.0))
}

fn compositor_error<E: std::fmt::Display>(error: E) -> DrmError {
    DrmError::Unsupported(format!("DRM compositor error: {error}"))
}
