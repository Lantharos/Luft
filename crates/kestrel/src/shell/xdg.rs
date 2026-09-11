use std::{
    cell::RefCell,
    time::{Duration, Instant},
};

use smithay::{
    desktop::{
        PopupKeyboardGrab, PopupKind, PopupPointerGrab, PopupUngrabStrategy, Space, Window,
        WindowSurfaceType, find_popup_root_surface, get_popup_toplevel_coords,
        layer_map_for_output, space::SpaceElement,
    },
    input::{Seat, pointer::Focus},
    reexports::{
        wayland_protocols::xdg::{decoration as xdg_decoration, shell::server::xdg_toplevel},
        wayland_server::{
            Resource,
            protocol::{wl_output, wl_seat, wl_surface::WlSurface},
        },
    },
    utils::{Logical, Point, Rectangle, Serial},
    wayland::{
        compositor::with_states,
        seat::WaylandFocus,
        shell::xdg::{
            Configure, PopupSurface, PositionerState, ToplevelCachedState, ToplevelSurface,
            XdgShellHandler, XdgShellState,
        },
    },
};
use tracing::warn;

use crate::{
    focus::KeyboardFocusTarget,
    shell::{TouchMoveSurfaceGrab, TouchResizeSurfaceGrab},
    state::{Backend, KestrelState},
};

use super::{
    PointerMoveSurfaceGrab, PointerResizeSurfaceGrab, ResizeData, ResizeEdge, ResizeState,
    SurfaceData, WindowElement, place_new_window,
    ssd::{HEADER_BAR_HEIGHT, WindowAnimation, WindowAnimationKind},
};

impl<BackendData: Backend> XdgShellHandler for KestrelState<BackendData> {
    fn xdg_shell_state(&mut self) -> &mut XdgShellState {
        &mut self.xdg_shell_state
    }

    fn new_toplevel(&mut self, surface: ToplevelSurface) {
        // Do not send a configure here, the initial configure
        // of a xdg_surface has to be sent during the commit if
        // the surface is not already configured
        let window = WindowElement(Window::new_wayland_window(surface.clone()));
        place_new_window(
            &mut self.space,
            self.pointer.current_location(),
            &window,
            true,
            false,
        );
        self.register_window(window);
    }

    fn new_popup(&mut self, surface: PopupSurface, _positioner: PositionerState) {
        // Do not send a configure here, the initial configure
        // of a xdg_surface has to be sent during the commit if
        // the surface is not already configured

        self.unconstrain_popup(&surface);

        if let Err(err) = self.popups.track_popup(PopupKind::from(surface)) {
            warn!("Failed to track popup: {}", err);
        }
    }

    fn reposition_request(
        &mut self,
        surface: PopupSurface,
        positioner: PositionerState,
        token: u32,
    ) {
        surface.with_pending_state(|state| {
            let geometry = positioner.get_geometry();
            state.geometry = geometry;
            state.positioner = positioner;
        });
        self.unconstrain_popup(&surface);
        surface.send_repositioned(token);
    }

    fn move_request(&mut self, surface: ToplevelSurface, seat: wl_seat::WlSeat, serial: Serial) {
        let seat: Seat<KestrelState<BackendData>> = Seat::from_resource(&seat).unwrap();
        self.move_request_xdg(&surface, &seat, serial)
    }

