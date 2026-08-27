use crate::state::{KestrelState, capture::CaptureRequest};
use smithay::{
    output::WeakOutput,
    wayland::{
        image_capture_source::{
            ImageCaptureSource, ImageCaptureSourceHandler, OutputCaptureSourceHandler,
            OutputCaptureSourceState,
        },
        image_copy_capture::{
            BufferConstraints, CaptureFailureReason, Frame, ImageCopyCaptureHandler,
            ImageCopyCaptureState, Session, SessionRef,
        },
    },
};

impl ImageCaptureSourceHandler for KestrelState {
    fn source_destroyed(&mut self, _source: ImageCaptureSource) {}
}

impl OutputCaptureSourceHandler for KestrelState {
    fn output_capture_source_state(&mut self) -> &mut OutputCaptureSourceState {
        &mut self.protocol_state.output_capture_source
    }

    fn output_source_created(
        &mut self,
        source: ImageCaptureSource,
        output: &smithay::output::Output,
    ) {
        source.user_data().insert_if_missing(|| output.downgrade());
    }
}

impl ImageCopyCaptureHandler for KestrelState {
    fn image_copy_capture_state(&mut self) -> &mut ImageCopyCaptureState {
        &mut self.protocol_state.image_copy_capture
    }

    fn capture_constraints(&mut self, source: &ImageCaptureSource) -> Option<BufferConstraints> {
        if self.session_locked() {
            return None;
        }
        let output = source.user_data().get::<WeakOutput>()?.upgrade()?;
        let mode = output.current_mode()?;
        Some(BufferConstraints {
            size: smithay::utils::Size::from((mode.size.w, mode.size.h)),
            shm: vec![
                smithay::reexports::wayland_server::protocol::wl_shm::Format::Argb8888,
                smithay::reexports::wayland_server::protocol::wl_shm::Format::Xrgb8888,
            ],
            #[cfg(feature = "session-backend")]
            dma: None,
        })
    }

    fn new_session(&mut self, session: Session) {
        self.capture_sessions
            .retain(|session| smithay::utils::IsAlive::alive(&session.as_ref()));
        self.capture_sessions.push(session);
    }

    fn frame(&mut self, session: &SessionRef, frame: Frame) {
        if self.session_locked() {
            frame.fail(CaptureFailureReason::Unknown);
            return;
        }
        let Some(output) = session
            .source()
            .user_data()
            .get::<WeakOutput>()
            .and_then(WeakOutput::upgrade)
        else {
            frame.fail(CaptureFailureReason::Unknown);
            return;
        };
        self.pending_captures.push(CaptureRequest {
            output_name: output.name(),
            draw_cursor: session.draw_cursor(),
            frame,
        });
        self.mark_scene_dirty();
    }
}
