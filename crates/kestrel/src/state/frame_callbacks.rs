use super::KestrelState;
use luft_ipc::WorkspaceId;
use smithay::{
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    wayland::compositor::{SurfaceAttributes, TraversalAction, with_surface_tree_downward},
};
use std::cell::Cell;

impl KestrelState {
    pub fn visible_workspaces(&self) -> Vec<WorkspaceId> {
        let mut workspaces = vec![self.layout.active_workspace().clone()];
        if let Some(transition) = self.workspace_transition() {
            workspaces.push(transition.from);
            workspaces.push(transition.to);
        }
        workspaces
    }

    pub fn frame_callback_surfaces(&self) -> Vec<WlSurface> {
        if self.session_locked() {
            return self.lock_surface_roots();
        }
        let workspaces = self.visible_workspaces();

        let mut surfaces = Vec::new();
        for workspace in workspaces {
            for surface in self.windows.visible_surfaces_for_workspace(&workspace) {
                push_unique_surface(&mut surfaces, surface);
            }
        }
        for surface in self.layer_surfaces() {
            push_unique_surface(&mut surfaces, surface);
        }
        if let Some(icon) = &self.dnd_icon {
            push_unique_surface(&mut surfaces, icon.surface.clone());
        }
        surfaces
    }

    pub fn has_pending_frame_callbacks(&self) -> bool {
        self.frame_callback_surfaces()
            .iter()
            .any(surface_tree_has_frame_callback)
    }
}

fn surface_tree_has_frame_callback(surface: &WlSurface) -> bool {
    let found = Cell::new(false);
    with_surface_tree_downward(
        surface,
        &found,
        |_, states, found| {
            if found.get() {
                TraversalAction::SkipChildren
            } else if !states
                .cached_state
                .get::<SurfaceAttributes>()
                .current()
                .frame_callbacks
                .is_empty()
            {
                found.set(true);
                TraversalAction::Break
            } else {
                TraversalAction::DoChildren(found)
            }
        },
        |_, _, _| {},
        |_, _, found| !found.get(),
    );
    found.get()
}

fn push_unique_surface(surfaces: &mut Vec<WlSurface>, surface: WlSurface) {
    if !surfaces.iter().any(|current| current == &surface) {
        surfaces.push(surface);
    }
}
