use std::cell::RefCell;

use smithay::{
    backend::renderer::utils::RendererSurfaceStateUserData,
    desktop::{LayerSurface, WindowSurfaceType, layer_map_for_output},
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    utils::{IsAlive, SERIAL_COUNTER},
    wayland::{
        alpha_modifier::AlphaModifierSurfaceCachedState,
        compositor::{get_role, with_states},
        seat::WaylandFocus,
        shell::wlr_layer::{KeyboardInteractivity, LAYER_SURFACE_ROLE},
    },
};

use crate::{
    focus::KeyboardFocusTarget,
    state::{Backend, KestrelState},
};

#[derive(Default)]
struct LayerFocusState {
    visible: bool,
    previous: Option<KeyboardFocusTarget>,
}

pub(crate) fn layer_surface_visible(surface: &WlSurface) -> bool {
    with_states(surface, |states| {
        states
            .data_map
            .get::<RendererSurfaceStateUserData>()
            .is_some_and(|state| state.lock().unwrap().buffer().is_some())
            && states
                .cached_state
                .get::<AlphaModifierSurfaceCachedState>()
                .current()
                .multiplier()
                != Some(0)
    })
}

impl<B: Backend> KestrelState<B> {
    pub(super) fn update_layer_focus(&mut self, surface: &WlSurface) {
        if get_role(surface) != Some(LAYER_SURFACE_ROLE) || self.session_lock.is_active() {
            return;
        }
        let layer = self.space.outputs().find_map(|output| {
            layer_map_for_output(output)
                .layer_for_surface(surface, WindowSurfaceType::TOPLEVEL)
                .cloned()
        });
        let Some(layer) = layer else {
            return;
        };
        let interactive = layer
            .layer_surface()
            .with_cached_state(|state| state.keyboard_interactivity != KeyboardInteractivity::None);
        let visible = interactive && layer_surface_visible(surface);
        layer
            .user_data()
            .insert_if_missing(|| RefCell::new(LayerFocusState::default()));
        let state = layer.user_data().get::<RefCell<LayerFocusState>>().unwrap();
        if state.borrow().visible == visible {
            return;
        }
        state.borrow_mut().visible = visible;
        if !visible {
            self.restore_layer_focus(&layer);
            return;
        }
        let Some(keyboard) = self.seat.get_keyboard() else {
            return;
        };
        state.borrow_mut().previous = keyboard.current_focus();
        keyboard.set_focus(
            self,
            Some(layer.clone().into()),
            SERIAL_COUNTER.next_serial(),
        );
        self.shell_state_dirty = true;
    }

    pub(super) fn restore_layer_focus(&mut self, layer: &LayerSurface) {
        let Some(keyboard) = self.seat.get_keyboard() else {
            return;
        };
        let previous = layer
            .user_data()
            .get::<RefCell<LayerFocusState>>()
            .and_then(|state| state.borrow_mut().previous.take());
        if keyboard
            .current_focus()
            .and_then(|focus| focus.wl_surface().map(|s| s.into_owned()))
            .as_ref()
            != Some(layer.wl_surface())
        {
            return;
        }
        let previous = previous
            .filter(|focus| {
                if !focus.alive() {
                    return false;
                }
                match focus {
                    KeyboardFocusTarget::LayerSurface(layer) => {
                        layer_surface_visible(layer.wl_surface())
                    }
                    _ => focus
                        .wl_surface()
                        .and_then(|surface| self.window_for_surface(&surface))
                        .is_some_and(|window| self.space.element_location(&window).is_some()),
                }
            })
            .or_else(|| self.space.elements().next_back().cloned().map(Into::into));
        keyboard.set_focus(self, previous, SERIAL_COUNTER.next_serial());
        self.shell_state_dirty = true;
    }
}