    fn resize_request(
        &mut self,
        surface: ToplevelSurface,
        seat: wl_seat::WlSeat,
        serial: Serial,
        edges: xdg_toplevel::ResizeEdge,
    ) {
        let seat: Seat<KestrelState<BackendData>> = Seat::from_resource(&seat).unwrap();

        if let Some(touch) = seat.get_touch()
            && touch.has_grab(serial)
        {
            let start_data = touch.grab_start_data().unwrap();
            tracing::info!(?start_data);

            // If the client disconnects after requesting a move
            // we can just ignore the request
            let Some(window) = self.window_for_surface(surface.wl_surface()) else {
                tracing::info!("no window");
                return;
            };

            // If the focus was for a different surface, ignore the request.
            if start_data.focus.is_none()
                || !start_data
                    .focus
                    .as_ref()
                    .unwrap()
                    .0
                    .same_client_as(&surface.wl_surface().id())
            {
                tracing::info!("different surface");
                return;
            }
            let geometry = window.geometry();
            let loc = self.space.element_location(&window).unwrap();
            let (initial_window_location, initial_window_size) = (loc, geometry.size);

            with_states(surface.wl_surface(), move |states| {
                states
                    .data_map
                    .get::<RefCell<SurfaceData>>()
                    .unwrap()
                    .borrow_mut()
                    .resize_state = ResizeState::Resizing(ResizeData {
                    edges: edges.into(),
                    initial_window_location,
                    initial_window_size,
                });
            });

            let grab = TouchResizeSurfaceGrab {
                start_data,
                window,
                edges: edges.into(),
                initial_window_location,
                initial_window_size,
                last_window_size: initial_window_size,
            };

            touch.set_grab(self, grab, serial);
            return;
        }

        let pointer = seat.get_pointer().unwrap();

        // Check that this surface has a click grab.
        if !pointer.has_grab(serial) {
            return;
        }

        let start_data = pointer.grab_start_data().unwrap();

        let window = self.window_for_surface(surface.wl_surface()).unwrap();

        // If the focus was for a different surface, ignore the request.
        if start_data.focus.is_none()
            || !start_data
                .focus
                .as_ref()
                .unwrap()
                .0
                .same_client_as(&surface.wl_surface().id())
        {
            return;
        }

        let geometry = window.geometry();
        let loc = self.space.element_location(&window).unwrap();
        let (initial_window_location, initial_window_size) = (loc, geometry.size);

        with_states(surface.wl_surface(), move |states| {
            states
                .data_map
                .get::<RefCell<SurfaceData>>()
                .unwrap()
                .borrow_mut()
                .resize_state = ResizeState::Resizing(ResizeData {
                edges: edges.into(),
                initial_window_location,
                initial_window_size,
            });
        });

        let grab = PointerResizeSurfaceGrab {
            start_data,
            window,
            edges: edges.into(),
            initial_window_location,
            initial_window_size,
            last_window_size: initial_window_size,
        };

        pointer.set_grab(self, grab, serial, Focus::Clear);
    }

    fn ack_configure(&mut self, surface: WlSurface, configure: Configure) {
        if let Configure::Toplevel(configure) = configure {
            if let Some(serial) = with_states(&surface, |states| {
                if let Some(data) = states.data_map.get::<RefCell<SurfaceData>>()
                    && let ResizeState::WaitingForFinalAck(_, serial) = data.borrow().resize_state
                {
                    return Some(serial);
                }

                None
            }) {
                // When the resize grab is released the surface
                // resize state will be set to WaitingForFinalAck
                // and the client will receive a configure request
                // without the resize state to inform the client
                // resizing has finished. Here we will wait for
                // the client to acknowledge the end of the
                // resizing. To check if the surface was resizing
                // before sending the configure we need to use
                // the current state as the received acknowledge
                // will no longer have the resize state set
                let is_resizing = with_states(&surface, |states| {
                    states
                        .cached_state
                        .get::<ToplevelCachedState>()
                        .current()
                        .last_acked
                        .as_ref()
                        .is_some_and(|c| c.state.states.contains(xdg_toplevel::State::Resizing))
                });

                if configure.serial >= serial && is_resizing {
                    with_states(&surface, |states| {
                        let mut data = states
                            .data_map
                            .get::<RefCell<SurfaceData>>()
                            .unwrap()
                            .borrow_mut();
                        if let ResizeState::WaitingForFinalAck(resize_data, _) = data.resize_state {
                            data.resize_state = ResizeState::WaitingForCommit(resize_data);
                        } else {
                            unreachable!()
                        }
                    });
                }
            }

            let window = self
                .windows
                .values()
                .find(|element| element.wl_surface().as_deref() == Some(&surface));
            if let Some(window) = window {
                use xdg_decoration::zv1::server::zxdg_toplevel_decoration_v1::Mode;
                let is_ssd = configure
                    .state
                    .decoration_mode
                    .map(|mode| mode == Mode::ServerSide)
                    .unwrap_or(false);
                let fullscreen = window.decoration_state().fullscreen;
                window.set_ssd(is_ssd && !fullscreen);
            }
        }
    }

    fn fullscreen_request(
        &mut self,
        surface: ToplevelSurface,
        output: Option<wl_output::WlOutput>,
    ) {
        self.set_window_fullscreen(surface, output, true);
    }

    fn unfullscreen_request(&mut self, surface: ToplevelSurface) {
        self.set_window_fullscreen(surface, None, false);
    }

    fn minimize_request(&mut self, surface: ToplevelSurface) {
        let id = self.windows.iter().find_map(|(id, window)| {
            (window.wl_surface().as_deref() == Some(surface.wl_surface())).then_some(*id)
        });
        if let Some(id) = id {
            let _ = self.minimize_window(id);
        }
    }

    fn maximize_request(&mut self, surface: ToplevelSurface) {
        self.set_window_maximized(surface, true);
    }

    fn unmaximize_request(&mut self, surface: ToplevelSurface) {
        self.set_window_maximized(surface, false);
    }

