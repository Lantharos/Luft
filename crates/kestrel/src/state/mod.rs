use crate::{
    output::OutputGraph, protocol_state::ProtocolState, titlebar::TitlebarCache,
    window::WindowStack, workspace_transition::WorkspaceTransition,
};
use luft_config::LuftConfig;
use luft_ipc::{LayoutEngine, LayoutError, WindowId, WindowInfo, WorkspaceId};
use luft_ipc::{ShellStatus, XwaylandStatus};
use smithay::{
    backend::allocator::format::FormatSet,
    desktop::{PopupManager, Space},
    input::{
        Seat, SeatState,
        keyboard::{KeyboardHandle, LedState},
        pointer::CursorImageStatus,
    },
    reexports::{
        wayland_protocols::xdg::decoration::zv1::server::zxdg_toplevel_decoration_v1::Mode,
        wayland_protocols::xdg::shell::server::xdg_toplevel,
        wayland_server::{DisplayHandle, protocol::wl_surface::WlSurface},
    },
    utils::{Logical, Point},
    wayland::{
        compositor::CompositorState,
        foreign_toplevel_list::ForeignToplevelHandle,
        selection::{
            data_device::DataDeviceState, ext_data_control::DataControlState,
            primary_selection::PrimarySelectionState,
        },
        shell::{
            wlr_layer::WlrLayerShellState,
            xdg::{ToplevelSurface, XdgShellState},
        },
        shm::ShmState,
    },
};
use std::{cell::RefCell, collections::BTreeMap, path::PathBuf};
use tracing::debug;

pub(crate) mod capture;
mod frame_callbacks;
mod frame_pacing;
pub(crate) mod idle;
mod initialization;
mod input;
mod layers;
mod output_state;
mod scene;
mod session;
mod session_lock;
mod shell_control;
mod space_sync;
mod types;
mod workspaces;
pub use space_sync::{refresh_space, sync_window_to_space};
use types::toplevel_metadata;
pub use types::{ClientGrabSerial, DndIcon, PendingWindowDrag, WindowGrabKind, WindowGrabMeta};

use crate::space_window::KestrelWindow;

pub struct KestrelState {
    pub display_handle: DisplayHandle,
    pub compositor_state: CompositorState,
    pub xdg_shell_state: XdgShellState,
    pub protocol_state: ProtocolState,
    pub layer_shell_state: WlrLayerShellState,
    pub shm_state: ShmState,
    pub seat_state: SeatState<Self>,
    pub data_device_state: DataDeviceState,
    pub primary_selection_state: PrimarySelectionState,
    pub data_control_state: DataControlState,
    pub seat: Seat<Self>,
    pub keyboard: Option<KeyboardHandle<Self>>,
    pub outputs: OutputGraph,
    render_output_name: Option<String>,
    pub layout: LayoutEngine,
    pub windows: WindowStack,
    pub foreign_toplevel_handles: BTreeMap<WindowId, ForeignToplevelHandle>,
    pub popup_manager: PopupManager,
    pub space: Space<KestrelWindow>,
    pub space_windows: BTreeMap<WindowId, KestrelWindow>,
    pub pointer_location: Point<f64, Logical>,
    pub pointer_constraint_hint: Option<(WlSurface, Point<f64, Logical>)>,
    session_lock: session_lock::SessionLock,
    pub(crate) capture_sessions: Vec<smithay::wayland::image_copy_capture::Session>,
    pub(crate) pending_captures: Vec<capture::CaptureRequest>,
    pub(crate) idle_notifier:
        Option<smithay::wayland::idle_notify::IdleNotifierState<KestrelState>>,
    pub(crate) idle_inhibitors: Vec<WlSurface>,
    pub dnd_icon: Option<DndIcon>,
    pub window_grab: Option<WindowGrabMeta>,
    pub pending_window_drag: Option<PendingWindowDrag>,
    pub pending_client_grab: Option<ClientGrabSerial>,
    pub config: LuftConfig,
    pub cursor_image: CursorImageStatus,
    pub frame_cursor_active: bool,
    pub super_active: bool,
    pub super_used: bool,
    pub shell_control_path: Option<PathBuf>,
    pub shell_status: ShellStatus,
    shell_restart_requested: bool,
    pub xwayland_status: XwaylandStatus,
    pub xwayland_display: Option<String>,
    pub titlebar_cache: RefCell<TitlebarCache>,
    pub dmabuf_formats: FormatSet,
    #[cfg(feature = "session-backend")]
    pending_dmabuf_sources: Vec<session::PendingDmabufSource>,
    #[cfg(feature = "session-backend")]
    pending_dmabuf_imports: Vec<smithay::backend::allocator::dmabuf::Dmabuf>,
    #[cfg(feature = "session-backend")]
    pending_syncobj_sources: Vec<session::PendingSyncobjSource>,
    pending_keyboard_led_state: Option<LedState>,
    scene_revisions: BTreeMap<String, u64>,
    structural_revisions: BTreeMap<String, u64>,
    pending_redraws: std::collections::BTreeSet<String>,
    workspace_transition: Option<WorkspaceTransition>,
    serial: u32,
}

