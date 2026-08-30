use std::{
    collections::{BTreeMap, BTreeSet},
    time::{Duration, Instant},
};

use luft_config::{LuftConfig, load_config};
use luft_ipc::{
    IpcRequest, IpcResponse, LayoutEngine, OutputSummary, Rect, ShellSnapshot, StatusPayload,
    WindowId, WindowInfo, WindowState, WindowSummary, Workspace, WorkspaceId, WorkspaceSummary,
};
use smithay::{
    desktop::space::SpaceElement,
    output::Scale,
    reexports::{
        calloop::timer::{TimeoutAction, Timer},
        wayland_protocols::xdg::shell::server::xdg_toplevel,
        wayland_server::Resource,
    },
    utils::{IsAlive, SERIAL_COUNTER},
    wayland::{
        compositor::with_states,
        seat::WaylandFocus,
        shell::xdg::{XdgShellHandler, XdgToplevelSurfaceData},
    },
};
use tracing::warn;

use crate::{
    shell::{
        WindowElement, fixup_positions,
        ssd::{WindowAnimation, WindowAnimationKind},
    },
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
        let geometry = self.window_rect(&window).unwrap_or_else(Rect::zero);
        let mut info = WindowInfo::new(
            WindowId(0),
            self.layout.active_workspace().clone(),
            geometry,
        );
        self.update_window_info(&window, &mut info);

        match self.layout.register_window(info) {
            Ok(id) => {
                self.windows.insert(id, window);
                self.shell_state_dirty = true;
            }
            Err(error) => warn!(%error, "failed to register window"),
        }
    }

    pub fn sync_policy(&mut self) -> bool {
        let dead = self
            .windows
            .iter()
            .filter_map(|(id, window)| (!window.alive()).then_some(*id))
            .collect::<Vec<_>>();
        let mut changed = !dead.is_empty();
        for id in dead {
            self.windows.remove(&id);
            self.layout.unregister_window(id);
        }

        let updates = self
            .windows
            .iter()
            .filter_map(|(id, window)| {
                self.window_rect(window)
                    .map(|geometry| (*id, window.clone(), geometry))
            })
            .collect::<Vec<_>>();
        for (id, window, geometry) in updates {
            if let Some(mut info) = self.layout.window(id).cloned() {
                info.geometry = geometry;
                self.update_window_info(&window, &mut info);
                if let Some(stored) = self.layout.window_mut(id)
                    && *stored != info
                {
                    *stored = info;
                    changed = true;
                }
            }
        }
        changed
    }

    pub fn handle_ipc(&mut self, request: IpcRequest) -> IpcResponse {
        self.shell_state_dirty = true;
        match request {
            IpcRequest::SubscribeShell => IpcResponse::Accepted { revision: 0 },
            IpcRequest::ListOutputs => IpcResponse::Outputs {
                outputs: self.output_summaries(),
            },
            IpcRequest::ActivateWindow { window } => self
                .activate_window(window)
                .map(|()| IpcResponse::Accepted { revision: 0 })
                .unwrap_or_else(ipc_error),
            IpcRequest::CloseWindow { window } => self
                .close_window(window)
                .map(|()| IpcResponse::Accepted { revision: 0 })
                .unwrap_or_else(ipc_error),
            IpcRequest::MinimizeWindow { window } => self
                .minimize_window(window)
                .map(|()| IpcResponse::Accepted { revision: 0 })
                .unwrap_or_else(ipc_error),
            IpcRequest::ToggleMaximizeWindow { window } => self
                .toggle_maximize(window)
                .map(|()| IpcResponse::Accepted { revision: 0 })
                .unwrap_or_else(ipc_error),
            IpcRequest::MoveWindowToWorkspace { window, workspace } => self
                .layout
                .move_window_to_workspace(window, &workspace)
                .map(|()| self.reconcile_workspace())
                .map(|()| IpcResponse::Accepted { revision: 0 })
                .unwrap_or_else(ipc_error),
            IpcRequest::SwitchWorkspace { workspace } => self
                .switch_workspace(workspace)
                .map(|()| IpcResponse::Accepted { revision: 0 })
                .unwrap_or_else(ipc_error),
            IpcRequest::SwitchRelativeWorkspace { offset } => self
                .switch_relative_workspace(offset)
                .map(|()| IpcResponse::Accepted { revision: 0 })
                .unwrap_or_else(ipc_error),
            IpcRequest::SetOutputScale { output, scale } => self
                .set_output_scale(output.as_deref(), scale)
                .map(|()| IpcResponse::Accepted { revision: 0 })
                .unwrap_or_else(ipc_error),
            IpcRequest::RestartShell => {
                self.shell_process.restart();
                IpcResponse::Accepted { revision: 0 }
            }
            IpcRequest::Reload => self
                .reload_config()
                .map(|()| IpcResponse::Accepted { revision: 0 })
                .unwrap_or_else(ipc_error),
        }
    }

    fn reload_config(&mut self) -> Result<(), String> {
        let config = load_config().map_err(|error| error.to_string())?.config;
        self.idle_lock_after = config
            .session
            .idle_lock_seconds
            .map(std::time::Duration::from_secs);
        self.idle_suspend_after = config
            .session
            .idle_suspend_seconds
            .map(std::time::Duration::from_secs);
        self.last_activity = std::time::Instant::now();
        self.idle_lock_sent = false;
        self.idle_suspend_sent = false;
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
        if let Some(keyboard) = self.seat.get_keyboard() {
            let mut modifiers = keyboard.modifier_state();
            if modifiers.num_lock != config.input.num_lock {
                modifiers.num_lock = config.input.num_lock;
                keyboard.set_modifier_state(modifiers);
                keyboard.advertise_modifier_state(self);
                self.backend_data.update_led_state(keyboard.led_state());
            }
        }
        self.shell_process
            .set_xwayland_display(self.xwayland_process.display().map(str::to_owned));
        self.reconcile_workspace();
        Ok(())
    }

    pub fn sync_shell_state(&mut self) -> ShellSnapshot {
        self.process_idle_actions();
        let policy_changed = self.sync_policy();
        let focus = self.shell_focus_surface();
        let focus_changed = focus != self.last_shell_focus;
        self.last_shell_focus = focus;
        let process_changed = self.ipc_socket.snapshot().is_some_and(|snapshot| {
            snapshot.status.shell != self.shell_process.status()
                || snapshot.status.xwayland != self.xwayland_process.status()
                || snapshot.status.xwayland_display.as_deref() != self.xwayland_process.display()
        });
        if !self.shell_state_dirty
            && !policy_changed
            && !focus_changed
            && !process_changed
            && let Some(snapshot) = self.ipc_socket.snapshot()
        {
            return snapshot;
        }
        let snapshot = self.shell_snapshot();
        let snapshot = self.ipc_socket.publish(snapshot);
        self.shell_state_dirty = false;
        snapshot
    }

    fn shell_focus_surface(
        &self,
    ) -> Option<smithay::reexports::wayland_server::protocol::wl_surface::WlSurface> {
        self.seat
            .get_keyboard()
            .and_then(|keyboard| keyboard.current_focus())
            .and_then(|focus| focus.wl_surface().map(|surface| surface.into_owned()))
    }

    fn process_idle_actions(&mut self) {
        if self.idle_inhibited {
            return;
        }

        let idle_for = self.last_activity.elapsed();
        if !self.idle_lock_sent && self.idle_lock_after.is_some_and(|after| idle_for >= after) {
            self.ipc_socket
                .send_shell_command(luft_ipc::ShellCommand::Lock);
            self.idle_lock_sent = true;
        }
        if !self.idle_suspend_sent
            && self
                .idle_suspend_after
                .is_some_and(|after| idle_for >= after)
        {
            self.ipc_socket
                .send_shell_command(luft_ipc::ShellCommand::Suspend);
            self.idle_suspend_sent = true;
        }
    }

    fn shell_snapshot(&self) -> ShellSnapshot {
        let focus = self.shell_focus_surface();
        let active_workspace = self.layout.active_workspace().clone();
        let windows = self
            .layout
            .windows()
            .filter_map(|info| {
                let window = self.windows.get(&info.id)?;
                let is_visible = info.workspace == active_workspace
                    && info.state != WindowState::Hidden
                    && self.space.element_location(window).is_some();
                let is_active = is_visible
                    && focus
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
                    is_visible,
                    icon_uri: None,
                    icon_name: info.app_id.clone(),
                })
            })
            .collect();

        ShellSnapshot {
            revision: 0,
            status: StatusPayload {
                compositor: "Kestrel".to_string(),
                shell: self.shell_process.status(),
                xwayland: self.xwayland_process.status(),
                xwayland_display: self.xwayland_process.display().map(str::to_owned),
                active_workspace,
                nested: self.nested,
            },
            outputs: self.output_summaries(),
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
                let geometry = self.space.output_geometry(output)?;
                let physical = output.physical_properties();
                Some(OutputSummary {
                    name: output.name(),
                    make: physical.make,
                    model: physical.model,
                    width: mode.size.w,
                    height: mode.size.h,
                    logical_width: geometry.size.w,
                    logical_height: geometry.size.h,
                    refresh_millihertz: mode.refresh,
                    scale: output.current_scale().fractional_scale(),
                    primary: index == 0,
                    enabled: true,
                })
            })
            .collect()
    }

    pub(crate) fn activate_window(&mut self, id: WindowId) -> Result<(), String> {
        let workspace = self
            .layout
            .window(id)
            .ok_or_else(|| format!("unknown window {}", id.0))?
            .workspace
            .clone();
        let was_hidden = self
            .layout
            .window(id)
            .is_some_and(|window| window.state == WindowState::Hidden);
        if was_hidden {
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
        if was_hidden {
            self.reconcile_workspace();
            if let Some(rect) = self.window_rect(&window) {
                window.decoration_state().animation = Some(WindowAnimation {
                    kind: WindowAnimationKind::Open,
                    from: smithay_rect(rect),
                    to: smithay_rect(rect),
                    started_at: Instant::now(),
                    duration: Duration::from_millis(170),
                });
            }
        }
        self.space.raise_element(&window, true);
        if let Some(keyboard) = self.seat.get_keyboard() {
            keyboard.set_focus(self, Some(window.into()), SERIAL_COUNTER.next_serial());
        }
        Ok(())
    }

    fn close_window(&mut self, id: WindowId) -> Result<(), String> {
        self.animate_close_window(id)
    }

    pub(crate) fn minimize_window(&mut self, id: WindowId) -> Result<(), String> {
        let window = self
            .windows
            .get(&id)
            .cloned()
            .ok_or_else(|| format!("unknown window {}", id.0))?;
        let rect = self
            .window_rect(&window)
            .ok_or_else(|| "window is not mapped".to_string())?;
        window.decoration_state().animation = Some(WindowAnimation {
            kind: WindowAnimationKind::Minimize,
            from: smithay_rect(rect),
            to: smithay_rect(rect),
            started_at: Instant::now(),
            duration: Duration::from_millis(180),
        });
        self.handle
            .insert_source(
                Timer::from_duration(Duration::from_millis(180)),
                move |_, _, state| {
                    if state.windows.get(&id).is_some_and(|window| {
                        window
                            .decoration_state()
                            .animation
                            .is_some_and(|animation| {
                                animation.kind == WindowAnimationKind::Minimize
                            })
                    }) {
                        state.reconcile_workspace();
                    }
                    TimeoutAction::Drop
                },
            )
            .map_err(|error| error.to_string())?;
        self.layout
            .set_window_state(id, WindowState::Hidden)
            .map_err(|error| error.to_string())?;
        Ok(())
    }

    pub(crate) fn animate_close_window(&mut self, id: WindowId) -> Result<(), String> {
        let window = self
            .windows
            .get(&id)
            .cloned()
            .ok_or_else(|| format!("unknown window {}", id.0))?;
        let rect = self
            .window_rect(&window)
            .ok_or_else(|| "window is not mapped".to_string())?;
        window.decoration_state().animation = Some(WindowAnimation {
            kind: WindowAnimationKind::Close,
            from: smithay_rect(rect),
            to: smithay_rect(rect),
            started_at: Instant::now(),
            duration: Duration::from_millis(220),
        });
        self.handle
            .insert_source(
                Timer::from_duration(Duration::from_millis(220)),
                move |_, _, state| {
                    if let Some(window) = state.windows.get(&id)
                        && window
                            .decoration_state()
                            .animation
                            .is_some_and(|animation| animation.kind == WindowAnimationKind::Close)
                        && let Some(toplevel) = window.0.toplevel()
                    {
                        toplevel.send_close();
                    }
                    TimeoutAction::Drop
                },
            )
            .map_err(|error| error.to_string())?;
        Ok(())
    }

    pub(crate) fn toggle_maximize(&mut self, id: WindowId) -> Result<(), String> {
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
        self.shell_state_dirty = true;
        fixup_positions(&mut self.space, self.pointer.current_location());
        let reconfigure = self
            .windows
            .values()
            .filter_map(|window| {
                let toplevel = window.0.toplevel()?.clone();
                let decoration = window.decoration_state();
                Some((toplevel, decoration.maximized, decoration.fullscreen))
            })
            .collect::<Vec<_>>();
        for (toplevel, maximized, fullscreen) in reconfigure {
            if fullscreen {
                XdgShellHandler::fullscreen_request(self, toplevel, None);
            } else if maximized {
                XdgShellHandler::maximize_request(self, toplevel);
            }
        }
        self.backend_data.reset_buffers(&output);
        Ok(())
    }

    fn window_rect(&self, window: &WindowElement) -> Option<Rect> {
        let geometry = window.geometry();
        let location = self.space.element_location(window)?;
        Some(Rect::new(
            location.x,
            location.y,
            geometry.size.w,
            geometry.size.h,
        ))
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

fn smithay_rect(rect: Rect) -> smithay::utils::Rectangle<i32, smithay::utils::Logical> {
    smithay::utils::Rectangle::new((rect.x, rect.y).into(), (rect.width, rect.height).into())
}

fn ipc_error(error: impl ToString) -> IpcResponse {
    IpcResponse::Error {
        message: error.to_string(),
    }
}
