use super::KestrelState;
use luft_ipc::WorkspaceId;

impl KestrelState {
    pub(super) fn workspace_transition_direction(
        &self,
        from: &WorkspaceId,
        to: &WorkspaceId,
    ) -> Option<i32> {
        let workspaces = self
            .layout
            .workspaces()
            .map(|workspace| workspace.id.clone())
            .collect::<Vec<_>>();
        let from_index = workspaces.iter().position(|workspace| workspace == from)?;
        let to_index = workspaces.iter().position(|workspace| workspace == to)?;
        let len = workspaces.len();
        if len <= 1 || from_index == to_index {
            return None;
        }

        let forward = (to_index + len - from_index) % len;
        let backward = (from_index + len - to_index) % len;
        Some(if forward <= backward { 1 } else { -1 })
    }
}
