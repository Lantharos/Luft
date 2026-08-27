use super::KestrelState;
use crate::{
    layout_config::layout_from_config,
    output::{NestedOutput, OutputDescriptor, OutputGraph},
    protocol_state::ProtocolState,
    titlebar::TitlebarCache,
    window::WindowStack,
};
use luft_config::LuftConfig;
use smithay::{
    desktop::{PopupManager, Space},
    input::{
        SeatState,
        pointer::{CursorIcon, CursorImageStatus},
    },
    reexports::wayland_server::DisplayHandle,
    utils::{Logical, Size},
    wayland::{
        compositor::CompositorState,
        selection::{
            data_device::DataDeviceState, ext_data_control::DataControlState,
            primary_selection::PrimarySelectionState,
        },
        shell::{wlr_layer::WlrLayerShellState, xdg::XdgShellState},
        shm::ShmState,
    },
};
use std::{cell::RefCell, collections::BTreeMap};

impl KestrelState {
    pub fn new(display: &DisplayHandle, config: LuftConfig) -> Self {
        Self::new_for_output(display, config, NestedOutput::default().descriptor())
    }

    pub fn new_for_output(
        display: &DisplayHandle,
        config: LuftConfig,
        output_descriptor: OutputDescriptor,
    ) -> Self {
        Self::new_for_outputs(display, config, vec![output_descriptor])
    }

    pub fn new_for_outputs(
        display: &DisplayHandle,
        config: LuftConfig,
        output_descriptors: Vec<OutputDescriptor>,
    ) -> Self {
        let compositor_state = CompositorState::new_v6::<Self>(display);
        let xdg_shell_state = XdgShellState::new::<Self>(display);
        let protocol_state = ProtocolState::new(display);
        let layer_shell_state = WlrLayerShellState::new::<Self>(display);
        let shm_state = ShmState::new::<Self>(display, vec![]);
        let data_device_state = DataDeviceState::new::<Self>(display);
        let primary_selection_state = PrimarySelectionState::new::<Self>(display);
        let data_control_state =
            DataControlState::new::<Self, _>(display, Some(&primary_selection_state), |_| true);
        let mut seat_state = SeatState::new();
        let seat = seat_state.new_wl_seat(display, "luft-seat");
        let outputs = OutputGraph::new(display, &config.display, output_descriptors);
        let mut layout = layout_from_config(&config);
        let output_size = outputs.primary_size();
        let scale = outputs.primary_scale().max(1.0);
        let logical = Size::<i32, Logical>::from((
            (f64::from(output_size.w) / scale).round().max(1.0) as i32,
            (f64::from(output_size.h) / scale).round().max(1.0) as i32,
        ));
        layout.set_bounds(luft_ipc::Rect::new(0, 0, logical.w, logical.h));
        let mut space = Space::default();
        for output in outputs.managed_outputs().filter(|output| output.enabled) {
            space.map_output(&output.output, output.location);
        }

        Self {
            display_handle: display.clone(),
            compositor_state,
            xdg_shell_state,
            protocol_state,
            layer_shell_state,
            shm_state,
            seat_state,
            data_device_state,
            primary_selection_state,
            data_control_state,
            seat,
            keyboard: None,
            outputs,
            render_output_name: None,
            layout,
            windows: WindowStack::default(),
            foreign_toplevel_handles: BTreeMap::new(),
            popup_manager: PopupManager::default(),
            space,
            space_windows: BTreeMap::new(),
            pointer_location: (0.0, 0.0).into(),
            pointer_constraint_hint: None,
            session_lock: super::session_lock::SessionLock::default(),
            capture_sessions: Vec::new(),
            pending_captures: Vec::new(),
            idle_notifier: None,
            idle_inhibitors: Vec::new(),
            dnd_icon: None,
            window_grab: None,
            pending_window_drag: None,
            pending_client_grab: None,
            config,
            cursor_image: CursorImageStatus::Named(CursorIcon::Default),
            frame_cursor_active: false,
            super_active: false,
            super_used: false,
            shell_control_path: None,
            shell_status: luft_ipc::ShellStatus::NotStarted,
            shell_restart_requested: false,
            xwayland_status: luft_ipc::XwaylandStatus::Disabled,
            xwayland_display: None,
            titlebar_cache: RefCell::new(TitlebarCache::default()),
            dmabuf_formats: Default::default(),
            #[cfg(feature = "session-backend")]
            pending_dmabuf_sources: Vec::new(),
            #[cfg(feature = "session-backend")]
            pending_dmabuf_imports: Vec::new(),
            #[cfg(feature = "session-backend")]
            pending_syncobj_sources: Vec::new(),
            pending_keyboard_led_state: None,
            scene_revisions: BTreeMap::new(),
            structural_revisions: BTreeMap::new(),
            pending_redraws: Default::default(),
            workspace_transition: None,
            serial: 1,
        }
    }
}
