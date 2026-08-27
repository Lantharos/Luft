use super::KestrelState;
use crate::client::ClientState;
use smithay::{
    desktop::utils::surface_primary_scanout_output,
    reexports::wayland_server::{Client, Resource, protocol::wl_surface::WlSurface},
    utils::{Monotonic, Time},
    wayland::{
        commit_timing::CommitTimerBarrierStateUserData,
        compositor::{SurfaceData, TraversalAction, with_surface_tree_downward},
        fifo::FifoBarrierCachedState,
    },
};

impl KestrelState {
    pub fn signal_commit_timers(&mut self, frame_target: Time<Monotonic>) {
        let mut clients = Vec::new();
        self.visit_paced_surfaces(|surface, states| {
            let signaled = states
                .data_map
                .get::<CommitTimerBarrierStateUserData>()
                .is_some_and(|timers| {
                    timers
                        .lock()
                        .expect("commit timer state poisoned")
                        .signal_until(frame_target)
                });
            if signaled {
                push_client(&mut clients, surface);
            }
        });
        self.resume_clients(clients);
    }

    pub fn signal_fifo_barriers(&mut self) {
        let mut clients = Vec::new();
        let output = self.output().clone();
        self.visit_paced_surfaces(|surface, states| {
            if surface_primary_scanout_output(surface, states)
                .as_ref()
                .is_some_and(|primary| primary != &output)
            {
                return;
            }
            let barrier = states
                .cached_state
                .get::<FifoBarrierCachedState>()
                .current()
                .barrier
                .take();
            if let Some(barrier) = barrier {
                barrier.signal();
                push_client(&mut clients, surface);
            }
        });
        self.resume_clients(clients);
    }

    fn visit_paced_surfaces(&self, mut visit: impl FnMut(&WlSurface, &SurfaceData)) {
        for root in self.frame_callback_surfaces() {
            with_surface_tree_downward(
                &root,
                (),
                |surface, states, &()| {
                    visit(surface, states);
                    TraversalAction::DoChildren(())
                },
                |_, _, &()| {},
                |_, _, &()| true,
            );
        }

        if let smithay::input::pointer::CursorImageStatus::Surface(surface) = &self.cursor_image {
            with_surface_tree_downward(
                surface,
                (),
                |surface, states, &()| {
                    visit(surface, states);
                    TraversalAction::DoChildren(())
                },
                |_, _, &()| {},
                |_, _, &()| true,
            );
        }
    }

    fn resume_clients(&mut self, clients: Vec<Client>) {
        let display = self.display_handle.clone();
        for client in clients {
            let Some(state) = client.get_data::<ClientState>() else {
                continue;
            };
            state.compositor_state.blocker_cleared(self, &display);
        }
    }
}

fn push_client(clients: &mut Vec<Client>, surface: &WlSurface) {
    let Some(client) = surface.client() else {
        return;
    };
    if !clients.iter().any(|current| current.id() == client.id()) {
        clients.push(client);
    }
}
