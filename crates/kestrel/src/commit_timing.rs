use crate::state::{Backend, KestrelState};
use smithay::{
    reexports::wayland_server::{
        Client, Resource, backend::ClientId, protocol::wl_surface::WlSurface,
    },
    utils::{Monotonic, Time},
    wayland::{
        commit_timing::{CommitTimerBarrierStateUserData, CommitTimerStateUserData},
        compositor::{CompositorHandler, with_states},
    },
};
use std::{collections::HashMap, time::Duration};

impl<B: Backend> KestrelState<B> {
    pub(crate) fn track_commit_timer(&mut self, surface: &WlSurface) {
        let timed = with_states(surface, |states| {
            states.data_map.get::<CommitTimerStateUserData>().is_some()
        });
        if timed && !self.timed_surfaces.contains(surface) {
            self.timed_surfaces.push(surface.clone());
        }
    }

    pub(crate) fn commit_timeout(&self) -> Option<Duration> {
        self.timed_surfaces
            .iter()
            .filter_map(|surface| {
                with_states(surface, |states| {
                    states
                        .data_map
                        .get::<CommitTimerBarrierStateUserData>()
                        .and_then(|timers| timers.lock().unwrap().next_deadline())
                })
            })
            .min()
            .map(|deadline| {
                Duration::from(Time::<Monotonic>::from(deadline))
                    .saturating_sub(self.clock.now().into())
            })
    }

    pub(crate) fn release_due_commits(&mut self) {
        let now = self.clock.now();
        #[allow(clippy::mutable_key_type)]
        let mut clients: HashMap<ClientId, Client> = HashMap::new();
        for surface in &self.timed_surfaces {
            let signaled = with_states(surface, |states| {
                states
                    .data_map
                    .get::<CommitTimerBarrierStateUserData>()
                    .is_some_and(|timers| timers.lock().unwrap().signal_until(now))
            });
            if signaled && let Some(client) = surface.client() {
                clients.insert(client.id(), client);
            }
        }
        let dh = self.display_handle.clone();
        for client in clients.into_values() {
            self.client_compositor_state(&client)
                .blocker_cleared(self, &dh);
        }
    }
}
