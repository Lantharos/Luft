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
    scanout::{
        collect_pointer_elements, take_presentation_feedback, update_primary_scanout_output,
    },
    state::{KestrelState, refresh_space},
};
use smithay::{
    backend::{
        SwapBuffersError,
        allocator::dmabuf::AsDmabuf,
        drm::{
            DrmError as SmithayDrmError,
            compositor::{FrameFlags, PrimaryPlaneElement, RenderFrameError},
        },
        renderer::{damage::Error as OutputDamageTrackerError, gles::GlesRenderer},
    },
    output::Output,
    utils::{Monotonic, Time},
};
use std::time::{Duration, Instant};

pub enum FrameResult {
    Idle,
    NoDamage,
    Retry,
    Queued {
        cancel_estimated_vblank: Option<calloop::RegistrationToken>,
    },
}

pub struct SessionFrameRenderer {
    scene: SceneFrameCore,
    frame_clock: FrameClock,
    first_frame_pending: bool,
    direct_scanout_active: Option<bool>,
}

impl SessionFrameRenderer {
    pub fn new(frame_interval: Duration) -> Self {
        Self {
            scene: SceneFrameCore::new(),
            frame_clock: FrameClock::new(frame_interval),
            first_frame_pending: true,
            direct_scanout_active: None,
        }
    }

    pub fn render(
        &mut self,
        state: &mut KestrelState,
        renderer: &mut GlesRenderer,
        output: &Output,
        session_output: &mut SessionOutput,
        force_full_damage: bool,
    ) -> Result<FrameResult, DrmError> {
        if session_output.has_pending_frame() {
            return Ok(FrameResult::Idle);
        }

        let first_frame = self.first_frame_pending;
        let render_started = Instant::now();
        if first_frame {
            tracing::info!(
                output = %session_output.descriptor.name,
                "starting first DRM scene frame"
            );
        }
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
            || self.scene.structural_render_needed(state)
            || removed_windows
            || finished_window_closes
        {
            compositor.with_compositor(|compositor| compositor.reset_buffer_ages());
            self.scene.reset_damage(state);
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
                    target_transform: state.output_transform(),
                },
            )
            .map_err(render_error)?;
        if first_frame {
            tracing::info!(
                output = %session_output.descriptor.name,
                elapsed_ms = render_started.elapsed().as_millis(),
                "prepared first DRM scene frame"
            );
        }
        let output_name = &session_output.descriptor.name;
        if state.has_pending_capture_for_output_mode(output_name, false) {
            let mapping = self.scene.capture_without_cursor(state, renderer);
            state.finish_captures(output_name, false, renderer, mapping);
        }
        let pointer = collect_pointer_elements(state, output, renderer);
        let elements =
            self.scene
                .collect_elements(state, &pointer.surfaces, pointer.memory.as_ref());

        let capture_pending = state.has_pending_capture_for_output(&session_output.descriptor.name);
        let flags_with_scanout = if capture_pending {
            FrameFlags::empty()
        } else {
            FrameFlags::ALLOW_PRIMARY_PLANE_SCANOUT | FrameFlags::ALLOW_CURSOR_PLANE_SCANOUT
        };

        let frame = match compositor
            .render_frame(renderer, &elements, SCENE_CLEAR_COLOR, flags_with_scanout)
            .map_err(|error| match error {
                RenderFrameError::PrepareFrame(error) => SwapBuffersError::from(error),
                RenderFrameError::RenderFrame(OutputDamageTrackerError::Rendering(error)) => {
                    SwapBuffersError::from(error)
                }
                RenderFrameError::RenderFrame(_) => unreachable!(),
            }) {
            Ok(frame) => frame,
            Err(error) => {
                return recover_frame_error(error, state, session_output, &mut self.scene);
            }
        };
        let needs_sync = frame.needs_sync();
        let primary_plane = match &frame.primary_element {
            PrimaryPlaneElement::Swapchain(_) => "swapchain",
            PrimaryPlaneElement::Element(_) => "direct-scanout",
        };
        let direct_scanout = matches!(&frame.primary_element, PrimaryPlaneElement::Element(_));
        let (damage_rectangles, damaged_pixels) = match &frame.primary_element {
            PrimaryPlaneElement::Swapchain(element) => {
                let mut rectangles = 0usize;
                let mut pixels = 0i64;
                if let Some(damage) = element.damage.raw().next() {
                    for rect in damage {
                        rectangles += 1;
                        pixels += i64::from(rect.size.w) * i64::from(rect.size.h);
                    }
                }
                (rectangles, pixels)
            }
            PrimaryPlaneElement::Element(_) => (
                1,
                i64::from(session_output.descriptor.size.w)
                    * i64::from(session_output.descriptor.size.h),
            ),
        };
        if self.direct_scanout_active != Some(direct_scanout) {
            tracing::info!(
                output = %session_output.descriptor.name,
                primary_plane,
                "DRM primary plane path changed"
            );
            self.direct_scanout_active = Some(direct_scanout);
        }
        if first_frame {
            tracing::info!(
                output = %session_output.descriptor.name,
                elapsed_ms = render_started.elapsed().as_millis(),
                elements = elements.len(),
                empty = frame.is_empty,
                needs_sync,
                primary_plane,
                "rendered first DRM scene frame"
            );
        }
        tracing::trace!(
            output = %session_output.descriptor.name,
            elapsed_us = render_started.elapsed().as_micros(),
            elements = elements.len(),
            empty = frame.is_empty,
            needs_sync,
            primary_plane,
            damage_rectangles,
            damaged_pixels,
            "rendered DRM frame"
        );

