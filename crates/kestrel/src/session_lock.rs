use smithay::{
    backend::input::InputTime,
    input::tablet::TabletSeatTrait,
    output::Output,
    reexports::wayland_protocols::ext::session_lock::v1::server::ext_session_lock_v1::ExtSessionLockV1,
    reexports::wayland_server::Resource,
    reexports::wayland_server::protocol::{wl_output::WlOutput, wl_surface::WlSurface},
    utils::SERIAL_COUNTER,
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
    owner: Option<ExtSessionLockV1>,
    generation: u64,
    pending_outputs: Vec<Output>,
    surfaces: Vec<(Output, LockSurface)>,
}

impl SessionLock {
    pub fn new(manager: SessionLockManagerState) -> Self {
        Self {
            manager,
            active: false,
            confirmation: None,
            owner: None,
            generation: 0,
            pending_outputs: Vec::new(),
            surfaces: Vec::new(),
        }
    }

    pub fn is_active(&self) -> bool {
        self.active
    }

    pub fn generation(&self) -> Option<u64> {
        self.active.then_some(self.generation)
    }

    pub fn needs_locker(&self) -> bool {
        self.active && self.owner.as_ref().is_none_or(|owner| !owner.is_alive())
    }

    pub fn is_secure(&self) -> bool {
        self.active && self.confirmation.is_none() && self.pending_outputs.is_empty()
    }

    pub fn allows_input(&self, surface: Option<&WlSurface>) -> bool {
        if !self.active {
            return true;
        }
        let Some(surface) = surface else {
            return false;
        };
        let mut root = surface.clone();
        while let Some(parent) = smithay::wayland::compositor::get_parent(&root) {
            root = parent;
        }
        self.surfaces
            .iter()
            .any(|(_, lock)| lock.alive() && lock.wl_surface() == &root)
    }

    pub fn surface_for_output(&self, output: &Output) -> Option<&LockSurface> {
        self.surfaces
            .iter()
            .find_map(|(candidate, surface)| (candidate == output).then_some(surface))
            .filter(|surface| surface.alive())
    }

    pub fn output_added(&mut self, output: &Output) {
        if self.active && !self.pending_outputs.contains(output) {
            self.pending_outputs.push(output.clone());
        }
    }

    pub fn configure_output(&mut self, output: &Output) {
        if let Some(surface) = self.surface_for_output(output)
            && let Some(mode) = output.current_mode()
        {
            let size: smithay::utils::Size<i32, smithay::utils::Logical> = output
                .current_transform()
                .transform_size(mode.size)
                .to_f64()
                .to_logical(output.current_scale().fractional_scale())
                .to_i32_round();
            surface.with_pending_state(|state| {
                state.size = Some((size.w.max(1) as u32, size.h.max(1) as u32).into())
            });
            surface.send_configure();
        }
    }

    pub fn output_removed(&mut self, output: &Output) {
        self.surfaces.retain(|(candidate, _)| candidate != output);
        self.output_presented(output, self.generation);
    }

    pub fn output_presented(&mut self, output: &Output, generation: u64) {
        if !self.active || generation != self.generation {
            return;
        }
        self.pending_outputs.retain(|pending| pending != output);
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
        if self
            .session_lock
            .owner
            .as_ref()
            .is_some_and(Resource::is_alive)
        {
            return;
        }
        self.begin_session_lock();
        self.session_lock.owner = Some(confirmation.ext_session_lock().clone());
        self.session_lock.confirmation = Some(confirmation);
        if self.session_lock.pending_outputs.is_empty()
            && let Some(confirmation) = self.session_lock.confirmation.take()
        {
            confirmation.lock();
        }
    }

    fn unlock(&mut self) {
        self.session_lock.active = false;
        self.session_lock.owner = None;
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
        self.refresh_pointer_focus_now();
        self.refresh_idle_inhibition();
    }

    fn new_surface(&mut self, surface: LockSurface, wl_output: WlOutput) {
        let Some(output) = Output::from_resource(&wl_output) else {
            return;
        };
        let Some(owner) = self.session_lock.owner.as_ref() else {
            return;
        };
        if owner != surface.ext_session_lock() {
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
        self.refresh_pointer_focus_now();
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

impl<B: Backend> KestrelState<B> {
    pub(crate) fn request_lock(&mut self) -> std::io::Result<()> {
        if !self.session_lock.is_active() {
            self.begin_session_lock();
        }
        self.lock_process.start()
    }

    pub(crate) fn begin_session_lock(&mut self) {
        self.session_lock.generation = self.session_lock.generation.wrapping_add(1);
        self.session_lock.active = true;
        let serial = SERIAL_COUNTER.next_serial();
        let time = InputTime::now();
        self.pointer.clone().unset_grab(self, serial, time);
        self.release_pointer_focus_for_session_lock();
        if let Some(touch) = self.seat.get_touch() {
            touch.unset_grab(self);
            touch.cancel(self);
        }
        for tool in self.seat.tablet_seat().get_tools().into_values() {
            tool.unset_grab(self, serial, time);
            if let Some(location) = tool.current_location() {
                tool.motion(
                    self,
                    None,
                    &smithay::input::tablet::tool::MotionEvent {
                        location,
                        serial,
                        time,
                    },
                );
                tool.frame(self, time);
            }
        }
        self.dnd_icon = None;
        self.suppressed_keys.clear();
        self.logo_tap_candidate = false;
        self.session_lock.surfaces.clear();
        self.session_lock.pending_outputs = self.space.outputs().cloned().collect::<Vec<_>>();

        let keyboard = self.seat.get_keyboard().expect("seat has a keyboard");
        keyboard.unset_grab(self);
        keyboard.set_focus(self, None, serial);

        let outputs = self.space.outputs().cloned().collect::<Vec<_>>();
        for output in outputs {
            self.backend_data.reset_buffers(&output);
        }
        self.refresh_idle_inhibition();
    }
}
