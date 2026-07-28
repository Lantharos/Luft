use crate::{client::ClientState, commit, state::KestrelState};
use smithay::{
    backend::allocator::Buffer,
    delegate_alpha_modifier, delegate_compositor, delegate_cursor_shape, delegate_data_device,
    delegate_dmabuf, delegate_ext_data_control, delegate_foreign_toplevel_list,
    delegate_fractional_scale, delegate_keyboard_shortcuts_inhibit, delegate_layer_shell,
    delegate_output, delegate_pointer_gestures, delegate_presentation, delegate_primary_selection,
    delegate_relative_pointer, delegate_seat, delegate_shm, delegate_single_pixel_buffer,
    delegate_text_input_manager, delegate_viewporter, delegate_xdg_activation,
    delegate_xdg_decoration, delegate_xdg_foreign, delegate_xdg_shell,
    desktop::PopupKind,
    input::{
        Seat, SeatHandler,
        keyboard::LedState,
        pointer::CursorImageStatus,
    },
    output::Output,
    reexports::wayland_server::{
        Client, Resource,
        protocol::{wl_buffer, wl_output::WlOutput, wl_surface::WlSurface},
    },
    wayland::{
        buffer::BufferHandler,
        compositor::{CompositorClientState, CompositorHandler, CompositorState},
        dmabuf::{DmabufGlobal, DmabufHandler, DmabufState, ImportNotifier},
        foreign_toplevel_list::{ForeignToplevelListHandler, ForeignToplevelListState},
        keyboard_shortcuts_inhibit::{
            KeyboardShortcutsInhibitHandler, KeyboardShortcutsInhibitState,
            KeyboardShortcutsInhibitor,
        },
        output::OutputHandler,
        selection::{
            SelectionHandler,
            data_device::{
                DataDeviceHandler, DataDeviceState, WaylandDndGrabHandler, set_data_device_focus,
            },
            ext_data_control::{DataControlHandler, DataControlState},
            primary_selection::{
                PrimarySelectionHandler, PrimarySelectionState, set_primary_focus,
            },
        },
        shell::wlr_layer::{Layer, LayerSurface, WlrLayerShellHandler, WlrLayerShellState},
        shell::xdg::PopupSurface,
        shm::{ShmHandler, ShmState},
        tablet_manager::TabletSeatHandler,
        xdg_activation::{
            XdgActivationHandler, XdgActivationState, XdgActivationToken, XdgActivationTokenData,
        },
        xdg_foreign::{XdgForeignHandler, XdgForeignState},
    },
};
#[cfg(feature = "session-backend")]
use smithay::{
    delegate_drm_syncobj,
    wayland::drm_syncobj::{DrmSyncobjHandler, DrmSyncobjState},
};
use tracing::debug;

mod xdg;
mod toplevel_icon;
pub use toplevel_icon::{ToplevelIconGlobal, toplevel_icon_for_surface};
use self::xdg::configure_existing_popup;

impl BufferHandler for KestrelState {
    fn buffer_destroyed(&mut self, _buffer: &wl_buffer::WlBuffer) {}
}

impl DmabufHandler for KestrelState {
    fn dmabuf_state(&mut self) -> &mut DmabufState {
        &mut self.protocol_state.dmabuf
    }

    fn dmabuf_imported(
        &mut self,
        _global: &DmabufGlobal,
        dmabuf: smithay::backend::allocator::dmabuf::Dmabuf,
        notifier: ImportNotifier,
    ) {
        if self.dmabuf_formats.contains(&dmabuf.format()) {
            let _ = notifier.successful::<Self>();
        } else {
            notifier.failed();
        }
    }
}

#[cfg(feature = "session-backend")]
impl DrmSyncobjHandler for KestrelState {
    fn drm_syncobj_state(&mut self) -> Option<&mut DrmSyncobjState> {
        self.protocol_state.drm_syncobj.as_mut()
    }
}

impl XdgActivationHandler for KestrelState {
    fn activation_state(&mut self) -> &mut XdgActivationState {
        &mut self.protocol_state.xdg_activation
    }

    fn request_activation(
        &mut self,
        token: XdgActivationToken,
        _token_data: XdgActivationTokenData,
        surface: WlSurface,
    ) {
        self.protocol_state.xdg_activation.remove_token(&token);
        let Some(id) = self.windows.id_for_wl_surface(&surface) else {
            debug!(token = %token.as_str(), "ignored activation for unmanaged surface");
            return;
        };
        let Some(keyboard) = self.keyboard.clone() else {
            debug!(token = %token.as_str(), ?id, "ignored activation without keyboard seat");
            return;
        };

        if let Err(error) = self.activate_window(&keyboard, id) {
            debug!(token = %token.as_str(), ?id, ?error, "failed to activate requested window");
        }
    }
}

impl KestrelState {}

impl XdgForeignHandler for KestrelState {
    fn xdg_foreign_state(&mut self) -> &mut XdgForeignState {
        &mut self.protocol_state.xdg_foreign
    }
}

impl ForeignToplevelListHandler for KestrelState {
    fn foreign_toplevel_list_state(&mut self) -> &mut ForeignToplevelListState {
        &mut self.protocol_state.foreign_toplevel_list
    }
}

