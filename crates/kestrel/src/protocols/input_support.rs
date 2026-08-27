use crate::state::KestrelState;
use smithay::{
    desktop::{PopupKind, PopupManager},
    input::pointer::PointerHandle,
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    utils::{Logical, Point, Rectangle},
    wayland::{
        input_method::{InputMethodHandler, PopupSurface},
        pointer_constraints::{PointerConstraintsHandler, with_pointer_constraint},
    },
};

impl PointerConstraintsHandler for KestrelState {
    fn new_constraint(&mut self, surface: &WlSurface, pointer: &PointerHandle<Self>) {
        let origin = self
            .pointer_focus(self.pointer_location)
            .filter(|(focused, _)| focused == surface)
            .map(|(_, origin)| origin);
        let Some(origin) = origin else {
            return;
        };

        with_pointer_constraint(surface, pointer, |constraint| {
            let Some(constraint) = constraint else {
                return;
            };
            if constraint.region().is_none_or(|region| {
                region.contains((self.pointer_location - origin).to_i32_round())
            }) {
                constraint.activate();
            }
        });
    }

    fn remove_constraint(&mut self, surface: &WlSurface, pointer: &PointerHandle<Self>) {
        if with_pointer_constraint(surface, pointer, |constraint| constraint.is_some()) {
            return;
        }

        let Some((hint_surface, hint)) = self.pointer_constraint_hint.take() else {
            return;
        };
        if hint_surface != *surface {
            self.pointer_constraint_hint = Some((hint_surface, hint));
            return;
        }

        if let Some((_, origin)) = self
            .pointer_focus(self.pointer_location)
            .filter(|(focused, _)| focused == surface)
        {
            let location = origin + hint;
            pointer.set_location(location);
            self.pointer_location = location;
            self.mark_scene_dirty();
        }
    }

    fn cursor_position_hint(
        &mut self,
        surface: &WlSurface,
        pointer: &PointerHandle<Self>,
        location: Point<f64, Logical>,
    ) {
        if with_pointer_constraint(surface, pointer, |constraint| {
            constraint.is_some_and(|constraint| constraint.is_active())
        }) {
            self.pointer_constraint_hint = Some((surface.clone(), location));
        }
    }
}

impl InputMethodHandler for KestrelState {
    fn new_popup(&mut self, surface: PopupSurface) {
        let _ = self.popup_manager.track_popup(PopupKind::from(surface));
        self.mark_scene_dirty();
    }

    fn dismiss_popup(&mut self, surface: PopupSurface) {
        if let Some(parent) = surface.get_parent().map(|parent| parent.surface.clone()) {
            let _ = PopupManager::dismiss_popup(&parent, &PopupKind::from(surface));
        }
        self.popup_manager.cleanup();
        self.mark_scene_dirty();
    }

    fn popup_repositioned(&mut self, _surface: PopupSurface) {
        self.mark_scene_dirty();
    }

    fn parent_geometry(&self, parent: &WlSurface) -> Rectangle<i32, Logical> {
        let Some(id) = self.windows.id_for_wl_surface(parent) else {
            return Rectangle::default();
        };
        let Some(window) = self.windows.window(id) else {
            return Rectangle::default();
        };
        Rectangle::new(window.content_location(), window.size)
    }
}