impl KestrelState {
    pub fn map_toplevel(&mut self, surface: ToplevelSurface) {
        let parent = self.parent_window_for_toplevel(&surface);
        let workspace = parent
            .and_then(|id| {
                self.windows
                    .window(id)
                    .map(|window| window.workspace.clone())
            })
            .unwrap_or_else(|| self.layout.active_workspace().clone());
        let geometry = parent
            .map(|id| self.next_transient_window_geometry_for_size(id, (900, 560).into()))
            .unwrap_or_else(|| self.next_initial_window_geometry());
        let info = WindowInfo::new(luft_ipc::WindowId(0), workspace.clone(), geometry);

        match self.layout.register_window(info) {
            Ok(id) => {
                let requested_server_decoration = surface
                    .with_pending_state(|state| state.decoration_mode == Some(Mode::ServerSide));
                self.windows.add(
                    id,
                    workspace,
                    surface.clone(),
                    geometry,
                    requested_server_decoration,
                    true,
                );
                if let Some(parent) = parent {
                    self.raise_transient(parent, id);
                }
                self.register_foreign_toplevel(id, &surface);
                self.enter_output(surface.wl_surface());
                space_sync::sync_window_to_space(self, id);
                self.mark_scene_structural_dirty();
            }
            Err(error) => debug!(?error, "failed to register toplevel in layout"),
        }
    }

    pub fn adopt_initial_toplevel_size(&mut self, surface: &WlSurface) -> bool {
        let Some(id) = self.windows.id_for_wl_surface(surface) else {
            return false;
        };
        if !self.windows.initial_size_pending(id) {
            return false;
        }
        let Some(window) = self.windows.window(id) else {
            return false;
        };
        let Some(geometry) = window.committed_surface_geometry() else {
            return false;
        };
        if geometry.size.w < 1 || geometry.size.h < 1 {
            return false;
        }
        let size = geometry.size;

        let geometry = self
            .windows
            .window(id)
            .and_then(|window| self.parent_window_for_toplevel(&window.surface))
            .map(|parent| self.next_transient_window_geometry_for_size(parent, size))
            .unwrap_or_else(|| self.next_initial_window_geometry_for_size(size));
        let Some((_surface, geometry)) = self.windows.set_geometry(id, geometry) else {
            return false;
        };

        self.windows.set_initial_size_pending(id, false);
        let _ = self.layout.set_window_geometry(id, geometry);
        self.apply_active_arrangement();
        true
    }

    pub fn sync_toplevel_parent(&mut self, surface: &ToplevelSurface) {
        let Some(id) = self.windows.id_for_surface(surface) else {
            return;
        };
        let Some(parent) = self.parent_window_for_toplevel(surface) else {
            return;
        };
        if let Some(workspace) = self
            .windows
            .window(parent)
            .map(|window| window.workspace.clone())
        {
            let _ = self.layout.move_window_to_workspace(id, &workspace);
            self.windows.set_workspace(id, workspace);
        }
        self.raise_transient(parent, id);
        self.mark_scene_structural_dirty();
    }

