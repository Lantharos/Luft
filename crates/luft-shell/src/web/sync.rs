use super::{CONFIG_REFRESH, WebShell};
use crate::{
    apps::{launcher_apps_from, panel_apps_from, shell_apps},
    ipc::ShellModel,
    theme::shell_palette,
};
use luft_config::{LuftConfig, load_config, save_config};
use std::time::Instant;
use tracing::{debug, warn};

impl WebShell {
    pub(super) fn send_ipc(&self, request: luft_ipc::IpcRequest) {
        if let Err(error) = self.ipc.send(request.clone()) {
            warn!(%error, ?request, "failed to send Kestrel command");
        }
    }

    pub(super) fn refresh_model(&mut self) -> bool {
        let mut latest = None;
        let messages = self.ipc.drain().collect::<Vec<_>>();
        for message in messages {
            match message {
                luft_ipc::ServerMessage::ShellUpdate(snapshot)
                    if snapshot.revision > self.model.revision =>
                {
                    latest = Some(snapshot.into())
                }
                luft_ipc::ServerMessage::ShellUpdate(_) => {}
                luft_ipc::ServerMessage::Response {
                    response: luft_ipc::IpcResponse::Error { message },
                    ..
                } => warn!(message, "Kestrel rejected shell command"),
                luft_ipc::ServerMessage::ShellCommand(command) => match command {
                    luft_ipc::ShellCommand::Lock => {
                        self.run_session_command(super::actions::SessionCommand::Lock)
                    }
                    luft_ipc::ShellCommand::Suspend => {
                        self.run_session_command(super::actions::SessionCommand::Suspend)
                    }
                },
                luft_ipc::ServerMessage::Response { .. } => {}
            }
        }
        if let Some(model) = latest {
            self.apply_model(model);
            return true;
        }
        false
    }

    fn apply_model(&mut self, model: ShellModel) {
        self.surfaces.set_frame_rate(model.primary_frame_rate());
        self.model = model;
        super::running_order::sync(&mut self.running_app_order, &self.model);
    }

    pub(super) fn refresh_status(&mut self) -> bool {
        if let Some(status) = self.system_status.latest()
            && status != self.status
        {
            self.status = status;
            return true;
        }
        false
    }

    pub(super) fn refresh_config(&mut self) -> bool {
        if self.last_config_refresh.elapsed() < CONFIG_REFRESH {
            return false;
        }
        self.last_config_refresh = Instant::now();
        self.reload_shell_config()
    }

    pub(super) fn reload_shell_config(&mut self) -> bool {
        match load_config() {
            Ok(loaded) if loaded.config != self.config => {
                self.apply_shell_config(loaded.config);
                true
            }
            Ok(_) => false,
            Err(error) => {
                debug!(%error, "failed to refresh shell config");
                false
            }
        }
    }

    pub(super) fn save_shell_config(&mut self, config: LuftConfig) {
        self.apply_shell_config(config.clone());
        self.sync_surfaces();
        match save_config(&config) {
            Ok(path) => {
                debug!(path = %path.display(), "saved shell config");
                self.last_config_refresh = Instant::now();
            }
            Err(error) => warn!(%error, "failed to save shell config"),
        }
    }

    fn apply_shell_config(&mut self, config: LuftConfig) {
        self.palette = shell_palette(&config);
        if config.default_apps.terminal != self.config.default_apps.terminal {
            (self.panel_apps, self.applications) = shell_apps(&config);
        } else {
            let used_panel_fallback = self
                .applications
                .iter()
                .all(|application| application.desktop_id.is_none());
            self.panel_apps = panel_apps_from(&config, &self.applications);
            if used_panel_fallback {
                self.applications = launcher_apps_from(Vec::new(), &self.panel_apps);
            }
        }
        self.launcher_command = config.default_apps.launcher.clone();
        self.config = config;
    }

    pub(super) fn sync_surfaces(&mut self) {
        let notification_toast_visible = self.notification_toast_visible();
        let snapshot =
            super::model::WebShellSnapshot::from_shell(super::snapshot::WebShellSnapshotInput {
                model: &self.model,
                running_window_order: &self.running_app_order,
                status: &self.status,
                tray: self.tray.snapshot(),
                notifications: self.notifications.snapshot(),
                panel_apps: &self.panel_apps,
                panel_menu_command: self.panel_menu_command.as_deref(),
                panel_menu_x: self.panel_menu_x,
                applications: &self.applications,
                palette: self.palette,
                start_menu_open: self.start_menu_visible,
                quick_settings_open: self.quick_visible,
                date_center_open: self.date_visible,
            });
        let Ok(value) = serde_json::to_value(&snapshot) else {
            return;
        };
        if self.last_snapshot.as_ref() != Some(&value) {
            self.last_snapshot = Some(value.clone());
            self.surfaces.evaluate_snapshot(&snapshot, &value);
        }
        self.surfaces
            .set_notification_toast_visible(notification_toast_visible);
    }

    fn notification_toast_visible(&self) -> bool {
        !self.quick_visible
            && !self.date_visible
            && !self.start_menu_visible
            && !self.notifications.snapshot().toast_items.is_empty()
    }
}
