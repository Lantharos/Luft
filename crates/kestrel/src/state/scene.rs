use super::KestrelState;
use crate::workspace_transition::{WorkspaceTransition, WorkspaceTransitionSnapshot};

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

    pub fn scene_structural_dirty(&self) -> bool {
        self.structural_dirty
    }

    pub fn scene_content_dirty(&self) -> bool {
        self.content_dirty
    }

    pub fn mark_scene_structural_dirty(&mut self) {
        self.structural_dirty = true;
    }

    pub fn mark_scene_content_dirty(&mut self) {
        self.content_dirty = true;
    }

    pub fn mark_scene_dirty(&mut self) {
        self.structural_dirty = true;
        self.content_dirty = true;
    }

    pub fn scene_dirty(&self) -> bool {
        self.structural_dirty || self.content_dirty
    }

    pub fn scene_needs_frame(&self) -> bool {
        self.scene_dirty()
            || self.cursor_dirty
            || self.animations_active()
            || self.workspace_transition().is_some()
    }

    pub fn clear_frame_dirty(&mut self) {
        self.structural_dirty = false;
        self.content_dirty = false;
        self.cursor_dirty = false;
    }
}