impl KeyboardShortcutsInhibitHandler for KestrelState {
    fn keyboard_shortcuts_inhibit_state(&mut self) -> &mut KeyboardShortcutsInhibitState {
        &mut self.protocol_state.keyboard_shortcuts_inhibit
    }

    fn new_inhibitor(&mut self, inhibitor: KeyboardShortcutsInhibitor) {
        inhibitor.activate();
    }
}

impl WlrLayerShellHandler for KestrelState {
    fn shell_state(&mut self) -> &mut WlrLayerShellState {
        &mut self.layer_shell_state
    }

    fn new_layer_surface(
        &mut self,
        surface: LayerSurface,
        _output: Option<WlOutput>,
        layer: Layer,
        namespace: String,
    ) {
        self.map_layer_surface(surface, namespace.clone());
        self.mark_scene_dirty();
        debug!(?layer, namespace, "mapped layer surface");
    }

    fn new_popup(&mut self, _parent: LayerSurface, popup: PopupSurface) {
        self.enter_output(popup.wl_surface());
        configure_existing_popup(&popup, self.popup_constraint_for(&popup));
        let _ = self
            .popup_manager
            .track_popup(PopupKind::from(popup.clone()));
        let _ = popup.send_configure();
        self.mark_scene_dirty();
    }

    fn layer_destroyed(&mut self, surface: LayerSurface) {
        self.unmap_layer_surface(&surface);
        self.mark_scene_dirty();
        debug!("unmapped layer surface");
    }
}

impl OutputHandler for KestrelState {
    fn output_bound(&mut self, output: Output, _wl_output: WlOutput) {
        debug!(name = %output.name(), "client bound output");
    }
}

impl SelectionHandler for KestrelState {
    type SelectionUserData = ();
}

impl DataDeviceHandler for KestrelState {
    fn data_device_state(&mut self) -> &mut DataDeviceState {
        &mut self.data_device_state
    }
}

impl PrimarySelectionHandler for KestrelState {
    fn primary_selection_state(&mut self) -> &mut PrimarySelectionState {
        &mut self.primary_selection_state
    }
}

impl DataControlHandler for KestrelState {
    fn data_control_state(&mut self) -> &mut DataControlState {
        &mut self.data_control_state
    }
}

impl WaylandDndGrabHandler for KestrelState {}

impl CompositorHandler for KestrelState {
    fn compositor_state(&mut self) -> &mut CompositorState {
        &mut self.compositor_state
    }

    fn client_compositor_state<'a>(&self, client: &'a Client) -> &'a CompositorClientState {
        &client.get_data::<ClientState>().unwrap().compositor_state
    }

    fn new_surface(&mut self, surface: &WlSurface) {
        commit::install_surface_hooks(self, surface);
        self.mark_scene_dirty();
    }

    fn commit(&mut self, surface: &WlSurface) {
        commit::surface_commit(self, surface);
    }
}

impl ShmHandler for KestrelState {
    fn shm_state(&self) -> &ShmState {
        &self.shm_state
    }
}

impl SeatHandler for KestrelState {
    type KeyboardFocus = WlSurface;
    type PointerFocus = WlSurface;
    type TouchFocus = WlSurface;

    fn seat_state(&mut self) -> &mut smithay::input::SeatState<Self> {
        &mut self.seat_state
    }

    fn focus_changed(&mut self, seat: &Seat<Self>, focused: Option<&WlSurface>) {
        let client = focused.and_then(Resource::client);
        set_data_device_focus(&self.display_handle, seat, client.clone());
        set_primary_focus(&self.display_handle, seat, client);
    }

    fn cursor_image(&mut self, _seat: &Seat<Self>, image: CursorImageStatus) {
        self.frame_cursor_active = false;
        self.cursor_image = image;
        self.cursor_dirty = true;
        self.mark_scene_dirty();
    }

    fn led_state_changed(&mut self, _seat: &Seat<Self>, led_state: LedState) {
        self.set_pending_keyboard_led_state(led_state);
    }
}

impl TabletSeatHandler for KestrelState {}

delegate_xdg_shell!(KestrelState);
delegate_xdg_decoration!(KestrelState);
delegate_xdg_foreign!(KestrelState);
delegate_foreign_toplevel_list!(KestrelState);
delegate_keyboard_shortcuts_inhibit!(KestrelState);
delegate_relative_pointer!(KestrelState);
delegate_pointer_gestures!(KestrelState);
delegate_xdg_activation!(KestrelState);
delegate_cursor_shape!(KestrelState);
delegate_fractional_scale!(KestrelState);
delegate_viewporter!(KestrelState);
delegate_text_input_manager!(KestrelState);
delegate_presentation!(KestrelState);
delegate_layer_shell!(KestrelState);
delegate_compositor!(KestrelState);
delegate_dmabuf!(KestrelState);
delegate_output!(KestrelState);
delegate_shm!(KestrelState);
delegate_seat!(KestrelState);
delegate_data_device!(KestrelState);
delegate_primary_selection!(KestrelState);
delegate_ext_data_control!(KestrelState);
delegate_alpha_modifier!(KestrelState);
delegate_single_pixel_buffer!(KestrelState);

#[cfg(feature = "session-backend")]
delegate_drm_syncobj!(KestrelState);

