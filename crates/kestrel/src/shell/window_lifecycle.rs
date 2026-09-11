use luft_ipc::{Rect, WindowState};
use smithay::{
    backend::renderer::utils::with_renderer_surface_state,
    desktop::{layer_map_for_output, space::SpaceElement},
    output::Output,
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    utils::{Logical, Point, SERIAL_COUNTER},
};
use std::time::{Duration, Instant};

use super::{
    WindowElement,
    ssd::{WindowAnimation, WindowAnimationKind},
};
use crate::state::{Backend, KestrelState};

impl WindowElement {
    pub(crate) fn has_buffer(&self) -> bool {
        self.wl_surface().is_some_and(|surface| {
            with_renderer_surface_state(&surface, |state| state.buffer().is_some()).unwrap_or(false)
        })
    }

    pub(crate) fn layout_mode(&self) -> WindowState {
        let decoration = self.decoration_state();
        if decoration.fullscreen {
            WindowState::Fullscreen
        } else if decoration.maximized {
            WindowState::Maximized
        } else {
            WindowState::Floating
        }
    }
}

impl<B: Backend> KestrelState<B> {
    pub(crate) fn output_for_window(&self, window: &WindowElement) -> Option<Output> {
        self.space
            .outputs_for_element(window)
            .first()
            .cloned()
            .or_else(|| {
                self.space
                    .output_under(self.pointer.current_location())
                    .next()
                    .cloned()
            })
            .or_else(|| self.space.outputs().next().cloned())
    }

    pub(crate) fn position_window(
        &mut self,
        window: &WindowElement,
        location: Point<i32, Logical>,
    ) {
        if let Some((id, _)) = self
            .windows
            .iter()
            .find(|(_, candidate)| *candidate == window)
            && let Some(info) = self.layout.window_mut(*id)
        {
            let size = window.geometry().size;
            info.geometry = Rect::new(location.x, location.y, size.w, size.h);
        }
        if self.space.element_location(window).is_some() {
            self.space.map_element(window.clone(), location, false);
        }
        self.shell_state_dirty = true;
    }

    pub(crate) fn commit_window(&mut self, surface: &WlSurface) {
        let Some(window) = self.window_for_surface(surface) else {
            return;
        };
        if !window.has_buffer() {
            if self.space.element_location(&window).is_some() {
                self.space.unmap_elem(&window);
                let mut decoration = window.decoration_state();
                decoration.pending_initial_center = true;
                decoration.animation = None;
                decoration.fullscreen = false;
                decoration.maximized = false;
                decoration.floating_geometry = None;
                drop(decoration);
                self.update_window_mode(&window);
                for output in self.space.outputs() {
                    if let Some(slot) = output.user_data().get::<super::FullscreenSurface>()
                        && slot.get().as_ref() == Some(&window)
                    {
                        slot.clear();
                    }
                }
            }
            self.reconcile_workspace();
            self.shell_state_dirty = true;
            return;
        }
        let new_window = window.decoration_state().pending_initial_center;
        if new_window {
            let Some(output) = self.output_for_window(&window) else {
                return;
            };
            let Some(geometry) = self.space.output_geometry(&output) else {
                return;
            };
            let size = window.geometry().size;
            let zone = layer_map_for_output(&output).non_exclusive_zone();
            let location = Point::from((
                geometry.loc.x + zone.loc.x + ((zone.size.w - size.w) / 2).max(0),
                geometry.loc.y + zone.loc.y + ((zone.size.h - size.h) / 2).max(0),
            ));
            self.position_window(&window, location);
            let target = smithay::utils::Rectangle::new(location, size);
            let mut decoration = window.decoration_state();
            decoration.pending_initial_center = false;
            decoration.animation = Some(WindowAnimation {
                kind: WindowAnimationKind::Open,
                from: target,
                to: target,
                started_at: Instant::now(),
                duration: Duration::from_millis(180),
            });
        }
        let was_mapped = self.space.element_location(&window).is_some();
        self.reconcile_workspace();
        if !was_mapped
            && self.space.element_location(&window).is_some()
            && !self.session_lock.is_active()
        {
            self.space.raise_element(&window, true);
            if let Some(keyboard) = self.seat.get_keyboard() {
                keyboard.set_focus(self, Some(window.into()), SERIAL_COUNTER.next_serial());
            }
        }
        self.shell_state_dirty = true;
    }

    pub(crate) fn update_window_mode(&mut self, window: &WindowElement) {
        if let Some((id, _)) = self
            .windows
            .iter()
            .find(|(_, candidate)| *candidate == window)
            && let Some(info) = self.layout.window_mut(*id)
            && info.state != WindowState::Hidden
        {
            info.state = window.layout_mode();
        }
        self.shell_state_dirty = true;
    }
}
