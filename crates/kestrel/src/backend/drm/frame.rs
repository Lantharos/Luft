use super::{
    DrmError,
    device::{QueuedFrameData, SessionOutput},
    dmabuf_feedback::send_dmabuf_feedbacks,
    redraw::RedrawState,
};
use crate::{
    damage::SCENE_CLEAR_COLOR,
    frame_clock::FrameClock,
    frame_clock::FrameTime,
    render::{SceneFrameCore, SceneFrameInput},
    scanout::{collect_pointer_elements, take_presentation_feedback, update_primary_scanout_output},
    scene_handle::SceneDrawSession,
    state::{refresh_space, KestrelState},
};
use smithay::{
    backend::{
        drm::compositor::FrameFlags,
        renderer::gles::GlesRenderer,
    },
    output::Output,
    utils::{Monotonic, Time},
};
use std::time::Duration;

pub enum FrameResult {
    Idle,
    NoDamage,
    Queued {
        cancel_estimated_vblank: Option<calloop::RegistrationToken>,
    },
}

pub fn render_secondary_output(
    frame_renderer: &mut SessionFrameRenderer,
    state: &mut KestrelState,
    renderer: &mut GlesRenderer,
    output: &Output,
    session_output: &mut SessionOutput,
    force_full_damage: bool,
) -> Result<bool, DrmError> {
    if session_output.has_pending_frame() {
        return Ok(false);
    }

    match frame_renderer.render(
        state,
        renderer,
        output,
        session_output,
        force_full_damage,
        false,
    )? {
        FrameResult::Queued { .. } => Ok(true),
        FrameResult::NoDamage | FrameResult::Idle => Ok(false),
    }
}

pub struct SessionFrameRenderer {
    scene: SceneFrameCore,
    frame_clock: FrameClock,
}

impl SessionFrameRenderer {
    pub fn new(_state: &KestrelState, frame_interval: Duration) -> Self {
        Self {
            scene: SceneFrameCore::new(),
            frame_clock: FrameClock::new(frame_interval),
        }
    }

    pub fn render(
        &mut self,
        state: &mut KestrelState,
        renderer: &mut GlesRenderer,
        output: &Output,
        session_output: &mut SessionOutput,
        force_full_damage: bool,
        clear_state: bool,
    ) -> Result<FrameResult, DrmError> {
        let compositor = &mut session_output.compositor;
        let removed_windows = state.remove_dead_windows();
        let finished_window_closes = state.send_finished_window_closes();
        state.cleanup_layers();
        state.cleanup_output();

        let content_render_needed = self.scene.content_render_needed(
            state,
            removed_windows,
            finished_window_closes,
            force_full_damage,
        );

        if !content_render_needed {
            if session_output.frame_state.redraw_state.should_render() {
                session_output.frame_state.redraw_state = RedrawState::Idle;
            }
            return Ok(FrameResult::Idle);
        }

        if force_full_damage
            || removed_windows
            || finished_window_closes
            || state.scene_structural_dirty()
            || state.scene_content_dirty()
        {
            compositor.reset_buffer_ages();
        }

        refresh_space(state);

        self.scene
            .prepare(
                renderer,
                SceneFrameInput {
                    state,
                    removed_windows,
                    finished_window_closes,
                    force_full_damage,
                },
            )
            .map_err(render_error)?;
        let pointer = collect_pointer_elements(state, output, renderer);
        let elements = SceneDrawSession::enter(&self.scene.scratch, || {
            self.scene.collect_elements(state, &pointer.surfaces)
        });

        let flags_with_scanout = FrameFlags::ALLOW_PRIMARY_PLANE_SCANOUT
            | FrameFlags::ALLOW_PRIMARY_PLANE_SCANOUT_ANY
            | FrameFlags::ALLOW_CURSOR_PLANE_SCANOUT;
        let flags_composited = FrameFlags::ALLOW_CURSOR_PLANE_SCANOUT;

        let mut frame = compositor
            .render_frame(renderer, &elements, SCENE_CLEAR_COLOR, flags_with_scanout)
            .map_err(compositor_error)?;
        if frame.is_empty && !elements.is_empty() {
            compositor.reset_buffer_ages();
            frame = compositor
                .render_frame(renderer, &elements, SCENE_CLEAR_COLOR, flags_composited)
                .map_err(compositor_error)?;
        }
        if frame.is_empty && !elements.is_empty() {
            compositor.reset_buffers();
            frame = compositor
                .render_frame(renderer, &elements, SCENE_CLEAR_COLOR, FrameFlags::empty())
                .map_err(compositor_error)?;
        }

        let render_element_states = frame.states.clone();
        update_primary_scanout_output(state, output, &render_element_states);
        if let Some(feedback) = session_output.dmabuf_feedback.as_ref() {
            send_dmabuf_feedbacks(state, output, feedback, &render_element_states);
        }

        if frame.is_empty {
            return Ok(FrameResult::NoDamage);
        }

        let presentation = take_presentation_feedback(state, output, &render_element_states);
        compositor
            .queue_frame(QueuedFrameData { presentation })
            .map_err(compositor_error)?;
        session_output.mark_frame_queued();
        let cancel_estimated_vblank = session_output.frame_state.mark_waiting_for_vblank();
        session_output.frame_state.frame_callback_sequence = session_output
            .frame_state
            .frame_callback_sequence
            .wrapping_add(1);

        if clear_state {
            state.clear_frame_dirty();
        }
        Ok(FrameResult::Queued {
            cancel_estimated_vblank,
        })
    }

    pub fn reset_damage(&mut self, state: &KestrelState) {
        self.scene.reset_damage(state);
    }

    pub fn frame_presented(&mut self, presentation: Option<(Time<Monotonic>, u64)>) -> FrameTime {
        match presentation {
            Some((time, sequence)) => self.frame_clock.frame_at_sequence(time, sequence),
            None => self.frame_clock.next_frame(),
        }
    }

    pub fn reset_for_output(&mut self, state: &KestrelState) {
        let frame_interval = refresh_interval(state.output_refresh_millihertz());
        self.frame_clock.set_refresh(frame_interval);
        self.scene.reset_for_output(state);
    }
}

fn compositor_error<E: std::fmt::Display>(error: E) -> DrmError {
    DrmError::Unsupported(format!("DRM compositor error: {error}"))
}

fn render_error(error: impl std::fmt::Display) -> DrmError {
    DrmError::Unsupported(format!("failed to render DRM frame: {error}"))
}

fn refresh_interval(refresh_millihertz: i32) -> Duration {
    let refresh = u64::try_from(refresh_millihertz)
        .ok()
        .filter(|refresh| *refresh > 0)
        .unwrap_or(crate::output::DEFAULT_REFRESH_MILLIHERTZ as u64);
    Duration::from_nanos((1_000_000_000_000u64 + refresh / 2) / refresh)
}
