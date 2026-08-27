use std::collections::{BTreeMap, BTreeSet};

use luft_config::{LuftConfig, load_config};
use luft_ipc::{
    IpcRequest, IpcResponse, LayoutEngine, OutputSummary, Rect, StatusPayload, WindowId,
    WindowInfo, WindowState, WindowSummary, Workspace, WorkspaceId, WorkspaceSummary,
};
use smithay::{
    desktop::space::SpaceElement,
    output::Scale,
    reexports::{wayland_protocols::xdg::shell::server::xdg_toplevel, wayland_server::Resource},
    utils::{IsAlive, SERIAL_COUNTER},
    wayland::{
        compositor::with_states,
        seat::WaylandFocus,
        shell::xdg::{XdgShellHandler, XdgToplevelSurfaceData},
    },
};
use tracing::warn;

use crate::{
    shell::WindowElement,
    state::{Backend, KestrelState},
};

pub fn create_layout() -> LayoutEngine {
    let config = load_config()
        .map(|loaded| loaded.config)
        .unwrap_or_default();
    create_layout_from_config(config)
}

fn create_layout_from_config(config: LuftConfig) -> LayoutEngine {
    let count = config.workspaces.count.max(1);
    let mut workspaces = BTreeMap::<WorkspaceId, Workspace>::new();

    for number in 1..=count {
        let id = WorkspaceId(number.to_string());
        workspaces.insert(
            id.clone(),
            Workspace::empty(id.0.clone(), format!("Workspace {number}")),
        );
    }
    for (id, configured) in config.workspaces.entries {
        let id = WorkspaceId(id);
        workspaces.insert(id.clone(), Workspace::empty(id.0.clone(), configured.name));
    }

    let active = workspaces
        .keys()
        .next()
        .cloned()
        .unwrap_or_else(|| WorkspaceId("1".to_string()));
    LayoutEngine::new(workspaces.into_values().collect(), active)
        .expect("configured workspaces include the active workspace")
}

impl<BackendData: Backend> KestrelState<BackendData> {
    pub fn register_window(&mut self, window: WindowElement) {
        let geometry = self.window_rect(&window);
        let mut info = WindowInfo::new(
            WindowId(0),
            self.layout.active_workspace().clone(),
            geometry,
        );
        self.update_window_info(&window, &mut info);

        match self.layout.register_window(info) {
            Ok(id) => {
                self.windows.insert(id, window);
                self.reconcile_workspace();
            }
            Err(error) => warn!(%error, "failed to register window"),
        }
    }

    pub fn sync_policy(&mut self) {
        let dead = self
            .windows
            .iter()
            .filter_map(|(id, window)| (!window.alive()).then_some(*id))
            .collect::<Vec<_>>();
        for id in dead {
            self.windows.remove(&id);
            self.layout.unregister_window(id);
        }

        let updates = self
            .windows
            .iter()
            .map(|(id, window)| (*id, window.clone(), self.window_rect(window)))
            .collect::<Vec<_>>();
        for (id, window, geometry) in updates {
            if let Some(mut info) = self.layout.window(id).cloned() {
                info.geometry = geometry;
                self.update_window_info(&window, &mut info);
                if let Some(stored) = self.layout.window_mut(id) {
                    *stored = info;
                }
            }
        }
    }

    pub fn handle_ipc(&mut self, request: IpcRequest) -> IpcResponse {
        self.sync_policy();
        match request {
            IpcRequest::ShellSnapshot => self.shell_snapshot(),
            IpcRequest::ListOutputs => IpcResponse::Outputs {
                outputs: self.output_summaries(),
            },
            IpcRequest::ActivateWindow { window } => self
                .activate_window(window)
                .map(|()| IpcResponse::Accepted)
                .unwrap_or_else(ipc_error),
            IpcRequest::CloseWindow { window } => self
                .close_window(window)
                .map(|()| IpcResponse::Accepted)
                .unwrap_or_else(ipc_error),
            IpcRequest::MinimizeWindow { window } => self
                .minimize_window(window)
                .map(|()| IpcResponse::Accepted)
                .unwrap_or_else(ipc_error),
            IpcRequest::ToggleMaximizeWindow { window } => self
                .toggle_maximize(window)
                .map(|()| IpcResponse::Accepted)
                .unwrap_or_else(ipc_error),
            IpcRequest::MoveWindowToWorkspace { window, workspace } => self
                .layout
                .move_window_to_workspace(window, &workspace)
                .map(|()| self.reconcile_workspace())
                .map(|()| IpcResponse::Accepted)
                .unwrap_or_else(ipc_error),
            IpcRequest::SwitchWorkspace { workspace } => self
                .switch_workspace(workspace)
                .map(|()| IpcResponse::Accepted)
                .unwrap_or_else(ipc_error),
            IpcRequest::SwitchRelativeWorkspace { offset } => self
                .switch_relative_workspace(offset)
                .map(|()| IpcResponse::Accepted)
                .unwrap_or_else(ipc_error),
            IpcRequest::SetOutputScale { output, scale } => self
                .set_output_scale(output.as_deref(), scale)
                .map(|()| IpcResponse::Accepted)
                .unwrap_or_else(ipc_error),
            IpcRequest::RestartShell => {
                self.shell_process.restart();
                IpcResponse::Accepted
            }
            IpcRequest::Reload => self
                .reload_config()
                .map(|()| IpcResponse::Accepted)
                .unwrap_or_else(ipc_error),
        }
    }

