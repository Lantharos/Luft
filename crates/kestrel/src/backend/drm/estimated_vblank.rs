use super::{device::SessionOutput, redraw::RedrawState};
use calloop::RegistrationToken;
use tracing::trace;

pub fn should_skip_queue(session_output: &SessionOutput) -> bool {
    matches!(
        session_output.frame_state.redraw_state,
        RedrawState::WaitingForEstimatedVBlank(_)
            | RedrawState::WaitingForEstimatedVBlankAndQueued(_)
    )
}

pub fn mark_waiting(session_output: &mut SessionOutput, token: RegistrationToken) {
    trace!("queueing estimated vblank timer");
    session_output.frame_state.mark_no_damage(token);
}

pub fn take_timer_token(session_output: &mut SessionOutput) -> Option<RegistrationToken> {
    match session_output.frame_state.redraw_state {
        RedrawState::WaitingForEstimatedVBlank(token) => {
            session_output.frame_state.redraw_state = RedrawState::Idle;
            Some(token)
        }
        RedrawState::WaitingForEstimatedVBlankAndQueued(token) => {
            session_output.frame_state.redraw_state = RedrawState::Queued;
            Some(token)
        }
        _ => None,
    }
}
