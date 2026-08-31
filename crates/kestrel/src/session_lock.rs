use std::collections::BTreeSet;

use smithay::{
    output::Output,
    reexports::wayland_server::protocol::{wl_output::WlOutput, wl_surface::WlSurface},
    wayland::session_lock::{
        LockSurface, SessionLockHandler, SessionLockManagerState, SessionLocker,
    },
};

use crate::{
    focus::KeyboardFocusTarget,
    state::{Backend, KestrelState},
};

#[derive(Debug)]
pub struct SessionLock {
    pub manager: SessionLockManagerState,
    active: bool,
    confirmation: Option<SessionLocker>,
    pending_outputs: BTreeSet<String>,
    surfaces: Vec<(Output, LockSurface)>,
}

impl SessionLock {
    pub fn new(manager: SessionLockManagerState) -> Self {
        Self {
            manager,
            active: false,
            confirmation: None,
            pending_outputs: BTreeSet::new(),
            surfaces: Vec::new(),
        }
    }

    pub fn is_active(&self) -> bool {
        self.active
    }

    pub fn surface_for_output(&self, output: &Output) -> Option<&LockSurface> {
        self.surfaces
            .iter()
            .find_map(|(candidate, surface)| (candidate == output).then_some(surface))
            .filter(|surface| surface.alive())
    }

    pub fn output_cleared(&mut self, output: &Output) {
        self.pending_outputs.remove(&output.name());
        if self.pending_outputs.is_empty()
            && let Some(confirmation) = self.confirmation.take()
        {
            confirmation.lock();
        }
    }
}

impl<BackendData: Backend> SessionLockHandler for KestrelState<BackendData> {
    fn lock_state(&mut self) -> &mut SessionLockManagerState {
        &mut self.session_lock.manager
    }

    fn lock(&mut self, confirmation: SessionLocker) {
        self.session_lock.active = true;
        self.session_lock.surfaces.clear();
        self.session_lock.pending_outputs = self
            .space
            .outputs()
            .map(Output::name)
            .collect::<BTreeSet<_>>();
        self.session_lock.confirmation = Some(confirmation);

        let keyboard = self.seat.get_keyboard().expect("seat has a keyboard");
        keyboard.set_focus(self, None, smithay::utils::SERIAL_COUNTER.next_serial());

        let outputs = self.space.outputs().cloned().collect::<Vec<_>>();
        for output in outputs {
            self.backend_data.reset_buffers(&output);
        }
        self.refresh_idle_inhibition();

        if self.session_lock.pending_outputs.is_empty()
            && let Some(confirmation) = self.session_lock.confirmation.take()
        {
            confirmation.lock();
        }
    }

    fn unlock(&mut self) {
        self.session_lock.active = false;
        self.session_lock.confirmation = None;
        self.session_lock.pending_outputs.clear();
        self.session_lock.surfaces.clear();

        let outputs = self.space.outputs().cloned().collect::<Vec<_>>();
        for output in outputs {
            self.backend_data.reset_buffers(&output);
        }

        let focus = self.space.elements().last().cloned();
        if let Some(keyboard) = self.seat.get_keyboard() {
            keyboard.set_focus(
                self,
                focus.map(KeyboardFocusTarget::from),
                smithay::utils::SERIAL_COUNTER.next_serial(),
            );
        }
        self.refresh_idle_inhibition();
    }

    fn new_surface(&mut self, surface: LockSurface, wl_output: WlOutput) {
        let Some(output) = Output::from_resource(&wl_output) else {
            return;
        };
        let Some(confirmation) = self.session_lock.confirmation.as_ref() else {
            return;
        };
        if confirmation.ext_session_lock() != surface.ext_session_lock() {
            return;
        }

        let size = self
            .space
            .output_geometry(&output)
            .map(|geometry| geometry.size)
            .unwrap_or_default();
        surface.with_pending_state(|state| {
            state.size = Some((size.w.max(0) as u32, size.h.max(0) as u32).into())
        });
        surface.send_configure();

        self.session_lock
            .surfaces
            .retain(|(candidate, _)| candidate != &output);
        self.session_lock
            .surfaces
            .push((output.clone(), surface.clone()));

        let keyboard = self.seat.get_keyboard().expect("seat has a keyboard");
        keyboard.set_focus(
            self,
            Some(KeyboardFocusTarget::Surface(surface.wl_surface().clone())),
            smithay::utils::SERIAL_COUNTER.next_serial(),
        );
        self.refresh_idle_inhibition();
        self.backend_data.reset_buffers(&output);
    }
}

pub fn lock_surface_under(
    surface: &WlSurface,
    position: smithay::utils::Point<f64, smithay::utils::Logical>,
) -> Option<(
    WlSurface,
    smithay::utils::Point<i32, smithay::utils::Logical>,
)> {
    smithay::desktop::utils::under_from_surface_tree(
        surface,
        position,
        (0, 0),
        smithay::desktop::WindowSurfaceType::ALL,
    )
}
