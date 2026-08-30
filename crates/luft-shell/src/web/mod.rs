use crate::{
    apps::AppEntry,
    ipc::{ShellIpc, ShellModel},
    panel::PanelApp,
    services::{
        notifications::NotificationService,
        system_status::{SystemStatus, SystemStatusService},
        tray::TrayService,
    },
    theme::ShellPalette,
};
mod action_dispatch;
mod actions;
mod command_actions;
pub(crate) mod icons;
mod init;
mod launched_process;
mod lazy_surface;
mod model;
mod palette;
mod panel_actions;
mod popover_actions;
mod running_order;
mod settings_command;
mod snapshot;
mod startup_apps;
mod surface;
mod surface_layout;
mod surface_motion;
mod surface_sizing;
mod sync;
mod web_surface;
mod window_actions;
use actions::WebShellAction;
use launched_process::LaunchedProcess;
use luft_config::LuftConfig;
use std::{
    cell::RefCell,
    collections::VecDeque,
    error::Error,
    rc::Rc,
    sync::mpsc::{self, Receiver, RecvTimeoutError},
    thread,
    time::{Duration, Instant},
};
use surface::WebSurfaces;

const CONFIG_REFRESH: Duration = Duration::from_secs(2);
const ACTION_TICK: Duration = Duration::from_millis(16);
const MAINTENANCE_TICK: Duration = Duration::from_millis(100);

pub fn run(config: LuftConfig) -> Result<(), Box<dyn Error>> {
    let (actions_tx, actions_rx) = mpsc::channel();
    let shell = Rc::new(RefCell::new(WebShell::new(config, actions_tx, actions_rx)?));
    shell.borrow_mut().sync_surfaces();

    let mut last_maintenance = Instant::now();
    loop {
        let (animating, animation_tick) = {
            let mut shell = shell.borrow_mut();
            shell.tick_actions();
            if last_maintenance.elapsed() >= MAINTENANCE_TICK {
                shell.tick();
                last_maintenance = Instant::now();
            }
            (
                shell.surfaces.is_animating(),
                shell.model.animation_tick_interval(),
            )
        };
        let wait = if animating {
            animation_tick
        } else {
            MAINTENANCE_TICK.saturating_sub(last_maintenance.elapsed())
        };
        shell.borrow_mut().wait_for_action(wait);
    }
}

pub(super) struct WebShell {
    pub(super) config: LuftConfig,
    pub(super) palette: ShellPalette,
    pub(super) model: ShellModel,
    pub(super) ipc: ShellIpc,
    pub(super) status: SystemStatus,
    pub(super) system_status: SystemStatusService,
    pub(super) tray: TrayService,
    pub(super) notifications: NotificationService,
    pub(super) panel_apps: Vec<PanelApp>,
    pub(super) applications: Vec<AppEntry>,
    pub(super) running_app_order: Vec<luft_ipc::WindowId>,
    pub(super) surfaces: WebSurfaces,
    actions_rx: Receiver<WebShellAction>,
    queued_actions: VecDeque<WebShellAction>,
    pub(super) app_processes: Vec<LaunchedProcess>,
    pub(super) startup_apps: Vec<String>,
    pub(super) startup_apps_launched: bool,
    pub(super) startup_apps_launch_after: Instant,
    pub(super) launcher_command: String,
    pub(super) start_menu_visible: bool,
    pub(super) quick_visible: bool,
    pub(super) date_visible: bool,
    pub(super) panel_menu_open: bool,
    pub(super) panel_menu_command: Option<String>,
    pub(super) panel_menu_x: Option<i32>,
    pub(super) session_menu_visible: bool,
    last_config_refresh: Instant,
    last_snapshot: String,
}

impl WebShell {
    fn wait_for_action(&mut self, timeout: Duration) {
        if timeout.is_zero() {
            return;
        }

        match self.actions_rx.recv_timeout(timeout) {
            Ok(action) => self.queued_actions.push_back(action),
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => thread::sleep(ACTION_TICK),
        }
    }

    fn tick_actions(&mut self) {
        let mut pending_actions: Vec<WebShellAction> = self.queued_actions.drain(..).collect();
        pending_actions.extend(self.actions_rx.try_iter());
        let mut handled_action = false;
        for action in pending_actions {
            handled_action = true;
            self.handle_action(action);
        }

        if handled_action || self.start_menu_visible || self.quick_visible || self.date_visible {
            self.sync_surfaces();
        }
        self.surfaces.tick();
    }

    fn tick(&mut self) {
        self.tick_actions();

        self.app_processes
            .retain_mut(LaunchedProcess::is_running_or_report_exit);
        self.tray.refresh();
        self.notifications.refresh();
        self.refresh_model();
        self.launch_startup_apps();
        self.refresh_status();
        self.refresh_config();
        self.sync_surfaces();
    }
}
