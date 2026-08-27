use crate::state::KestrelState;
use smithay::{
    reexports::wayland_server::protocol::wl_output::WlOutput,
    utils::{Logical, Size},
    wayland::session_lock::{
        LockSurface, SessionLockHandler, SessionLockManagerState, SessionLocker,
    },
};

impl SessionLockHandler for KestrelState {
    fn lock_state(&mut self) -> &mut SessionLockManagerState {
        &mut self.protocol_state.session_lock
    }

    fn lock(&mut self, confirmation: SessionLocker) {
        self.begin_session_lock(confirmation);
    }

    fn unlock(&mut self) {
        self.end_session_lock();
    }

    fn new_surface(&mut self, surface: LockSurface, output: WlOutput) {
        let Some(managed) = self
            .outputs
            .managed_outputs()
            .find(|managed| managed.output.owns(&output))
        else {
            return;
        };
        let output_name = managed.output.name();
        let scale = managed.descriptor.scale.max(1.0);
        let size = Size::<u32, Logical>::from((
            (f64::from(managed.descriptor.size.w) / scale)
                .round()
                .max(1.0) as u32,
            (f64::from(managed.descriptor.size.h) / scale)
                .round()
                .max(1.0) as u32,
        ));
        surface.with_pending_state(|state| state.size = Some(size));
        surface.send_configure();
        self.install_lock_surface(output_name, surface);
    }
}