        let render_element_states = frame.states.clone();
        update_primary_scanout_output(state, output, &render_element_states);
        if let Some(feedback) = session_output.dmabuf_feedback.as_ref() {
            send_dmabuf_feedbacks(state, output, feedback, &render_element_states);
        }

        if frame.is_empty {
            self.first_frame_pending = false;
            session_output.frame_state.rendered();
            state.refresh_idle_inhibition();
            return Ok(FrameResult::NoDamage);
        }

        if needs_sync && let PrimaryPlaneElement::Swapchain(element) = &frame.primary_element {
            let wait_started = Instant::now();
            if first_frame {
                tracing::info!(
                    output = %session_output.descriptor.name,
                    exportable = element.sync.is_exportable(),
                    reached = element.sync.is_reached(),
                    "waiting for first DRM render fence"
                );
            }
            if let Err(error) = element.sync.wait() {
                tracing::warn!(%error, "failed to synchronize DRM swapchain frame");
            }
            if first_frame {
                tracing::info!(
                    output = %session_output.descriptor.name,
                    elapsed_ms = wait_started.elapsed().as_millis(),
                    "first DRM render fence completed"
                );
            }
        }
        if capture_pending {
            if let PrimaryPlaneElement::Swapchain(element) = &frame.primary_element {
                match element.buffer().export() {
                    Ok(dmabuf) => state.capture_dmabuf(
                        &session_output.descriptor.name,
                        true,
                        renderer,
                        &dmabuf,
                    ),
                    Err(error) => {
                        tracing::warn!(%error, "failed to export DRM capture buffer");
                        state.fail_captures_for_output(&session_output.descriptor.name);
                    }
                }
            } else {
                state.fail_captures_for_output(&session_output.descriptor.name);
            }
        }

        let presentation = take_presentation_feedback(state, output, &render_element_states);
        if let Err(error) = compositor
            .queue_frame(QueuedFrameData { presentation })
            .map_err(Into::<SwapBuffersError>::into)
        {
            return recover_frame_error(error, state, session_output, &mut self.scene);
        }
        if first_frame {
            tracing::info!(
                output = %session_output.descriptor.name,
                elapsed_ms = render_started.elapsed().as_millis(),
                "queued first DRM scene frame"
            );
            self.first_frame_pending = false;
        }
        state.refresh_idle_inhibition();
        tracing::trace!(output = %session_output.descriptor.name, "queued DRM frame");
        session_output.mark_frame_queued();
        session_output.frame_state.rendered();
        let cancel_estimated_vblank = session_output.frame_state.mark_waiting_for_vblank();

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

    pub fn next_presentation_delay(&self) -> Duration {
        self.frame_clock.next_presentation_delay()
    }

    pub fn reset_for_output(&mut self, state: &KestrelState) {
        let frame_interval = refresh_interval(state.output_refresh_millihertz());
        self.frame_clock.set_refresh(frame_interval);
        self.scene.reset_for_output(state);
    }
}

fn recover_frame_error(
    error: SwapBuffersError,
    state: &KestrelState,
    session_output: &mut SessionOutput,
    scene: &mut SceneFrameCore,
) -> Result<FrameResult, DrmError> {
    match error {
        SwapBuffersError::TemporaryFailure(error) => {
            tracing::warn!(output = %session_output.descriptor.name, %error, "temporary DRM frame failure; scheduling a clean retry");
            session_output.frame_state.reject_submission();
            session_output
                .compositor
                .with_compositor(|compositor| compositor.reset_buffer_ages());
            scene.reset_damage(state);
            Ok(FrameResult::Retry)
        }
        SwapBuffersError::AlreadySwapped => {
            tracing::warn!(output = %session_output.descriptor.name, "DRM frame was already submitted; scheduling a clean retry");
            session_output.frame_state.reject_submission();
            scene.reset_damage(state);
            Ok(FrameResult::Retry)
        }
        SwapBuffersError::ContextLost(error)
            if matches!(
                error.downcast_ref::<SmithayDrmError>(),
                Some(SmithayDrmError::TestFailed(_))
            ) =>
        {
            tracing::warn!(output = %session_output.descriptor.name, %error, "DRM state test failed; resetting KMS state before retry");
            session_output
                .compositor
                .with_compositor(|compositor| compositor.reset_state())
                .map_err(compositor_error)?;
            session_output.frame_state.reject_submission();
            scene.reset_damage(state);
            Ok(FrameResult::Retry)
        }
        SwapBuffersError::ContextLost(error) => Err(DrmError::Unsupported(format!(
            "DRM rendering context was lost: {error}"
        ))),
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
