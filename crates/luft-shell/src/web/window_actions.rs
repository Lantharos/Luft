use super::{WebShell, actions::window_id};

impl WebShell {
    pub(super) fn new_workspace_from_start_menu(&mut self) {
        self.send_ipc(luft_ipc::IpcRequest::SwitchRelativeWorkspace { offset: 1 });
        self.close_transient_popovers();
    }

    pub(super) fn activate_task_window(&mut self, window: u64) {
        let id = window_id(window);
        let request = if self
            .model
            .windows
            .iter()
            .any(|summary| summary.id == id && summary.is_active && summary.is_visible)
        {
            luft_ipc::IpcRequest::MinimizeWindow { window: id }
        } else {
            luft_ipc::IpcRequest::ActivateWindow { window: id }
        };
        self.send_ipc(request);
        self.close_transient_popovers();
    }

    pub(super) fn close_task_window(&mut self, window: u64) {
        self.send_ipc(luft_ipc::IpcRequest::CloseWindow {
            window: window_id(window),
        });
        self.close_panel_menu();
    }

    pub(super) fn minimize_task_window(&mut self, window: u64) {
        self.send_ipc(luft_ipc::IpcRequest::MinimizeWindow {
            window: window_id(window),
        });
        self.close_panel_menu();
    }

    pub(super) fn toggle_maximize_task_window(&mut self, window: u64) {
        self.send_ipc(luft_ipc::IpcRequest::ToggleMaximizeWindow {
            window: window_id(window),
        });
        self.close_panel_menu();
    }
}
