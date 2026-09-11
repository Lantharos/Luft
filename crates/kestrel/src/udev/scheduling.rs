use super::*;
use smithay::{
    desktop::layer_map_for_output, wayland::commit_timing::CommitTimerBarrierStateUserData,
};

#[derive(Default)]
pub(super) struct FrameSchedule {
    pub dirty: bool,
    pub pending: bool,
    pub unavailable: bool,
    pub timer: Option<RegistrationToken>,
    timer_at: Option<Time<Monotonic>>,
    samples: [Duration; 16],
    sample_index: usize,
    deadline_margin: Duration,
    last_attempt: Option<Time<Monotonic>>,
    retry_at: Option<Time<Monotonic>>,
}

impl FrameSchedule {
    pub fn new() -> Self {
        Self {
            dirty: true,
            ..Self::default()
        }
    }

    pub fn retry(&mut self, now: Time<Monotonic>, interval: Duration) {
        self.dirty = true;
        self.retry_at = Some(now + interval);
    }

    pub fn reset_timing(
        &mut self,
        handle: &smithay::reexports::calloop::LoopHandle<'static, KestrelState<UdevData>>,
    ) {
        if let Some(timer) = self.timer.take() {
            handle.remove(timer);
        }
        let pending = self.pending;
        *self = Self::new();
        self.pending = pending;
    }

    pub fn record(&mut self, elapsed: Duration) {
        self.samples[self.sample_index] = elapsed;
        self.sample_index = (self.sample_index + 1) % self.samples.len();
    }

    pub fn presented(&mut self, timestamp: Time<Monotonic>, interval: Duration) {
        if let Some(target) = self.last_attempt {
            let late = Time::elapsed(&target, timestamp);
            if late > interval / 2 {
                self.deadline_margin = (self.deadline_margin + late).min(interval);
            } else {
                self.deadline_margin = self.deadline_margin.mul_f64(0.99);
            }
            tracing::trace!(?interval, ?late, budget = ?self.budget(interval), "output frame timing");
        }
    }

    fn budget(&self, interval: Duration) -> Duration {
        let measured = self.samples.iter().copied().max().unwrap_or_default();
        if measured.is_zero() {
            interval
        } else {
            (measured + measured / 4 + interval / 20 + self.deadline_margin).min(interval)
        }
    }
}

impl KestrelState<UdevData> {
    pub(super) fn schedule_repaints(&mut self) {
        if !self.backend_data.session.is_active() {
            return;
        }
        let now = self.clock.now();
        let outputs = self.space.outputs().cloned().collect::<Vec<_>>();
        for output in outputs {
            let Some(id) = output.user_data().get::<UdevOutputId>() else {
                continue;
            };
            let Some(mode) = output.current_mode().filter(|mode| mode.refresh > 0) else {
                continue;
            };
            let interval = Duration::from_nanos(1_000_000_000_000 / mode.refresh as u64);
            let animation = self.output_animating(&output);
            let (commit_deadline, pending_callbacks) = self.output_deadlines(&output);
            let Some(surface) = self
                .backend_data
                .backends
                .get_mut(&id.device_id)
                .and_then(|device| device.surfaces.get_mut(&id.crtc))
            else {
                continue;
            };
            let schedule = &mut surface.schedule;
            if schedule.pending || schedule.unavailable {
                continue;
            }
            let callback_deadline = pending_callbacks.then(|| {
                schedule.last_attempt.unwrap_or(now)
                    + Duration::from_secs(1)
                    + Duration::from_nanos(1)
            });
            let next_deadline = commit_deadline.into_iter().chain(callback_deadline).min();
            let earliest = if schedule.dirty || animation {
                now
            } else if let Some(deadline) = next_deadline {
                deadline
            } else {
                continue;
            };
            let anchor = surface.last_presentation_time.or(schedule.last_attempt);
            let target = if let Some(anchor) = anchor {
                let elapsed = Time::elapsed(&anchor, earliest);
                let frames = elapsed.as_nanos() / interval.as_nanos() + 1;
                anchor + interval.mul_f64(frames as f64)
            } else {
                earliest
            };
            let delay = Duration::from(target)
                .saturating_sub(now.into())
                .saturating_sub(schedule.budget(interval));
            let delay = schedule.retry_at.map_or(delay, |retry| {
                delay.max(Duration::from(retry).saturating_sub(now.into()))
            });
            let timer_at = now + delay;
            if schedule.timer.is_some() && schedule.timer_at.is_some_and(|at| at <= timer_at) {
                continue;
            }
            if let Some(timer) = schedule.timer.take() {
                self.handle.remove(timer);
            }
            schedule.timer_at = Some(timer_at);
            let node = id.device_id;
            let crtc = id.crtc;
            let token = self
                .handle
                .insert_source(Timer::from_duration(delay), move |_, _, state| {
                    if let Some(surface) = state
                        .backend_data
                        .backends
                        .get_mut(&node)
                        .and_then(|device| device.surfaces.get_mut(&crtc))
                    {
                        surface.schedule.timer = None;
                        surface.schedule.timer_at = None;
                        surface.schedule.dirty = false;
                        surface.schedule.retry_at = None;
                        surface.schedule.last_attempt = Some(target);
                        state.render_surface(node, crtc, target);
                    }
                    TimeoutAction::Drop
                })
                .expect("failed to schedule output repaint");
            schedule.timer = Some(token);
        }
    }

