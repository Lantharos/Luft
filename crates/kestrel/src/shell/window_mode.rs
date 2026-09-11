use smithay::{
    desktop::{layer_map_for_output, space::SpaceElement},
    output::Output,
    reexports::{
        wayland_protocols::xdg::{
            decoration::zv1::server::zxdg_toplevel_decoration_v1::Mode, shell::server::xdg_toplevel,
        },
        wayland_server::{Resource, protocol::wl_output::WlOutput},
    },
    utils::Rectangle,
    wayland::shell::xdg::ToplevelSurface,
};
use std::time::{Duration, Instant};

use super::{
    FullscreenSurface,
    ssd::{HEADER_BAR_HEIGHT, WindowAnimation, WindowAnimationKind},
};
use crate::state::{Backend, KestrelState};

impl<B: Backend> KestrelState<B> {
    pub(crate) fn set_window_fullscreen(
        &mut self,
        surface: ToplevelSurface,
        requested: Option<WlOutput>,
        fullscreen: bool,
    ) {
        let Some(window) = self.window_for_surface(surface.wl_surface()) else {
            return;
        };
        let output = requested
            .as_ref()
            .and_then(Output::from_resource)
            .or_else(|| self.output_for_window(&window));
        let outputs = self.space.outputs().cloned().collect::<Vec<_>>();
        for output in outputs {
            if let Some(slot) = output.user_data().get::<FullscreenSurface>()
                && slot.get().as_ref() == Some(&window)
            {
                slot.clear();
                self.backend_data.reset_buffers(&output);
            }
        }
        if fullscreen {
            if let Some(output) = output
                && let Some(geometry) = self.space.output_geometry(&output)
            {
                let client_output = surface
                    .wl_surface()
                    .client()
                    .and_then(|client| output.client_outputs(&client).next());
                {
                    let mut decoration = window.decoration_state();
                    if !decoration.fullscreen && !decoration.maximized {
                        decoration.floating_geometry = self
                            .space
                            .element_location(&window)
                            .map(|loc| Rectangle::new(loc, window.geometry().size));
                    }
                    decoration.fullscreen = true;
                    decoration.pending_initial_center = false;
                    decoration.animation = None;
                }
                window.set_ssd(false);
                surface.with_pending_state(|state| {
                    state.states.set(xdg_toplevel::State::Fullscreen);
                    state.size = Some(geometry.size);
                    state.fullscreen_output = client_output;
                });
                self.position_window(&window, geometry.loc);
                output
                    .user_data()
                    .insert_if_missing(FullscreenSurface::default);
                output
                    .user_data()
                    .get::<FullscreenSurface>()
                    .unwrap()
                    .set(window.clone());
            }
        } else {
            let is_ssd = surface.with_pending_state(|state| {
                state.states.unset(xdg_toplevel::State::Fullscreen);
                state.fullscreen_output = None;
                state.decoration_mode == Some(Mode::ServerSide)
            });
            window.decoration_state().fullscreen = false;
            window.set_ssd(is_ssd);
            let maximized = window.decoration_state().maximized;
            self.set_window_maximized(surface.clone(), maximized);
        }
        self.update_window_mode(&window);
        if surface.is_initial_configure_sent() {
            surface.send_pending_configure();
        }
    }

    pub(crate) fn set_window_maximized(&mut self, surface: ToplevelSurface, maximized: bool) {
        let Some(window) = self.window_for_surface(surface.wl_surface()) else {
            return;
        };
        if window.decoration_state().fullscreen {
            window.decoration_state().maximized = maximized;
            surface.with_pending_state(|state| {
                if maximized {
                    state.states.set(xdg_toplevel::State::Maximized);
                } else {
                    state.states.unset(xdg_toplevel::State::Maximized);
                }
            });
            if surface.is_initial_configure_sent() {
                surface.send_pending_configure();
            }
            return;
        }
        let mapped = self.space.element_location(&window);
        let current = mapped.map(|location| Rectangle::new(location, window.geometry().size));
        let target = if maximized {
            self.output_for_window(&window).and_then(|output| {
                let geometry = self.space.output_geometry(&output)?;
                let zone = layer_map_for_output(&output).non_exclusive_zone();
                Some(Rectangle::new(geometry.loc + zone.loc, zone.size))
            })
        } else {
            window.decoration_state().floating_geometry
        };
        {
            let mut decoration = window.decoration_state();
            if maximized && !decoration.maximized && !decoration.fullscreen {
                decoration.floating_geometry = current;
            }
            decoration.maximized = maximized;
            if target.is_some() {
                decoration.pending_initial_center = false;
            }
            decoration.animation = current.zip(target).map(|(from, to)| WindowAnimation {
                kind: if maximized {
                    WindowAnimationKind::Maximize
                } else {
                    WindowAnimationKind::Unmaximize
                },
                from,
                to,
                started_at: Instant::now(),
                duration: Duration::from_millis(220),
            });
        }
        surface.with_pending_state(|state| {
            if maximized {
                state.states.set(xdg_toplevel::State::Maximized);
            } else {
                state.states.unset(xdg_toplevel::State::Maximized);
            }
            let header = if window.decoration_state().is_ssd {
                HEADER_BAR_HEIGHT
            } else {
                0
            };
            state.size =
                target.map(|rect| (rect.size.w.max(1), (rect.size.h - header).max(1)).into());
        });
        if let Some(target) = target {
            self.position_window(&window, target.loc);
        }
        self.update_window_mode(&window);
        if surface.is_initial_configure_sent() {
            surface.send_pending_configure();
        }
    }
}
