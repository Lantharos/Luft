#![cfg_attr(not(feature = "session-backend"), allow(dead_code))]

use smithay::{
    desktop::utils::{OutputPresentationFeedback, take_presentation_feedback_surface_tree},
    output::Output,
    reexports::{
        wayland_protocols::wp::presentation_time::server::wp_presentation_feedback,
        wayland_server::protocol::wl_surface::WlSurface,
    },
    utils::{Clock, Monotonic, Time},
    wayland::{
        compositor::{SurfaceAttributes, TraversalAction, with_surface_tree_downward},
        presentation::Refresh,
    },
};
use std::time::Duration;

#[derive(Debug)]
pub struct FrameClock {
    clock: Clock<Monotonic>,
    refresh: Refresh,
    refresh_interval: Duration,
    last_presentation: Option<Duration>,
    sequence: u64,
}

#[derive(Debug, Clone, Copy)]
pub struct FrameTime {
    time: Time<Monotonic>,
    refresh: Refresh,
    sequence: u64,
}

impl FrameClock {
    pub fn new(refresh: Duration) -> Self {
        Self {
            clock: Clock::new(),
            refresh: Refresh::fixed(refresh),
            refresh_interval: refresh,
            last_presentation: None,
            sequence: 1,
        }
    }

    pub fn set_refresh(&mut self, refresh: Duration) {
        self.refresh = Refresh::fixed(refresh);
        self.refresh_interval = refresh;
        self.last_presentation = None;
    }

    pub fn next_frame(&mut self) -> FrameTime {
        self.frame_at(self.clock.now())
    }

    pub fn frame_at(&mut self, time: Time<Monotonic>) -> FrameTime {
        self.last_presentation = Some(time.into());
        let frame = FrameTime {
            time,
            refresh: self.refresh,
            sequence: self.sequence,
        };
        self.sequence = self.sequence.wrapping_add(1).max(1);
        frame
    }

    #[cfg(feature = "session-backend")]
    pub fn frame_at_sequence(&mut self, time: Time<Monotonic>, sequence: u64) -> FrameTime {
        self.last_presentation = Some(time.into());
        let frame = FrameTime {
            time,
            refresh: self.refresh,
            sequence,
        };
        self.sequence = sequence.wrapping_add(1).max(1);
        frame
    }

    pub fn next_presentation_delay(&self) -> Duration {
        let now = Duration::from(self.clock.now());
        let Some(last) = self.last_presentation else {
            return self.refresh_interval;
        };
        if now <= last {
            return last.saturating_sub(now) + self.refresh_interval;
        }

        let elapsed = now - last;
        let refresh_nanos = self.refresh_interval.as_nanos().max(1);
        let intervals = elapsed.as_nanos() / refresh_nanos + 1;
        let target = last
            + Duration::from_nanos(
                u64::try_from(intervals.saturating_mul(refresh_nanos)).unwrap_or(u64::MAX),
            );
        target.saturating_sub(now)
    }
}

impl FrameTime {
    pub fn time(&self) -> Time<Monotonic> {
        self.time
    }

    pub fn refresh(&self) -> Refresh {
        self.refresh
    }

    pub fn sequence(&self) -> u64 {
        self.sequence
    }

    fn millis(self) -> u32 {
        self.time.as_millis()
    }
}

pub fn send_surface_frame_tree(output: &Output, surface: &WlSurface, frame: FrameTime) {
    let mut feedback = OutputPresentationFeedback::new(output);
    take_presentation_feedback_surface_tree(
        surface,
        &mut feedback,
        |_, _| Some(output.clone()),
        |_, _| wp_presentation_feedback::Kind::empty(),
    );
    feedback.presented(
        frame.time,
        frame.refresh,
        frame.sequence,
        wp_presentation_feedback::Kind::Vsync,
    );
    send_frame_callbacks(surface, frame.millis());
}

fn send_frame_callbacks(surface: &WlSurface, time: u32) {
    with_surface_tree_downward(
        surface,
        (),
        |_, _, &()| TraversalAction::DoChildren(()),
        |_surface, states, &()| {
            for callback in states
                .cached_state
                .get::<SurfaceAttributes>()
                .current()
                .frame_callbacks
                .drain(..)
            {
                callback.done(time);
            }
        },
        |_, _, &()| true,
    );
}
