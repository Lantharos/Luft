use super::KestrelState;
use smithay::{
    desktop::utils::surface_primary_scanout_output,
    reexports::calloop::{EventLoop, LoopHandle},
    reexports::wayland_server::Resource,
    wayland::{compositor::with_states, idle_notify::IdleNotifierState},
};
use std::time::Duration;

pub struct IdleRuntime {
    event_loop: EventLoop<'static, KestrelState>,
}

impl IdleRuntime {
    pub fn new(state: &mut KestrelState) -> Result<Self, calloop::Error> {
        let event_loop = EventLoop::try_new()?;
        state.enable_idle_notifier(event_loop.handle());
        Ok(Self { event_loop })
    }

    pub fn dispatch(&mut self, state: &mut KestrelState) -> Result<(), calloop::Error> {
        self.event_loop.dispatch(Duration::ZERO, state)
    }
}

impl KestrelState {
    fn enable_idle_notifier(&mut self, handle: LoopHandle<'static, Self>) {
        self.idle_notifier = Some(IdleNotifierState::new(&self.display_handle, handle));
    }

    pub fn notify_idle_activity(&mut self) {
        let seat = self.seat.clone();
        if let Some(notifier) = self.idle_notifier.as_mut() {
            notifier.notify_activity(&seat);
        }
    }

    pub(crate) fn refresh_idle_inhibition(&mut self) {
        self.idle_inhibitors.retain(|surface| surface.is_alive());
        let inhibited = self.idle_inhibitors.iter().any(|surface| {
            with_states(surface, |states| {
                surface_primary_scanout_output(surface, states).is_some()
            })
        });
        if let Some(notifier) = self.idle_notifier.as_mut() {
            notifier.set_is_inhibited(inhibited);
        }
    }
}
