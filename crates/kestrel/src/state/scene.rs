use super::KestrelState;
use crate::workspace_transition::{WorkspaceTransition, WorkspaceTransitionSnapshot};
use smithay::{
    desktop::utils::surface_primary_scanout_output,
    reexports::wayland_server::protocol::wl_surface::WlSurface, wayland::compositor,
};

impl KestrelState {
    pub fn workspace_transition(&self) -> Option<WorkspaceTransitionSnapshot> {
        self.workspace_transition
            .as_ref()
            .and_then(WorkspaceTransition::snapshot)
    }

    pub fn animations_active(&self) -> bool {
        self.windows.animations_active()
            || self
                .workspace_transition
                .as_ref()
                .is_some_and(WorkspaceTransition::is_active)
    }

    pub fn scene_structural_revision(&self) -> u64 {
        self.structural_revisions
            .get(&self.output().name())
            .copied()
            .unwrap_or_default()
    }

    pub fn scene_revision(&self) -> u64 {
        self.scene_revisions
            .get(&self.output().name())
            .copied()
            .unwrap_or_default()
    }

    pub fn mark_scene_structural_dirty(&mut self) {
        self.mark_all_outputs_scene_dirty();
    }

    pub fn mark_scene_content_dirty(&mut self) {
        let output = self.output().name();
        self.mark_output_content_dirty(&output);
    }

    pub fn mark_scene_dirty(&mut self) {
        self.mark_scene_content_dirty();
    }

    pub fn scene_dirty(&self) -> bool {
        !self.pending_redraws.is_empty()
    }

    pub fn scene_needs_frame(&self) -> bool {
        self.scene_dirty() || self.animations_active() || self.workspace_transition().is_some()
    }

    pub fn mark_output_structural_dirty(&mut self, output: &str) {
        bump_revision(&mut self.structural_revisions, output);
        self.mark_output_content_dirty(output);
    }

    pub fn mark_output_content_dirty(&mut self, output: &str) {
        bump_revision(&mut self.scene_revisions, output);
        self.pending_redraws.insert(output.to_string());
    }

    pub fn mark_all_outputs_scene_dirty(&mut self) {
        let outputs = self
            .outputs
            .managed_outputs()
            .map(|output| output.descriptor.name.clone())
            .collect::<Vec<_>>();
        for output in outputs {
            self.mark_output_structural_dirty(&output);
        }
    }

    pub fn mark_surface_content_dirty(&mut self, surface: &WlSurface) {
        for output in self.surface_output_names(surface) {
            self.mark_output_content_dirty(&output);
        }
    }

    pub fn mark_surface_structural_dirty(&mut self, surface: &WlSurface) {
        for output in self.surface_output_names(surface) {
            self.mark_output_structural_dirty(&output);
        }
    }

    #[cfg(feature = "session-backend")]
    pub fn take_pending_redraws(&mut self) -> Vec<String> {
        std::mem::take(&mut self.pending_redraws)
            .into_iter()
            .collect()
    }

    pub fn acknowledge_redraw(&mut self, output: &str) {
        self.pending_redraws.remove(output);
    }

    fn surface_output_names(&self, surface: &WlSurface) -> Vec<String> {
        if let Some(output) = self.layer_output_for_surface(surface) {
            return vec![output.name()];
        }
        if let Some(id) = self.windows.id_for_wl_surface(surface)
            && let Some(window) = self.space_windows.get(&id)
        {
            let outputs = self
                .space
                .outputs_for_element(window)
                .into_iter()
                .map(|output| output.name())
                .collect::<Vec<_>>();
            if !outputs.is_empty() {
                return outputs;
            }
        }
        if let Some(output) = compositor::with_states(surface, |states| {
            surface_primary_scanout_output(surface, states)
        }) {
            return vec![output.name()];
        }
        vec![self.outputs.primary_output().name()]
    }
}

fn bump_revision(revisions: &mut std::collections::BTreeMap<String, u64>, output: &str) {
    let revision = revisions.entry(output.to_string()).or_default();
    *revision = revision.wrapping_add(1);
    if *revision == 0 {
        *revision = 1;
    }
}