    fn grab(&mut self, surface: PopupSurface, seat: wl_seat::WlSeat, serial: Serial) {
        if self.session_lock.is_active() {
            surface.send_popup_done();
            return;
        }
        let seat: Seat<KestrelState<BackendData>> = Seat::from_resource(&seat).unwrap();
        let kind = PopupKind::Xdg(surface);
        if let Some(root) = find_popup_root_surface(&kind).ok().and_then(|root| {
            self.space
                .elements()
                .find(|w| w.wl_surface().map(|s| *s == root).unwrap_or(false))
                .cloned()
                .map(KeyboardFocusTarget::from)
                .or_else(|| {
                    self.space
                        .outputs()
                        .find_map(|o| {
                            let map = layer_map_for_output(o);
                            map.layer_for_surface(&root, WindowSurfaceType::TOPLEVEL)
                                .cloned()
                        })
                        .map(KeyboardFocusTarget::LayerSurface)
                })
        }) {
            let ret = self.popups.grab_popup(root, kind, &seat, serial);

            if let Ok(mut grab) = ret {
                if let Some(keyboard) = seat.get_keyboard() {
                    if keyboard.is_grabbed()
                        && !(keyboard.has_grab(serial)
                            || keyboard.has_grab(grab.previous_serial().unwrap_or(serial)))
                    {
                        grab.ungrab(PopupUngrabStrategy::All);
                        return;
                    }
                    keyboard.set_focus(self, grab.current_grab(), serial);
                    keyboard.set_grab(self, PopupKeyboardGrab::new(&grab), serial);
                }
                if let Some(pointer) = seat.get_pointer() {
                    if pointer.is_grabbed()
                        && !(pointer.has_grab(serial)
                            || pointer
                                .has_grab(grab.previous_serial().unwrap_or_else(|| grab.serial())))
                    {
                        grab.ungrab(PopupUngrabStrategy::All);
                        return;
                    }
                    pointer.set_grab(self, PopupPointerGrab::new(&grab), serial, Focus::Keep);
                }
            }
        }
    }
}

impl<BackendData: Backend> KestrelState<BackendData> {
    pub(super) fn restore_maximized_window_for_move(
        &mut self,
        surface: &ToplevelSurface,
        window: &WindowElement,
        pointer_location: Point<f64, Logical>,
    ) -> Option<Point<i32, Logical>> {
        let maximized = surface
            .with_pending_state(|state| state.states.contains(xdg_toplevel::State::Maximized));
        if !maximized {
            return None;
        }

        let current = Rectangle::new(self.space.element_location(window)?, window.geometry().size);
        let saved = window
            .decoration_state()
            .floating_geometry
            .unwrap_or(current);
        let horizontal_anchor = ((pointer_location.x - current.loc.x as f64)
            / current.size.w.max(1) as f64)
            .clamp(0.0, 1.0);
        let titlebar_anchor =
            (pointer_location.y - current.loc.y as f64).clamp(0.0, (HEADER_BAR_HEIGHT - 1) as f64);
        let target_location = Point::from((
            (pointer_location.x - saved.size.w as f64 * horizontal_anchor).round() as i32,
            (pointer_location.y - titlebar_anchor).round() as i32,
        ));
        let target = Rectangle::new(target_location, saved.size);

        {
            let mut decoration = window.decoration_state();
            decoration.maximized = false;
            decoration.floating_geometry = Some(target);
            decoration.animation = Some(WindowAnimation {
                kind: WindowAnimationKind::Unmaximize,
                from: current,
                to: target,
                started_at: Instant::now(),
                duration: Duration::from_millis(180),
            });
        }
        surface.with_pending_state(|state| {
            state.states.unset(xdg_toplevel::State::Maximized);
            state.size = Some((target.size.w, target.size.h - HEADER_BAR_HEIGHT).into());
        });
        self.space.map_element(window.clone(), target.loc, true);
        if let Some(id) = self
            .windows
            .iter()
            .find_map(|(id, candidate)| (candidate == window).then_some(*id))
        {
            let _ = self
                .layout
                .set_window_state(id, luft_ipc::WindowState::Floating);
        }
        surface.send_configure();
        Some(target.loc)
    }

