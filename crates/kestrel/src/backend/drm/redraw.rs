use calloop::RegistrationToken;
use std::time::{Duration, Instant};

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
#[allow(dead_code)]
pub enum RedrawState {
    #[default]
    Idle,
    Queued,
    WaitingForVBlank {
        redraw_needed: bool,
    },
    WaitingForEstimatedVBlank(RegistrationToken),
    WaitingForEstimatedVBlankAndQueued(RegistrationToken),
}

#[allow(dead_code)]
impl RedrawState {
    pub fn queue_redraw(&mut self) {
        *self = match *self {
            Self::Idle => Self::Queued,
            Self::WaitingForEstimatedVBlank(token) => Self::WaitingForEstimatedVBlankAndQueued(token),
            Self::WaitingForVBlank { redraw_needed: _ } => Self::WaitingForVBlank {
                redraw_needed: true,
            },
            value @ (Self::Queued | Self::WaitingForEstimatedVBlankAndQueued(_)) => value,
        };
    }

    pub fn should_render(&self) -> bool {
        matches!(
            self,
            Self::Queued | Self::WaitingForEstimatedVBlankAndQueued(_)
        )
    }

    pub fn needs_redraw(&self) -> bool {
        !matches!(self, Self::Idle)
    }

    pub fn next_estimated_vblank(now: Instant, refresh: Duration) -> Instant {
        now + refresh
    }
}

#[derive(Debug, Default)]
#[allow(dead_code)]
pub struct OutputFrameState {
    pub redraw_state: RedrawState,
    pub frame_callback_sequence: u32,
    pub refresh_interval: Duration,
}

#[allow(dead_code)]
impl OutputFrameState {
    pub fn new(refresh_interval: Duration) -> Self {
        Self {
            refresh_interval,
            ..Self::default()
        }
    }

    pub fn queue_redraw(&mut self) {
        self.redraw_state.queue_redraw();
    }

    pub fn frame_submitted(&mut self) -> bool {
        let redraw_needed = match self.redraw_state {
            RedrawState::WaitingForVBlank { redraw_needed } => redraw_needed,
            _ => false,
        };
        self.redraw_state = RedrawState::Idle;
        self.frame_callback_sequence = self.frame_callback_sequence.wrapping_add(1);
        redraw_needed
    }

    pub fn mark_waiting_for_vblank(&mut self) -> Option<RegistrationToken> {
        let token = match self.redraw_state {
            RedrawState::WaitingForEstimatedVBlankAndQueued(token) => Some(token),
            _ => None,
        };
        self.redraw_state = RedrawState::WaitingForVBlank {
            redraw_needed: false,
        };
        token
    }

    pub fn mark_no_damage(&mut self, token: RegistrationToken) {
        self.redraw_state = match self.redraw_state {
            RedrawState::Queued => RedrawState::WaitingForEstimatedVBlank(token),
            RedrawState::WaitingForEstimatedVBlankAndQueued(_) => {
                RedrawState::WaitingForEstimatedVBlankAndQueued(token)
            }
            other => other,
        };
    }

    pub fn clear_estimated_vblank(&mut self) {
        self.redraw_state = match self.redraw_state {
            RedrawState::WaitingForEstimatedVBlank(_) => RedrawState::Idle,
            RedrawState::WaitingForEstimatedVBlankAndQueued(_) => RedrawState::Queued,
            other => other,
        };
    }
}
