use crate::state::KestrelState;
use smithay::{
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    wayland::{
        idle_inhibit::IdleInhibitHandler,
        idle_notify::{IdleNotifierHandler, IdleNotifierState},
    },
};

impl IdleNotifierHandler for KestrelState {
    fn idle_notifier_state(&mut self) -> &mut IdleNotifierState<Self> {
        self.idle_notifier
            .as_mut()
            .expect("idle notifier global exists only after initialization")
    }
}

impl IdleInhibitHandler for KestrelState {
    fn inhibit(&mut self, surface: WlSurface) {
        if !self
            .idle_inhibitors
            .iter()
            .any(|inhibitor| inhibitor == &surface)
        {
            self.idle_inhibitors.push(surface);
        }
        self.refresh_idle_inhibition();
    }

    fn uninhibit(&mut self, surface: WlSurface) {
        self.idle_inhibitors
            .retain(|inhibitor| inhibitor != &surface);
        self.refresh_idle_inhibition();
    }
}