    fn reload_config(&mut self) -> Result<(), String> {
        let config = load_config().map_err(|error| error.to_string())?.config;
        let active = self.layout.active_workspace().clone();
        let windows = self.layout.windows().cloned().collect::<Vec<_>>();
        let mut layout = create_layout_from_config(config.clone());
        if layout.workspaces().any(|workspace| workspace.id == active) {
            layout
                .switch_workspace(&active)
                .map_err(|error| error.to_string())?;
        }
        let fallback_workspace = layout.active_workspace().clone();
        for mut window in windows {
            if !layout
                .workspaces()
                .any(|workspace| workspace.id == window.workspace)
            {
                window.workspace = fallback_workspace.clone();
            }
            layout
                .register_window(window)
                .map_err(|error| error.to_string())?;
        }
        self.layout = layout;
        self.xwayland_process
            .reconfigure(config.compositor.xwayland);
        self.wallpaper = crate::wallpaper::Wallpaper::load(&config.compositor);
        self.shell_process
            .set_xwayland_display(self.xwayland_process.display().map(str::to_owned));
        self.reconcile_workspace();
        Ok(())
    }

    fn shell_snapshot(&self) -> IpcResponse {
        let focus = self
            .seat
            .get_keyboard()
            .and_then(|keyboard| keyboard.current_focus())
            .and_then(|focus| focus.wl_surface().map(|surface| surface.into_owned()));
        let active_workspace = self.layout.active_workspace().clone();
        let windows = self
            .layout
            .windows()
            .filter_map(|info| {
                let window = self.windows.get(&info.id)?;
                let is_active = focus
                    .as_ref()
                    .zip(window.wl_surface().as_deref())
                    .is_some_and(|(focus, surface)| focus == surface);
                Some(WindowSummary {
                    id: info.id,
                    title: info.title.clone(),
                    app_id: info.app_id.clone(),
                    pid: info.pid,
                    workspace: info.workspace.clone(),
                    state: info.state.clone(),
                    geometry: info.geometry,
                    is_active,
                    is_visible: info.workspace == active_workspace
                        && info.state != WindowState::Hidden,
                    icon_uri: None,
                    icon_name: info.app_id.clone(),
                })
            })
            .collect();

        IpcResponse::ShellSnapshot {
            status: StatusPayload {
                compositor: "Kestrel".to_string(),
                shell: self.shell_process.status(),
                xwayland: self.xwayland_process.status(),
                xwayland_display: self.xwayland_process.display().map(str::to_owned),
                active_workspace,
                nested: self.nested,
            },
            workspaces: self
                .layout
                .workspaces()
                .map(|workspace| WorkspaceSummary {
                    id: workspace.id.clone(),
                    name: workspace.name.clone(),
                })
                .collect(),
            windows,
        }
    }

    fn output_summaries(&self) -> Vec<OutputSummary> {
        self.space
            .outputs()
            .enumerate()
            .filter_map(|(index, output)| {
                let mode = output.current_mode()?;
                let physical = output.physical_properties();
                Some(OutputSummary {
                    name: output.name(),
                    make: physical.make,
                    model: physical.model,
                    width: mode.size.w,
                    height: mode.size.h,
                    refresh_millihertz: mode.refresh,
                    scale: output.current_scale().fractional_scale(),
                    primary: index == 0,
                    enabled: true,
                })
            })
            .collect()
    }

    fn activate_window(&mut self, id: WindowId) -> Result<(), String> {
        let workspace = self
            .layout
            .window(id)
            .ok_or_else(|| format!("unknown window {}", id.0))?
            .workspace
            .clone();
        if self
            .layout
            .window(id)
            .is_some_and(|window| window.state == WindowState::Hidden)
        {
            self.layout
                .set_window_state(id, WindowState::Floating)
                .map_err(|error| error.to_string())?;
        }
        self.switch_workspace(workspace)?;
        let window = self
            .windows
            .get(&id)
            .cloned()
            .ok_or_else(|| format!("unknown window {}", id.0))?;
        self.space.raise_element(&window, true);
        if let Some(keyboard) = self.seat.get_keyboard() {
            keyboard.set_focus(self, Some(window.into()), SERIAL_COUNTER.next_serial());
        }
        Ok(())
    }