    pub fn unmap_toplevel(&mut self, surface: &ToplevelSurface) {
        self.dismiss_popups_for_surface(surface.wl_surface());
        self.leave_output(surface.wl_surface());
        space_sync::unmap_toplevel_from_space(self, surface);
        if let Some(window) = self.windows.remove(surface) {
            self.remove_foreign_toplevel(window.id);
            self.layout.unregister_window(window.id);
            self.apply_active_arrangement();
            self.mark_scene_structural_dirty();
        }
    }

    pub fn remove_dead_windows(&mut self) -> bool {
        let removed = self.windows.retain_alive();
        for id in &removed {
            self.remove_foreign_toplevel(*id);
            self.layout.unregister_window(*id);
            space_sync::remove_window_from_space(self, *id);
        }
        if !removed.is_empty() {
            self.apply_active_arrangement();
            self.mark_scene_structural_dirty();
        }
        !removed.is_empty()
    }

    pub fn active_window(&self) -> Option<WindowId> {
        self.windows
            .topmost_on_workspace(self.layout.active_workspace())
    }

    pub fn activate_window(
        &mut self,
        keyboard: &KeyboardHandle<Self>,
        id: WindowId,
    ) -> Result<(), LayoutError> {
        let managed = self
            .windows
            .window(id)
            .cloned()
            .ok_or(LayoutError::UnknownWindow(id))?;

        if managed.closing {
            return Err(LayoutError::UnknownWindow(id));
        }
        if managed.hidden {
            self.show_window(id)?;
        }
        if &managed.workspace != self.layout.active_workspace() {
            self.switch_layout_workspace(&managed.workspace)?;
        }
        let surface = self
            .windows
            .raise_by_id(id)
            .unwrap_or_else(|| managed.surface.clone());
        self.set_activated_window(id);
        let serial = self.next_serial();
        keyboard.set_focus(self, Some(surface.wl_surface().clone()), serial);
        space_sync::sync_window_to_space(self, id);
        self.mark_scene_dirty();
        Ok(())
    }

    pub fn activate_surface(
        &mut self,
        keyboard: &KeyboardHandle<Self>,
        surface: &ToplevelSurface,
    ) -> bool {
        let Some(id) = self.windows.id_for_surface(surface) else {
            return false;
        };

        self.activate_window(keyboard, id).is_ok()
    }

    pub fn cycle_active_window(
        &mut self,
        keyboard: &KeyboardHandle<Self>,
        previous: bool,
    ) -> Option<WindowId> {
        let workspace = self.layout.active_workspace().clone();
        let (id, surface) = self.windows.cycle_on_workspace(&workspace, previous)?;
        self.set_activated_window(id);
        let serial = self.next_serial();
        keyboard.set_focus(self, Some(surface.wl_surface().clone()), serial);
        self.mark_scene_dirty();
        Some(id)
    }

    pub fn close_window(&mut self, id: WindowId) -> Result<(), LayoutError> {
        if self.windows.window(id).is_none() {
            return Err(LayoutError::UnknownWindow(id));
        }
        if let Some(surface) = self.windows.start_close(id, true) {
            surface.send_close();
        }
        self.mark_scene_dirty();
        Ok(())
    }

    pub fn close_active_window(&mut self) -> Option<WindowId> {
        let id = self.active_window()?;
        self.close_window(id).ok()?;
        Some(id)
    }

    pub fn send_finished_window_closes(&mut self) -> bool {
        let surfaces = self.windows.drain_close_requests();
        for surface in &surfaces {
            surface.send_close();
        }
        if !surfaces.is_empty() {
            self.mark_scene_dirty();
        }
        !surfaces.is_empty()
    }

    pub fn move_window_to_workspace(
        &mut self,
        id: WindowId,
        workspace: WorkspaceId,
    ) -> Result<(), LayoutError> {
        if self.windows.window(id).is_none() {
            return Err(LayoutError::UnknownWindow(id));
        }

        self.layout.move_window_to_workspace(id, &workspace)?;
        self.windows.set_workspace(id, workspace);
        self.apply_active_arrangement();
        self.mark_scene_dirty();
        Ok(())
    }

    pub fn move_active_window_to_workspace(
        &mut self,
        keyboard: &KeyboardHandle<Self>,
        workspace: WorkspaceId,
    ) -> Option<WindowId> {
        let current_workspace = self.layout.active_workspace().clone();
        let id = self.active_window()?;

        self.move_window_to_workspace(id, workspace.clone()).ok()?;
        if workspace == current_workspace {
            self.activate_window(keyboard, id).ok()?;
            return Some(id);
        }

        self.focus_active_workspace(keyboard);
        Some(id)
    }

