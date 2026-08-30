use super::*;
use super::{model::WebShellSnapshot, snapshot::WebShellSnapshotInput};
use crate::{apps::shell_apps, ipc::ShellIpc, theme::shell_palette};
use std::sync::mpsc::Sender;

impl WebShell {
    pub(super) fn new(
        config: LuftConfig,
        actions_tx: Sender<WebShellAction>,
        actions_rx: Receiver<WebShellAction>,
    ) -> Result<Self, Box<dyn Error>> {
        let palette = shell_palette(&config);
        let (ipc, model) = ShellIpc::connect()?;
        let system_status = SystemStatusService::start();
        let status = SystemStatus::default();
        let (panel_apps, applications) = shell_apps(&config);
        let running_app_order = super::running_order::from_model(&model);
        let tray = TrayService::start();
        let notifications = NotificationService::start();
        let snapshot = WebShellSnapshot::from_shell(WebShellSnapshotInput {
            model: &model,
            running_window_order: &running_app_order,
            status: &status,
            tray: tray.snapshot(),
            notifications: notifications.snapshot(),
            panel_apps: &panel_apps,
            panel_menu_command: None,
            panel_menu_x: None,
            applications: &applications,
            palette,
            start_menu_open: false,
            quick_settings_open: false,
            date_center_open: false,
        });
        let mut surfaces = WebSurfaces::new(actions_tx, &snapshot, model.primary_frame_rate())?;
        surfaces.set_panel_visible(true);

        Ok(Self {
            launcher_command: config.default_apps.launcher.clone(),
            startup_apps: config.session.startup_apps.clone(),
            startup_apps_launched: false,
            startup_apps_launch_after: Instant::now() + Duration::from_secs(2),
            config,
            palette,
            model,
            ipc,
            status,
            system_status,
            tray,
            notifications,
            panel_apps,
            applications,
            running_app_order,
            surfaces,
            actions_rx,
            queued_actions: Default::default(),
            app_processes: Vec::new(),
            start_menu_visible: false,
            quick_visible: false,
            date_visible: false,
            panel_menu_open: false,
            panel_menu_command: None,
            panel_menu_x: None,
            session_menu_visible: false,
            last_config_refresh: Instant::now(),
            last_snapshot: String::new(),
        })
    }
}
