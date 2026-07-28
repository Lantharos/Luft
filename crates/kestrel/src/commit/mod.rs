use crate::{render::handle_commit, state::KestrelState};
use smithay::{
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    wayland::compositor::is_sync_subsurface,
};

#[cfg(feature = "session-backend")]
use crate::client::ClientState;
#[cfg(feature = "session-backend")]
use smithay::reexports::wayland_server::Client;

#[cfg(feature = "session-backend")]
use smithay::{
    backend::renderer::sync::Fence,
    reexports::wayland_server::Resource,
    wayland::{
        compositor::{self, BufferAssignment, SurfaceAttributes},
        drm_syncobj::DrmSyncobjCachedState,
    },
};

pub fn install_surface_hooks(state: &mut KestrelState, surface: &WlSurface) {
    state.update_surface_scale(surface);
    #[cfg(feature = "session-backend")]
    install_pre_commit_hook(surface);
}

pub fn surface_commit(state: &mut KestrelState, surface: &WlSurface) {
    let popup_needs_render = state.popup_manager.find_popup(surface).is_some();
    let needs_render = state.commit_surface_needs_render(surface) || popup_needs_render;

    handle_commit(surface);
    state.early_import_surface(surface);

    if is_sync_subsurface(surface) {
        return;
    }

    state.popup_manager.commit(surface);
    let popup_mapped = !popup_needs_render && state.popup_manager.find_popup(surface).is_some();
    let initial_size_adopted = state.adopt_initial_toplevel_size(surface);
    let decoration_changed = state.reconcile_decoration_after_commit(surface);
    let foreign_toplevel_changed = state.sync_foreign_toplevel(surface);

    if needs_render || popup_mapped {
        state.mark_scene_content_dirty();
    }
    if initial_size_adopted || decoration_changed || foreign_toplevel_changed {
        state.mark_scene_structural_dirty();
    }

    if let Some(layer_surface) = state.layer_surface_for_commit(surface) {
        state.arrange_layers();
        state.mark_scene_structural_dirty();
        layer_surface.send_pending_configure();
    }
}

impl KestrelState {
    pub fn early_import_surface(&mut self, surface: &WlSurface) {
        #[cfg(feature = "session-backend")]
        self.session_early_import(surface);
        let _ = surface;
    }
}

#[cfg(feature = "session-backend")]
fn install_pre_commit_hook(surface: &WlSurface) {
    compositor::add_pre_commit_hook::<KestrelState, _>(surface, |state, _dh, surface| {
        pre_commit(state, surface);
    });
}

#[cfg(feature = "session-backend")]
fn pre_commit(state: &mut KestrelState, surface: &WlSurface) {
    queue_syncobj_acquire(state, surface);
}

#[cfg(feature = "session-backend")]
fn queue_syncobj_acquire(state: &mut KestrelState, surface: &WlSurface) {
    let Some(client) = surface.client() else {
        return;
    };

    let acquire = compositor::with_states(surface, |states| {
        let mut attributes = states.cached_state.get::<SurfaceAttributes>();
        if !matches!(
            attributes.pending().buffer,
            Some(BufferAssignment::NewBuffer(_))
        ) {
            return None;
        }

        let mut syncobj = states.cached_state.get::<DrmSyncobjCachedState>();
        let pending = syncobj.pending();
        pending
            .release_point
            .as_ref()
            .and_then(|_| pending.acquire_point.clone())
    });

    let Some(acquire) = acquire else {
        return;
    };
    if acquire.is_signaled() {
        return;
    }

    match acquire.generate_blocker() {
        Ok((blocker, source)) => {
            compositor::add_blocker(surface, blocker);
            state.queue_syncobj_source(client, source);
        }
        Err(error) => {
            tracing::warn!(%error, "failed to create drm syncobj acquire blocker");
        }
    }
}

#[cfg(feature = "session-backend")]
pub fn blocker_cleared(state: &mut KestrelState, client: &Client) {
    let dh = state.display_handle.clone();
    client
        .get_data::<ClientState>()
        .expect("client missing ClientState")
        .compositor_state
        .blocker_cleared(state, &dh);
    state.mark_scene_dirty();
}