    pub fn move_request_xdg(
        &mut self,
        surface: &ToplevelSurface,
        seat: &Seat<Self>,
        serial: Serial,
    ) {
        if let Some(touch) = seat.get_touch()
            && touch.has_grab(serial)
        {
            let start_data = touch.grab_start_data().unwrap();

            // If the client disconnects after requesting a move
            // we can just ignore the request
            let Some(window) = self.window_for_surface(surface.wl_surface()) else {
                return;
            };

            // If the focus was for a different surface, ignore the request.
            if start_data.focus.is_none()
                || !start_data
                    .focus
                    .as_ref()
                    .unwrap()
                    .0
                    .same_client_as(&surface.wl_surface().id())
            {
                return;
            }

            let initial_window_location = self
                .restore_maximized_window_for_move(surface, &window, start_data.location)
                .unwrap_or_else(|| self.space.element_location(&window).unwrap());

            let grab = TouchMoveSurfaceGrab {
                start_data,
                window,
                initial_window_location,
            };

            touch.set_grab(self, grab, serial);
            return;
        }

        let pointer = seat.get_pointer().unwrap();

        // Check that this surface has a click grab.
        if !pointer.has_grab(serial) {
            return;
        }

        let start_data = pointer.grab_start_data().unwrap();

        // If the client disconnects after requesting a move
        // we can just ignore the request
        let Some(window) = self.window_for_surface(surface.wl_surface()) else {
            return;
        };

        // If the focus was for a different surface, ignore the request.
        if start_data.focus.is_none()
            || !start_data
                .focus
                .as_ref()
                .unwrap()
                .0
                .same_client_as(&surface.wl_surface().id())
        {
            return;
        }

        let restore_maximized = surface
            .with_pending_state(|state| state.states.contains(xdg_toplevel::State::Maximized));
        let initial_window_location = self.space.element_location(&window).unwrap();

        let grab = PointerMoveSurfaceGrab {
            start_data,
            window,
            initial_window_location,
            restore_maximized,
        };

        pointer.set_grab(self, grab, serial, Focus::Clear);
    }

    fn unconstrain_popup(&self, popup: &PopupSurface) {
        let Ok(root) = find_popup_root_surface(&PopupKind::Xdg(popup.clone())) else {
            return;
        };
        let Some(window) = self.window_for_surface(&root) else {
            return;
        };

        let mut outputs_for_window = self.space.outputs_for_element(&window);
        if outputs_for_window.is_empty() {
            return;
        }

        // Get a union of all outputs' geometries.
        let mut outputs_geo = self
            .space
            .output_geometry(&outputs_for_window.pop().unwrap())
            .unwrap();
        for output in outputs_for_window {
            outputs_geo = outputs_geo.merge(self.space.output_geometry(&output).unwrap());
        }

        let window_geo = self.space.element_geometry(&window).unwrap();

        // The target geometry for the positioner should be relative to its parent's geometry, so
        // we will compute that here.
        let mut target = outputs_geo;
        target.loc -= get_popup_toplevel_coords(&PopupKind::Xdg(popup.clone()));
        target.loc -= window_geo.loc;

        popup.with_pending_state(|state| {
            state.geometry = state.positioner.get_unconstrained_geometry(target);
        });
    }
}

/// Should be called on `WlSurface::commit` of xdg toplevel
pub(super) fn handle_toplevel_commit(
    space: &mut Space<WindowElement>,
    surface: &WlSurface,
) -> Option<()> {
    let window = space
        .elements()
        .find(|w| w.wl_surface().as_deref() == Some(surface))
        .cloned()?;

    let mut window_loc = space.element_location(&window)?;
    let geometry = window.geometry();

    let new_loc: Point<Option<i32>, Logical> =
        with_states(window.wl_surface().as_deref()?, |states| {
            let data = states.data_map.get::<RefCell<SurfaceData>>()?.borrow_mut();

            if let ResizeState::Resizing(resize_data)
            | ResizeState::WaitingForFinalAck(resize_data, _)
            | ResizeState::WaitingForCommit(resize_data) = data.resize_state
            {
                let edges = resize_data.edges;
                let loc = resize_data.initial_window_location;
                let size = resize_data.initial_window_size;

                // If the window is being resized by top or left, its location must be adjusted
                // accordingly.
                edges.intersects(ResizeEdge::TOP_LEFT).then(|| {
                    let new_x = edges
                        .intersects(ResizeEdge::LEFT)
                        .then_some(loc.x + (size.w - geometry.size.w));

                    let new_y = edges
                        .intersects(ResizeEdge::TOP)
                        .then_some(loc.y + (size.h - geometry.size.h));

                    (new_x, new_y).into()
                })
            } else {
                None
            }
        })?;

    if let Some(new_x) = new_loc.x {
        window_loc.x = new_x;
    }
    if let Some(new_y) = new_loc.y {
        window_loc.y = new_y;
    }

    if new_loc.x.is_some() || new_loc.y.is_some() {
        // If TOP or LEFT side of the window got resized, we have to move it
        space.map_element(window, window_loc, false);
    }

    Some(())
}