    pub fn switch_workspace(
        &mut self,
        keyboard: &KeyboardHandle<Self>,
        workspace: &WorkspaceId,
    ) -> Result<(), LayoutError> {
        self.switch_layout_workspace(workspace)?;
        self.focus_active_workspace(keyboard);
        Ok(())
    }

    pub fn switch_relative_workspace(
        &mut self,
        keyboard: &KeyboardHandle<Self>,
        offset: i32,
    ) -> Result<(), LayoutError> {
        let Some(workspace) = self.layout.relative_workspace(offset) else {
            return Ok(());
        };
        self.switch_workspace(keyboard, &workspace)
    }

    fn switch_layout_workspace(&mut self, workspace: &WorkspaceId) -> Result<(), LayoutError> {
        let from = self.layout.active_workspace().clone();
        self.layout.switch_workspace(workspace)?;
        self.apply_active_arrangement();
        if from != *workspace {
            self.workspace_transition = self
                .workspace_transition_direction(&from, workspace)
                .map(|direction| WorkspaceTransition::new(from, workspace.clone(), direction));
            space_sync::sync_active_workspace(self);
            self.mark_scene_structural_dirty();
        }
        Ok(())
    }

    pub(crate) fn focus_active_workspace(&mut self, keyboard: &KeyboardHandle<Self>) {
        if let Some(id) = self.active_window() {
            let _ = self.activate_window(keyboard, id);
            return;
        }

        self.clear_activated_windows();
        let serial = self.next_serial();
        keyboard.set_focus(self, None, serial);
    }

    fn set_activated_window(&self, active: WindowId) {
        for managed in self.windows.iter() {
            managed.surface.with_pending_state(|surface_state| {
                if managed.id == active {
                    surface_state.states.set(xdg_toplevel::State::Activated);
                } else {
                    surface_state.states.unset(xdg_toplevel::State::Activated);
                }
            });
            managed.surface.send_pending_configure();
        }
    }

    pub fn sync_foreign_toplevel(&mut self, surface: &WlSurface) -> bool {
        let Some((id, toplevel)) = self
            .windows
            .iter()
            .find(|window| window.surface.wl_surface() == surface)
            .map(|window| (window.id, window.surface.clone()))
        else {
            return false;
        };
        let Some(handle) = self.foreign_toplevel_handles.get(&id) else {
            return false;
        };
        let metadata = toplevel_metadata(&toplevel);
        let mut changed = false;
        if handle.title() != metadata.title {
            handle.send_title(&metadata.title);
            changed = true;
        }
        if handle.app_id() != metadata.app_id {
            handle.send_app_id(&metadata.app_id);
            changed = true;
        }
        if changed {
            handle.send_done();
        }
        changed
    }

    fn clear_activated_windows(&self) {
        for managed in self.windows.iter() {
            managed.surface.with_pending_state(|surface_state| {
                surface_state.states.unset(xdg_toplevel::State::Activated);
            });
            managed.surface.send_pending_configure();
        }
    }

    fn parent_window_for_toplevel(&self, surface: &ToplevelSurface) -> Option<WindowId> {
        let parent = surface.parent()?;
        self.windows.id_for_wl_surface(&parent)
    }

    fn register_foreign_toplevel(&mut self, id: WindowId, surface: &ToplevelSurface) {
        let metadata = toplevel_metadata(surface);
        let handle = self
            .protocol_state
            .foreign_toplevel_list
            .new_toplevel::<Self>(metadata.title, metadata.app_id);
        self.foreign_toplevel_handles.insert(id, handle);
    }

    fn remove_foreign_toplevel(&mut self, id: WindowId) {
        if let Some(handle) = self.foreign_toplevel_handles.remove(&id) {
            self.protocol_state
                .foreign_toplevel_list
                .remove_toplevel(&handle);
        }
    }

    fn raise_transient(&mut self, parent: WindowId, child: WindowId) {
        let _ = self.windows.raise_by_id(parent);
        let _ = self.windows.raise_by_id(child);
    }
}
