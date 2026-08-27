use calloop::RegistrationToken;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
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

impl RedrawState {
    pub fn queue_redraw(&mut self) {
        *self = match *self {
            Self::Idle => Self::Queued,
            Self::WaitingForEstimatedVBlank(token) => {
                Self::WaitingForEstimatedVBlankAndQueued(token)
            }
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
}

#[derive(Debug, Default)]
pub struct OutputFrameState {
    pub redraw_state: RedrawState,
    pub frame_callback_sequence: u32,
    force_full_damage: bool,
}

impl OutputFrameState {
    pub fn new() -> Self {
        Self {
            redraw_state: RedrawState::Queued,
            force_full_damage: true,
            ..Self::default()
        }
    }

    pub fn queue_redraw(&mut self) {
        self.redraw_state.queue_redraw();
    }

    pub fn queue_full_redraw(&mut self) {
        self.force_full_damage = true;
        self.queue_redraw();
    }

    pub fn force_full_damage(&self) -> bool {
        self.force_full_damage
    }

    pub fn rendered(&mut self) {
        self.force_full_damage = false;
    }

    pub fn discard_pending_frame(&mut self) {
        self.redraw_state = RedrawState::Idle;
        self.force_full_damage = true;
    }

    pub fn reject_submission(&mut self) {
        self.redraw_state = RedrawState::Queued;
        self.force_full_damage = true;
    }

    pub fn frame_submitted(&mut self) -> bool {
        let redraw_needed = match self.redraw_state {
            RedrawState::WaitingForVBlank { redraw_needed } => redraw_needed,
            _ => false,
        };
        self.redraw_state = RedrawState::Idle;
        redraw_needed
    }

    pub fn frame_rendered(&mut self) -> u32 {
        self.frame_callback_sequence = self.frame_callback_sequence.wrapping_add(1);
        self.frame_callback_sequence
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
}

#[cfg(test)]
mod tests {
    use super::{OutputFrameState, RedrawState};
    #[test]
    fn discarded_frame_requires_a_fresh_full_redraw() {
        let mut state = OutputFrameState::new();
        state.rendered();
        state.mark_waiting_for_vblank();
        state.discard_pending_frame();

        assert_eq!(state.redraw_state, RedrawState::Idle);
        assert!(state.force_full_damage());

        state.queue_redraw();
        assert_eq!(state.redraw_state, RedrawState::Queued);
    }

    #[test]
    fn rejected_submission_is_immediately_renderable() {
        let mut state = OutputFrameState::new();
        state.rendered();
        state.mark_waiting_for_vblank();
        state.reject_submission();

        assert!(state.redraw_state.should_render());
        assert!(state.force_full_damage());
    }

    #[test]
    fn callbacks_advance_after_render_not_submission() {
        let mut state = OutputFrameState::new();
        state.mark_waiting_for_vblank();

        assert_eq!(state.frame_rendered(), 1);
        assert!(!state.frame_submitted());
        assert_eq!(state.frame_callback_sequence, 1);
    }
}
