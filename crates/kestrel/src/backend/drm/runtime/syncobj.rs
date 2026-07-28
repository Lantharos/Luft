use super::LoopEvents;
use crate::{backend::drm::DrmError, commit, state::KestrelState};
use calloop::EventLoop;

pub(super) fn clear_ready_syncobj_blockers(
    events: &mut LoopEvents,
    state: &mut KestrelState,
    _dh: &smithay::reexports::wayland_server::DisplayHandle,
) {
    for client in events.syncobj_ready.drain(..) {
        commit::blocker_cleared(state, &client);
    }
}

pub(super) fn register_syncobj_sources(
    state: &mut KestrelState,
    event_loop: &EventLoop<LoopEvents>,
) -> Result<(), DrmError> {
    for pending in state.take_syncobj_sources() {
        let client = pending.client;
        event_loop
            .handle()
            .insert_source(pending.source, move |(), _, events| {
                events.syncobj_ready.push(client.clone());
                Ok(())
            })
            .map_err(|error| {
                DrmError::Unsupported(format!(
                    "failed to register drm syncobj acquire source: {error}"
                ))
            })?;
    }

    Ok(())
}
