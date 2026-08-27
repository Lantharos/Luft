use crate::{client::ClientState, commit, state::KestrelState};
#[cfg(feature = "session-backend")]
use smithay::wayland::drm_syncobj::{DrmSyncobjHandler, DrmSyncobjState};
use smithay::{
    backend::allocator::Buffer,
    delegate_dispatch2,
    desktop::PopupKind,
    input::{
        Seat, SeatHandler,
        dnd::{DnDGrab, DndGrabHandler, DndTarget, GrabType, Source},
        keyboard::LedState,
        pointer::CursorImageStatus,
        tablet::TabletSeatHandler,
    },
    output::Output,
    reexports::wayland_server::{
        Client, Resource,
        protocol::{wl_buffer, wl_output::WlOutput, wl_surface::WlSurface},
    },
    utils::{Logical, Point, Serial},
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
        xdg_activation::{
            XdgActivationHandler, XdgActivationState, XdgActivationToken, XdgActivationTokenData,
        },
        xdg_foreign::{XdgForeignHandler, XdgForeignState},
    },
};
use tracing::debug;

mod capture;
mod idle;
mod input_support;
mod output_management;
mod session_lock;
mod toplevel_icon;
mod xdg;
use self::xdg::configure_existing_popup;
pub use output_management::OutputManagementState;
pub use toplevel_icon::{ToplevelIconGlobal, toplevel_icon_for_surface};

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
        output: Option<WlOutput>,
        layer: Layer,
        namespace: String,
    ) {
        let output = output
            .as_ref()
            .and_then(Output::from_resource)
            .unwrap_or_else(|| self.output().clone());
        let output_name = output.name();
        self.map_layer_surface(surface, namespace.clone(), output);
        self.mark_output_structural_dirty(&output_name);
        tracing::info!(?layer, namespace, "mapped layer surface");
    }

    fn new_popup(&mut self, parent: LayerSurface, popup: PopupSurface) {
        let output = self
            .layer_output_for_surface(parent.wl_surface())
            .unwrap_or_else(|| self.output().clone());
        output.enter(popup.wl_surface());
        configure_existing_popup(&popup, self.popup_constraint_for(&popup));
        let _ = self
            .popup_manager
            .track_popup(PopupKind::from(popup.clone()));
        let _ = popup.send_configure();
        self.mark_output_structural_dirty(&output.name());
    }

    fn layer_destroyed(&mut self, surface: LayerSurface) {
        let output_name = self
            .layer_output_for_surface(surface.wl_surface())
            .map(|output| output.name());
        self.unmap_layer_surface(&surface);
        if let Some(output_name) = output_name {
            self.mark_output_structural_dirty(&output_name);
        }
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

impl WaylandDndGrabHandler for KestrelState {
    fn dnd_requested<S: Source>(
        &mut self,
        source: S,
        icon: Option<WlSurface>,
        seat: Seat<Self>,
        serial: Serial,
        type_: GrabType,
    ) {
        if self.session_locked() {
            source.cancel();
            return;
        }
        self.dnd_icon = icon.map(|surface| crate::state::DndIcon {
            surface,
            offset: (0, 0).into(),
        });
        self.mark_scene_dirty();

        match type_ {
            GrabType::Pointer => {
                let Some(pointer) = seat.get_pointer() else {
                    source.cancel();
                    return;
                };
                let Some(start_data) = pointer.grab_start_data() else {
                    source.cancel();
                    return;
                };
                let display = self.display_handle.clone();
                pointer.set_grab(
                    self,
                    DnDGrab::new_pointer(&display, start_data, source, seat),
                    serial,
                    smithay::input::pointer::Focus::Keep,
                );
            }
            GrabType::Touch => source.cancel(),
        }
    }
}

impl DndGrabHandler for KestrelState {
    fn dropped(
        &mut self,
        _target: Option<DndTarget<'_, Self>>,
        _validated: bool,
        _seat: Seat<Self>,
        _location: Point<f64, Logical>,
    ) {
        self.dnd_icon = None;
        self.mark_scene_dirty();
    }

    fn cancelled(&mut self, _seat: Seat<Self>, _location: Point<f64, Logical>) {
        self.dnd_icon = None;
        self.mark_scene_dirty();
    }
}

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

        use smithay::wayland::text_input::TextInputSeat;
        let text_input = seat.text_input();
        text_input.leave();
        text_input.set_focus(focused.cloned());
        text_input.enter();
    }

    fn cursor_image(&mut self, _seat: &Seat<Self>, image: CursorImageStatus) {
        self.frame_cursor_active = false;
        self.cursor_image = image;
        self.mark_scene_dirty();
    }

    fn led_state_changed(&mut self, _seat: &Seat<Self>, led_state: LedState) {
        self.set_pending_keyboard_led_state(led_state);
    }
}

impl TabletSeatHandler for KestrelState {
    type ToolFocus = WlSurface;
}

delegate_dispatch2!(KestrelState);