    pub(super) fn output_animating(&self, output: &Output) -> bool {
        let now = Instant::now();
        self.space.elements_for_output(output).any(|window| {
            window
                .decoration_state()
                .animation
                .is_some_and(|animation| !animation.complete(now))
        }) || self.layer_motion.is_animating(output, now)
            || (self.space.output_geometry(output).is_some_and(|geometry| {
                geometry.to_f64().contains(self.pointer.current_location())
            }) && matches!(&self.cursor_status, CursorImageStatus::Named(icon) if self.backend_data.pointer_image.is_animated(icon.name(), output.current_scale().fractional_scale().ceil() as u32)))
    }

    fn output_deadlines(&self, output: &Output) -> (Option<Time<Monotonic>>, bool) {
        let mut deadline = None;
        let mut pending_callbacks = false;
        let mut visit = |surface: &wl_surface::WlSurface, states: &compositor::SurfaceData| {
            if smithay::desktop::utils::surface_primary_scanout_output(surface, states)
                .is_some_and(|primary| primary != *output)
            {
                return;
            }
            pending_callbacks |= !states
                .cached_state
                .get::<compositor::SurfaceAttributes>()
                .current()
                .frame_callbacks
                .is_empty();
            if let Some(next) = states
                .data_map
                .get::<CommitTimerBarrierStateUserData>()
                .and_then(|timers| timers.lock().unwrap().next_deadline())
                .map(Time::<Monotonic>::from)
            {
                deadline =
                    Some(deadline.map_or(next, |previous: Time<Monotonic>| previous.min(next)));
            }
        };
        for window in self.space.elements_for_output(output) {
            window.with_surfaces(&mut visit);
        }
        for layer in layer_map_for_output(output).layers() {
            layer.with_surfaces(&mut visit);
        }
        if let Some(lock) = self.session_lock.surface_for_output(output) {
            smithay::desktop::utils::with_surfaces_surface_tree(lock.wl_surface(), &mut visit);
        }
        if let CursorImageStatus::Surface(surface) = &self.cursor_status {
            smithay::desktop::utils::with_surfaces_surface_tree(surface, &mut visit);
        }
        if let Some(icon) = &self.dnd_icon {
            smithay::desktop::utils::with_surfaces_surface_tree(&icon.surface, &mut visit);
        }
        (deadline, pending_callbacks)
    }
}