    fn close_window(&mut self, id: WindowId) -> Result<(), String> {
        let window = self
            .windows
            .get(&id)
            .ok_or_else(|| format!("unknown window {}", id.0))?;
        let toplevel = window
            .0
            .toplevel()
            .ok_or_else(|| "window is not an xdg toplevel".to_string())?;
        toplevel.send_close();
        Ok(())
    }

    fn minimize_window(&mut self, id: WindowId) -> Result<(), String> {
        self.layout
            .set_window_state(id, WindowState::Hidden)
            .map_err(|error| error.to_string())?;
        self.reconcile_workspace();
        Ok(())
    }

    fn toggle_maximize(&mut self, id: WindowId) -> Result<(), String> {
        let window = self
            .windows
            .get(&id)
            .cloned()
            .ok_or_else(|| format!("unknown window {}", id.0))?;
        let toplevel = window
            .0
            .toplevel()
            .ok_or_else(|| "window is not an xdg toplevel".to_string())?;
        let maximized = toplevel
            .with_pending_state(|state| state.states.contains(xdg_toplevel::State::Maximized));
        if maximized {
            XdgShellHandler::unmaximize_request(self, toplevel.clone());
            self.layout
                .set_window_state(id, WindowState::Floating)
                .map_err(|error| error.to_string())?;
        } else {
            XdgShellHandler::maximize_request(self, toplevel.clone());
            self.layout
                .set_window_state(id, WindowState::Maximized)
                .map_err(|error| error.to_string())?;
        }
        Ok(())
    }

    fn switch_workspace(&mut self, workspace: WorkspaceId) -> Result<(), String> {
        self.layout
            .switch_workspace(&workspace)
            .map_err(|error| error.to_string())?;
        self.reconcile_workspace();
        Ok(())
    }

    fn switch_relative_workspace(&mut self, offset: i32) -> Result<(), String> {
        let workspace = self
            .layout
            .relative_workspace(offset)
            .ok_or_else(|| "no workspace in that direction".to_string())?;
        self.switch_workspace(workspace)
    }

    fn reconcile_workspace(&mut self) {
        let active = self.layout.active_workspace().clone();
        let visible = self
            .layout
            .windows()
            .filter(|window| window.workspace == active && window.state != WindowState::Hidden)
            .map(|window| window.id)
            .collect::<BTreeSet<_>>();

        for (id, window) in &self.windows {
            let mapped = self.space.element_location(window).is_some();
            if visible.contains(id) && !mapped {
                let location = self
                    .layout
                    .window(*id)
                    .map(|info| (info.geometry.x, info.geometry.y))
                    .unwrap_or_default();
                self.space.map_element(window.clone(), location, false);
            } else if !visible.contains(id) && mapped {
                self.space.unmap_elem(window);
            }
        }
    }

    fn set_output_scale(&mut self, name: Option<&str>, scale: f64) -> Result<(), String> {
        if !scale.is_finite() || !(0.5..=4.0).contains(&scale) {
            return Err("output scale must be between 0.5 and 4.0".to_string());
        }
        let output = self
            .space
            .outputs()
            .find(|output| name.is_none_or(|name| output.name() == name))
            .cloned()
            .ok_or_else(|| "output not found".to_string())?;
        output.change_current_state(None, None, Some(Scale::Fractional(scale)), None);
        self.backend_data.reset_buffers(&output);
        Ok(())
    }

    fn window_rect(&self, window: &WindowElement) -> Rect {
        let geometry = window.geometry();
        let location = self.space.element_location(window).unwrap_or_default();
        Rect::new(location.x, location.y, geometry.size.w, geometry.size.h)
    }

    fn update_window_info(&self, window: &WindowElement, info: &mut WindowInfo) {
        let Some(surface) = window.wl_surface() else {
            return;
        };
        with_states(&surface, |states| {
            if let Some(attributes) = states.data_map.get::<XdgToplevelSurfaceData>() {
                let attributes = attributes.lock().unwrap();
                info.title.clone_from(&attributes.title);
                info.app_id.clone_from(&attributes.app_id);
            }
        });
        info.pid = surface
            .client()
            .and_then(|client| client.get_credentials(&self.display_handle).ok())
            .and_then(|credentials| credentials.pid.try_into().ok());
    }
}

fn ipc_error(error: impl ToString) -> IpcResponse {
    IpcResponse::Error {
        message: error.to_string(),
    }
}
