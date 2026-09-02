use std::{convert::TryInto, time::Instant};

use crate::{
    KestrelState,
    focus::{KeyboardFocusTarget, PointerFocusTarget},
    shell::FullscreenSurface,
};
use luft_ipc::{DefaultAppKind, ShellCommand, WorkspaceId};

#[cfg(feature = "session-backend")]
use crate::udev::UdevData;
#[cfg(feature = "session-backend")]
use smithay::input::tablet;

use smithay::{
    backend::{
        input::{
            self, Axis, AxisSource, Device, DeviceCapability, Event, InputBackend, InputEvent,
            InputTime, KeyState, KeyboardKeyEvent, PointerAxisEvent, PointerButtonEvent,
            TouchEvent,
        },
        renderer::utils::RendererSurfaceStateUserData,
    },
    desktop::{LayerMap, LayerSurface, WindowSurfaceType, layer_map_for_output},
    input::{
        keyboard::{FilterResult, Keysym, ModifiersState, keysyms as xkb},
        pointer::{AxisFrame, ButtonEvent, MotionEvent},
        tablet::{TabletDescriptor, TabletSeatTrait},
        touch::{DownEvent, UpEvent},
    },
    reexports::wayland_server::protocol::wl_pointer,
    utils::{Logical, Point, Rectangle, SERIAL_COUNTER as SCOUNTER, Serial},
    wayland::{
        compositor::{SurfaceAttributes, with_states},
        input_method::InputMethodSeat,
        pointer_constraints::{PointerConstraint, with_pointer_constraint},
        shell::wlr_layer::{KeyboardInteractivity, Layer as WlrLayer},
    },
};

use smithay::backend::input::AbsolutePositionEvent;

#[cfg(feature = "nested")]
use smithay::output::Output;
use tracing::{debug, warn};

#[cfg(feature = "session-backend")]
use tracing::{error, info};

use crate::state::Backend;
#[cfg(feature = "session-backend")]
use smithay::{
    backend::{
        input::{
            GestureBeginEvent, GestureEndEvent, GesturePinchUpdateEvent as _,
            GestureSwipeUpdateEvent as _, PointerMotionEvent, ProximityState,
            TabletToolButtonEvent, TabletToolEvent, TabletToolProximityEvent, TabletToolTipEvent,
            TabletToolTipState,
        },
        session::Session,
    },
    input::pointer::{
        GestureHoldBeginEvent, GestureHoldEndEvent, GesturePinchBeginEvent, GesturePinchEndEvent,
        GesturePinchUpdateEvent, GestureSwipeBeginEvent, GestureSwipeEndEvent,
        GestureSwipeUpdateEvent, RelativeMotionEvent,
    },
    reexports::wayland_server::DisplayHandle,
};

impl<BackendData: Backend> KestrelState<BackendData> {
    fn pointer_motion(
        &mut self,
        contents: Option<(PointerFocusTarget, Point<f64, Logical>)>,
        event: &MotionEvent,
    ) {
        let pointer = self.pointer.clone();
        pointer.motion(self, contents.clone(), event);
        self.pointer_contents.clone_from(&contents);
        if !self.session_lock.is_active()
            && let Some((PointerFocusTarget::WlSurface(surface), surface_location)) = contents
        {
            with_pointer_constraint(&surface, &pointer, |constraint| {
                if let Some(constraint) = constraint
                    && !constraint.is_active()
                    && constraint.region().is_none_or(|region| {
                        region.contains((event.location - surface_location).to_i32_floor())
                    })
                {
                    constraint.activate();
                }
            });
        }
    }

    fn constrained_pointer_location(&self, requested: Point<f64, Logical>) -> Point<f64, Logical> {
        if self.session_lock.is_active() {
            return requested;
        }
        let current = self.pointer.current_location();
        let Some((PointerFocusTarget::WlSurface(surface), surface_location)) =
            self.pointer_contents.as_ref()
        else {
            return requested;
        };
        let pointer = self.pointer.clone();
        let Some((locked, region)) = with_pointer_constraint(surface, &pointer, |constraint| {
            let constraint = constraint.filter(|constraint| constraint.is_active())?;
            let current_local = (current - *surface_location).to_i32_floor();
            if !constraint
                .region()
                .is_none_or(|region| region.contains(current_local))
            {
                return None;
            }
            Some((
                matches!(*constraint, PointerConstraint::Locked(_)),
                constraint.region().cloned(),
            ))
        }) else {
            return requested;
        };
        if locked {
            return current;
        }

        let remains_on_surface = |location: Point<f64, Logical>| {
            let local = location - *surface_location;
            let in_region = region
                .as_ref()
                .is_none_or(|region| region.contains(local.to_i32_floor()));
            in_region && surface_contains_point(surface, local)
        };

        let mut location = current;
        let horizontal = Point::from((requested.x, current.y));
        if remains_on_surface(horizontal) {
            location.x = requested.x;
        }
        let vertical = Point::from((location.x, requested.y));
        if remains_on_surface(vertical) {
            location.y = requested.y;
        }
        location
    }

    fn pointer_focus_at(
        &self,
        location: Point<f64, Logical>,
    ) -> Option<(PointerFocusTarget, Point<f64, Logical>)> {
        if self.session_lock.is_active() {
            return self.surface_under(location);
        }
        if let Some((PointerFocusTarget::WlSurface(surface), _)) = &self.pointer_contents
            && with_pointer_constraint(surface, &self.pointer, |constraint| {
                constraint.is_some_and(|constraint| constraint.is_active())
            })
        {
            return self.pointer_contents.clone();
        }
        self.surface_under(location)
    }

    #[cfg(feature = "session-backend")]
    fn pointer_constraint_is_locked(&self) -> bool {
        if self.session_lock.is_active() {
            return false;
        }
        let Some((PointerFocusTarget::WlSurface(surface), _)) = &self.pointer_contents else {
            return false;
        };
        with_pointer_constraint(surface, &self.pointer, |constraint| {
            constraint.is_some_and(|constraint| {
                constraint.is_active() && matches!(*constraint, PointerConstraint::Locked(_))
            })
        })
    }

    pub(crate) fn release_pointer_focus_for_session_lock(&mut self) {
        self.cursor_position_hint = None;
        if let Some((PointerFocusTarget::WlSurface(surface), _)) = &self.pointer_contents {
            with_pointer_constraint(surface, &self.pointer, |constraint| {
                if let Some(constraint) = constraint {
                    constraint.deactivate();
                }
            });
        }
        let location = self.pointer.current_location();
        self.pointer_motion(
            None,
            &MotionEvent {
                location,
                serial: SCOUNTER.next_serial(),
                time: InputTime::now(),
            },
        );
        self.pointer_frame();
    }

    pub(crate) fn refresh_pointer_focus_now(&mut self) {
        self.refresh_pointer_contents_at(SCOUNTER.next_serial(), InputTime::now());
    }

    fn pointer_frame(&mut self) {
        let pointer = self.pointer.clone();
        pointer.frame(self);
    }

    fn refresh_pointer_contents_at(&mut self, serial: Serial, time: InputTime) -> bool {
        let location = self.pointer.current_location();
        let contents = self.pointer_focus_at(location);
        if self.pointer_contents == contents {
            return false;
        }

        self.pointer_motion(
            contents,
            &MotionEvent {
                location,
                serial,
                time,
            },
        );
        self.pointer_frame();
        true
    }

    fn process_common_key_action(&mut self, action: KeyAction) {
        match action {
            KeyAction::None => (),
            KeyAction::SwitchWorkspace(workspace) => {
                if let Err(error) = self.switch_workspace(workspace) {
                    debug!(%error, "workspace shortcut was not applied");
                }
            }
            KeyAction::SwitchRelativeWorkspace(offset) => {
                if let Err(error) = self.switch_relative_workspace(offset) {
                    debug!(%error, "relative workspace shortcut was not applied");
                }
            }
            KeyAction::MoveWindowToWorkspace(workspace) => {
                if let Err(error) = self.move_active_window_to_workspace(workspace) {
                    debug!(%error, "move-to-workspace shortcut was not applied");
                }
            }
            KeyAction::CycleWindows { reverse } => {
                if let Err(error) = self.cycle_active_window(reverse) {
                    debug!(%error, "window-cycle shortcut was not applied");
                }
            }
            KeyAction::CloseActiveWindow => {
                if let Err(error) = self.close_active_window() {
                    debug!(%error, "close-window shortcut was not applied");
                }
            }
            KeyAction::RestartShell => self.shell_process.restart(),
            KeyAction::Shell(command) => self.ipc_socket.send_shell_command(command),
            KeyAction::VtSwitch(vt) => {
                warn!(
                    vt,
                    "VT switch shortcut is unavailable on the nested backend"
                )
            }
        }
    }

    fn keyboard_key_to_action<B: InputBackend>(&mut self, evt: B::KeyboardKeyEvent) -> KeyAction {
        let keycode = evt.key_code();
        let state = evt.state();
        debug!(?keycode, ?state, "key");
        let serial = SCOUNTER.next_serial();
        let time = Event::time(&evt);
        let mut suppressed_keys = self.suppressed_keys.clone();
        let keyboard = self.seat.get_keyboard().unwrap();

        if self.session_lock.is_active() {
            let focus = self
                .space
                .output_under(self.pointer.current_location())
                .next()
                .or_else(|| self.space.outputs().next())
                .and_then(|output| self.session_lock.surface_for_output(output))
                .map(|surface| KeyboardFocusTarget::Surface(surface.wl_surface().clone()));
            keyboard.set_focus(self, focus, serial);
            keyboard.input::<(), _>(self, keycode, state, serial, time, |_, _, _| {
                FilterResult::Forward
            });
            return KeyAction::None;
        }

        for layer in self.layer_shell_state.layer_surfaces().rev() {
            let exclusive = layer.with_cached_state(|data| {
                data.keyboard_interactivity == KeyboardInteractivity::Exclusive
                    && (data.layer == WlrLayer::Top || data.layer == WlrLayer::Overlay)
            });
            if exclusive {
                let surface = self.space.outputs().find_map(|o| {
                    let map = layer_map_for_output(o);
                    map.layers().find(|l| l.layer_surface() == &layer).cloned()
                });
                if let Some(surface) = surface {
                    keyboard.set_focus(self, Some(surface.into()), serial);
                    keyboard.input::<(), _>(self, keycode, state, serial, time, |_, _, _| {
                        FilterResult::Forward
                    });
                    return KeyAction::None;
                };
            }
        }

        let inhibited = self.active_shortcuts_inhibitor.is_some();
        let mut logo_tap_candidate = self.logo_tap_candidate;

        let action = keyboard
            .input(
                self,
                keycode,
                state,
                serial,
                time,
                |_, modifiers, handle| {
                    let modified_keysym = handle.modified_sym();
                    let keysym = handle
                        .raw_latin_sym_or_raw_current_sym()
                        .unwrap_or(modified_keysym);

                    debug!(
                        ?state,
                        mods = ?modifiers,
                        keysym = ::xkbcommon::xkb::keysym_get_name(modified_keysym),
                        "keysym"
                    );

                    match state {
                        KeyState::Pressed if inhibited => {
                            logo_tap_candidate = false;
                            FilterResult::Forward
                        }
                        KeyState::Pressed
                            if is_logo_key(keysym)
                                && !modifiers.ctrl
                                && !modifiers.alt
                                && !modifiers.shift =>
                        {
                            logo_tap_candidate = true;
                            if !suppressed_keys.contains(&keysym) {
                                suppressed_keys.push(keysym);
                            }
                            FilterResult::Intercept(KeyAction::None)
                        }
                        KeyState::Pressed => {
                            logo_tap_candidate = false;
                            if let Some(action) = process_keyboard_shortcut(*modifiers, keysym) {
                                if !suppressed_keys.contains(&keysym) {
                                    suppressed_keys.push(keysym);
                                }
                                FilterResult::Intercept(action)
                            } else {
                                FilterResult::Forward
                            }
                        }
                        KeyState::Released => {
                            let suppressed = suppressed_keys.contains(&keysym);
                            suppressed_keys.retain(|k| *k != keysym);
                            if is_logo_key(keysym) {
                                let toggle_start_menu = logo_tap_candidate && suppressed;
                                logo_tap_candidate = false;
                                if toggle_start_menu {
                                    FilterResult::Intercept(KeyAction::Shell(
                                        ShellCommand::ToggleStartMenu,
                                    ))
                                } else if suppressed {
                                    FilterResult::Intercept(KeyAction::None)
                                } else {
                                    FilterResult::Forward
                                }
                            } else if suppressed {
                                FilterResult::Intercept(KeyAction::None)
                            } else {
                                FilterResult::Forward
                            }
                        }
                    }
                },
            )
            .unwrap_or(KeyAction::None);

        self.suppressed_keys = suppressed_keys;
        self.logo_tap_candidate = logo_tap_candidate;
        action
    }

    fn on_pointer_button<B: InputBackend>(&mut self, evt: B::PointerButtonEvent) {
        let serial = SCOUNTER.next_serial();
        let button = evt.button_code();

        let state = wl_pointer::ButtonState::from(evt.state());

        if wl_pointer::ButtonState::Pressed == state {
            let location = self.pointer.current_location();
            self.refresh_pointer_contents_at(serial, evt.time());
            self.update_keyboard_focus(location, serial);
        };
        let pointer = self.pointer.clone();
        pointer.button(
            self,
            &ButtonEvent {
                button,
                state: state.try_into().unwrap(),
                serial,
                time: evt.time(),
            },
        );
        self.pointer_frame();
    }

    fn update_keyboard_focus(&mut self, location: Point<f64, Logical>, serial: Serial) {
        let keyboard = self.seat.get_keyboard().unwrap();
        if self.session_lock.is_active() {
            let focus = self
                .space
                .output_under(location)
                .next()
                .and_then(|output| self.session_lock.surface_for_output(output))
                .map(|surface| KeyboardFocusTarget::Surface(surface.wl_surface().clone()));
            keyboard.set_focus(self, focus, serial);
            return;
        }
        let touch = self.seat.get_touch();
        let input_method = self.seat.input_method();
        // change the keyboard focus unless the pointer or keyboard is grabbed
        // We test for any matching surface type here but always use the root
        // (in case of a window the toplevel) surface for the focus.
        // So for example if a user clicks on a subsurface or popup the toplevel
        // will receive the keyboard focus. Directly assigning the focus to the
        // matching surface leads to issues with clients dismissing popups and
        // subsurface menus (for example firefox-wayland).
        // see here for a discussion about that issue:
        // https://gitlab.freedesktop.org/wayland/wayland/-/issues/294
        if !self.pointer.is_grabbed()
            && (!keyboard.is_grabbed() || input_method.keyboard_grabbed())
            && !touch.map(|touch| touch.is_grabbed()).unwrap_or(false)
        {
            let output = self.space.output_under(location).next().cloned();
            if let Some(output) = output.as_ref() {
                let output_geo = self.space.output_geometry(output).unwrap();
                let layers = layer_map_for_output(output);
                let layer_location = location - output_geo.loc.to_f64();
                let fullscreen = output
                    .user_data()
                    .get::<FullscreenSurface>()
                    .and_then(|surface| surface.get());
                if let Some(layer) = panel_layer_under(&layers, &self.layer_motion, layer_location)
                    .or_else(|| {
                        input_layer_under(
                            &layers,
                            &self.layer_motion,
                            WlrLayer::Overlay,
                            layer_location,
                            None,
                        )
                    })
                    .or_else(|| {
                        fullscreen.is_none().then(|| {
                            input_layer_under(
                                &layers,
                                &self.layer_motion,
                                WlrLayer::Top,
                                layer_location,
                                None,
                            )
                        })?
                    })
                {
                    if layer.can_receive_keyboard_focus() {
                        keyboard.set_focus(self, Some(layer.clone().into()), serial);
                    }
                    return;
                }

                if let Some(window) = fullscreen {
                    if let Some((_, _)) = window
                        .surface_under(location - output_geo.loc.to_f64(), WindowSurfaceType::ALL)
                    {
                        keyboard.set_focus(self, Some(window.into()), serial);
                    }
                    return;
                }
            }

            if let Some((window, _)) = self
                .space
                .element_under(location)
                .map(|(w, p)| (w.clone(), p))
            {
                self.space.raise_element(&window, true);
                keyboard.set_focus(self, Some(window.into()), serial);
                return;
            }

            if let Some(output) = output.as_ref() {
                let output_geo = self.space.output_geometry(output).unwrap();
                let layers = layer_map_for_output(output);
                let layer_location = location - output_geo.loc.to_f64();
                if let Some(layer) = input_layer_under(
                    &layers,
                    &self.layer_motion,
                    WlrLayer::Bottom,
                    layer_location,
                    None,
                )
                .or_else(|| {
                    input_layer_under(
                        &layers,
                        &self.layer_motion,
                        WlrLayer::Background,
                        layer_location,
                        None,
                    )
                }) && layer.can_receive_keyboard_focus()
                {
                    keyboard.set_focus(self, Some(layer.clone().into()), serial);
                }
            };
        }
    }

    pub fn surface_under(
        &self,
        pos: Point<f64, Logical>,
    ) -> Option<(PointerFocusTarget, Point<f64, Logical>)> {
        let output = self.space.outputs().find(|o| {
            let geometry = self.space.output_geometry(o).unwrap();
            geometry.to_f64().contains(pos)
        })?;
        let output_geo = self.space.output_geometry(output).unwrap();

        if self.session_lock.is_active() {
            return self
                .session_lock
                .surface_for_output(output)
                .and_then(|lock| {
                    crate::session_lock::lock_surface_under(
                        lock.wl_surface(),
                        pos - output_geo.loc.to_f64(),
                    )
                })
                .map(|(surface, location)| {
                    (
                        PointerFocusTarget::from(surface),
                        (location + output_geo.loc).to_f64(),
                    )
                });
        }
        let layers = layer_map_for_output(output);

        let mut under = None;
        let fullscreen = output
            .user_data()
            .get::<FullscreenSurface>()
            .and_then(|surface| surface.get());
        if let Some(focus) =
            panel_surface_under(&layers, &self.layer_motion, pos - output_geo.loc.to_f64())
                .or_else(|| {
                    layer_surface_under(
                        &layers,
                        &self.layer_motion,
                        WlrLayer::Overlay,
                        pos - output_geo.loc.to_f64(),
                    )
                })
                .or_else(|| {
                    fullscreen.is_none().then(|| {
                        layer_surface_under(
                            &layers,
                            &self.layer_motion,
                            WlrLayer::Top,
                            pos - output_geo.loc.to_f64(),
                        )
                    })?
                })
                .map(|(surface, location)| (surface, location + output_geo.loc))
        {
            under = Some(focus)
        } else if let Some(window) = fullscreen {
            under = window
                .surface_under(pos - output_geo.loc.to_f64(), WindowSurfaceType::ALL)
                .map(|(surface, loc)| (surface, loc + output_geo.loc));
        } else if let Some(focus) = self.space.element_under(pos).and_then(|(window, loc)| {
            window
                .surface_under(pos - loc.to_f64(), WindowSurfaceType::ALL)
                .map(|(surface, surf_loc)| (surface, surf_loc + loc))
        }) {
            under = Some(focus);
        } else if let Some(focus) = layer_surface_under(
            &layers,
            &self.layer_motion,
            WlrLayer::Bottom,
            pos - output_geo.loc.to_f64(),
        )
        .or_else(|| {
            layer_surface_under(
                &layers,
                &self.layer_motion,
                WlrLayer::Background,
                pos - output_geo.loc.to_f64(),
            )
        })
        .map(|(surface, location)| (surface, location + output_geo.loc))
        {
            under = Some(focus)
        };
        under.map(|(s, l)| (s, l.to_f64()))
    }

    fn on_pointer_axis<B: InputBackend>(&mut self, evt: B::PointerAxisEvent) {
        let horizontal_amount = evt.amount(input::Axis::Horizontal).unwrap_or_else(|| {
            evt.amount_v120(input::Axis::Horizontal).unwrap_or(0.0) * 15.0 / 120.
        });
        let vertical_amount = evt
            .amount(input::Axis::Vertical)
            .unwrap_or_else(|| evt.amount_v120(input::Axis::Vertical).unwrap_or(0.0) * 15.0 / 120.);
        let horizontal_amount_discrete = evt.amount_v120(input::Axis::Horizontal);
        let vertical_amount_discrete = evt.amount_v120(input::Axis::Vertical);

        let workspace_scroll = self
            .seat
            .get_keyboard()
            .map(|keyboard| keyboard.modifier_state())
            .is_some_and(|modifiers| {
                modifiers.logo && !modifiers.ctrl && !modifiers.alt && !modifiers.shift
            })
            && self.active_shortcuts_inhibitor.is_none();
        if workspace_scroll {
            self.logo_tap_candidate = false;
            let units = vertical_amount_discrete.unwrap_or(vertical_amount * 8.0);
            self.workspace_scroll_accumulator += units;
            if self.workspace_scroll_accumulator.abs() >= 120.0 {
                let offset = if self.workspace_scroll_accumulator.is_sign_positive() {
                    1
                } else {
                    -1
                };
                self.workspace_scroll_accumulator -= f64::from(offset) * 120.0;
                if let Err(error) = self.switch_relative_workspace(offset) {
                    debug!(%error, "workspace scroll shortcut was not applied");
                    self.workspace_scroll_accumulator = 0.0;
                }
            }
            return;
        }
        self.workspace_scroll_accumulator = 0.0;

        {
            let mut frame = AxisFrame::new(evt.time()).source(evt.source());
            if horizontal_amount != 0.0 {
                frame = frame
                    .relative_direction(Axis::Horizontal, evt.relative_direction(Axis::Horizontal));
                frame = frame.value(Axis::Horizontal, horizontal_amount);
                if let Some(discrete) = horizontal_amount_discrete {
                    frame = frame.v120(Axis::Horizontal, discrete as i32);
                }
            }
            if vertical_amount != 0.0 {
                frame = frame
                    .relative_direction(Axis::Vertical, evt.relative_direction(Axis::Vertical));
                frame = frame.value(Axis::Vertical, vertical_amount);
                if let Some(discrete) = vertical_amount_discrete {
                    frame = frame.v120(Axis::Vertical, discrete as i32);
                }
            }
            if evt.source() == AxisSource::Finger {
                if evt.amount(Axis::Horizontal) == Some(0.0) {
                    frame = frame.stop(Axis::Horizontal);
                }
                if evt.amount(Axis::Vertical) == Some(0.0) {
                    frame = frame.stop(Axis::Vertical);
                }
            }
            let pointer = self.pointer.clone();
            pointer.axis(self, frame);
            self.pointer_frame();
        }
    }

    fn touch_location_transformed<B: InputBackend, E: AbsolutePositionEvent<B>>(
        &self,
        evt: &E,
    ) -> Option<Point<f64, Logical>> {
        let output = self
            .space
            .outputs()
            .find(|output| output.name().starts_with("eDP"))
            .or_else(|| self.space.outputs().next());

        let output = output?;
        let output_geometry = self.space.output_geometry(output)?;

        let transform = output.current_transform();
        let size = transform.invert().transform_size(output_geometry.size);
        Some(
            transform.transform_point_in(evt.position_transformed(size), &size.to_f64())
                + output_geometry.loc.to_f64(),
        )
    }

    fn on_touch_down<B: InputBackend>(&mut self, evt: B::TouchDownEvent) {
        let Some(handle) = self.seat.get_touch() else {
            return;
        };

        let Some(touch_location) = self.touch_location_transformed(&evt) else {
            return;
        };

        let serial = SCOUNTER.next_serial();
        self.update_keyboard_focus(touch_location, serial);

        let under = self.surface_under(touch_location);
        handle.down(
            self,
            under,
            &DownEvent {
                slot: evt.slot(),
                location: touch_location,
                serial,
                time: evt.time(),
            },
        );
    }

    fn on_touch_up<B: InputBackend>(&mut self, evt: B::TouchUpEvent) {
        let Some(handle) = self.seat.get_touch() else {
            return;
        };
        let serial = SCOUNTER.next_serial();
        handle.up(
            self,
            &UpEvent {
                slot: evt.slot(),
                serial,
                time: evt.time(),
            },
        )
    }

    fn on_touch_motion<B: InputBackend>(&mut self, evt: B::TouchMotionEvent) {
        let Some(handle) = self.seat.get_touch() else {
            return;
        };
        let Some(touch_location) = self.touch_location_transformed(&evt) else {
            return;
        };

        let under = self.surface_under(touch_location);
        handle.motion(
            self,
            under,
            &smithay::input::touch::MotionEvent {
                slot: evt.slot(),
                location: touch_location,
                time: evt.time(),
            },
        );
    }

    fn on_touch_frame<B: InputBackend>(&mut self, _evt: B::TouchFrameEvent) {
        let Some(handle) = self.seat.get_touch() else {
            return;
        };
        handle.frame(self);
    }

    fn on_touch_cancel<B: InputBackend>(&mut self, _evt: B::TouchCancelEvent) {
        let Some(handle) = self.seat.get_touch() else {
            return;
        };
        handle.cancel(self);
    }

    fn on_device_added<B: InputBackend>(&mut self, device: B::Device) {
        let dh = &self.display_handle;
        if device.has_capability(DeviceCapability::TabletTool) {
            self.seat
                .tablet_seat()
                .add_wp_tablet(dh, &TabletDescriptor::from(&device));
        }
        if device.has_capability(DeviceCapability::Touch) && self.seat.get_touch().is_none() {
            self.seat.add_touch();
        }
    }

    fn on_device_removed<B: InputBackend>(&mut self, device: B::Device) {
        if device.has_capability(DeviceCapability::TabletTool) {
            let tablet_seat = self.seat.tablet_seat();

            tablet_seat.remove_tablet(&TabletDescriptor::from(&device));

            // If there are no tablets in seat we can remove all tools
            if tablet_seat.count_tablets() == 0 {
                tablet_seat.clear_tools();
            }
        }
    }
}

fn panel_layer_under<'a>(
    layers: &'a LayerMap,
    layer_motion: &crate::layer_motion::LayerMotionState,
    position: Point<f64, Logical>,
) -> Option<&'a LayerSurface> {
    input_layer_under(
        layers,
        layer_motion,
        WlrLayer::Overlay,
        position,
        Some("luft-panel"),
    )
}

fn input_layer_under<'a>(
    layers: &'a LayerMap,
    layer_motion: &crate::layer_motion::LayerMotionState,
    layer: WlrLayer,
    position: Point<f64, Logical>,
    namespace: Option<&str>,
) -> Option<&'a LayerSurface> {
    layers.layers_on(layer).rev().find(|surface| {
        if namespace.is_some_and(|namespace| surface.namespace() != namespace) {
            return false;
        }
        let Some(geometry) = layers.layer_geometry(surface) else {
            return false;
        };
        let visual_offset = layer_motion.visual_offset(surface.wl_surface(), Instant::now());
        surface
            .surface_under(
                position - geometry.loc.to_f64() - visual_offset,
                WindowSurfaceType::ALL,
            )
            .is_some()
    })
}

fn panel_surface_under(
    layers: &LayerMap,
    layer_motion: &crate::layer_motion::LayerMotionState,
    position: Point<f64, Logical>,
) -> Option<(PointerFocusTarget, Point<i32, Logical>)> {
    let surface = panel_layer_under(layers, layer_motion, position)?;
    surface_focus_under(layers, layer_motion, surface, position)
}

fn layer_surface_under(
    layers: &LayerMap,
    layer_motion: &crate::layer_motion::LayerMotionState,
    layer: WlrLayer,
    position: Point<f64, Logical>,
) -> Option<(PointerFocusTarget, Point<i32, Logical>)> {
    let surface = input_layer_under(layers, layer_motion, layer, position, None)?;
    surface_focus_under(layers, layer_motion, surface, position)
}

fn surface_focus_under(
    layers: &LayerMap,
    layer_motion: &crate::layer_motion::LayerMotionState,
    layer: &LayerSurface,
    position: Point<f64, Logical>,
) -> Option<(PointerFocusTarget, Point<i32, Logical>)> {
    let layer_location = layers.layer_geometry(layer)?.loc;
    let visual_offset = layer_motion.visual_offset(layer.wl_surface(), Instant::now());
    layer
        .surface_under(
            position - layer_location.to_f64() - visual_offset,
            WindowSurfaceType::ALL,
        )
        .map(|(surface, location)| {
            (
                PointerFocusTarget::from(surface),
                location + layer_location + visual_offset.to_i32_round(),
            )
        })
}

#[cfg(feature = "nested")]
impl<BackendData: Backend> KestrelState<BackendData> {
    pub fn process_input_event_windowed<B: InputBackend>(
        &mut self,
        event: InputEvent<B>,
        output_name: &str,
    ) {
        self.notify_idle_activity();
        match event {
            InputEvent::Keyboard { event } => {
                let action = self.keyboard_key_to_action::<B>(event);
                self.process_common_key_action(action);
            }

            InputEvent::PointerMotionAbsolute { event } => {
                let output = self
                    .space
                    .outputs()
                    .find(|o| o.name() == output_name)
                    .unwrap()
                    .clone();
                self.on_pointer_move_absolute_windowed::<B>(event, &output)
            }
            InputEvent::PointerButton { event } => self.on_pointer_button::<B>(event),
            InputEvent::PointerAxis { event } => self.on_pointer_axis::<B>(event),
            InputEvent::TouchDown { event } => self.on_touch_down::<B>(event),
            InputEvent::TouchUp { event } => self.on_touch_up::<B>(event),
            InputEvent::TouchMotion { event } => self.on_touch_motion::<B>(event),
            InputEvent::TouchFrame { event } => self.on_touch_frame::<B>(event),
            InputEvent::TouchCancel { event } => self.on_touch_cancel::<B>(event),
            InputEvent::DeviceAdded { device } => self.on_device_added::<B>(device),
            InputEvent::DeviceRemoved { device } => self.on_device_removed::<B>(device),
            _ => (), // other events are not handled in kestrel (yet)
        }
    }

    fn on_pointer_move_absolute_windowed<B: InputBackend>(
        &mut self,
        evt: B::PointerMotionAbsoluteEvent,
        output: &Output,
    ) {
        let output_geo = self.space.output_geometry(output).unwrap();

        let requested = evt.position_transformed(output_geo.size) + output_geo.loc.to_f64();
        let pos = self.constrained_pointer_location(requested);
        let serial = SCOUNTER.next_serial();

        let under = self.pointer_focus_at(pos);
        self.pointer_motion(
            under,
            &MotionEvent {
                location: pos,
                serial,
                time: evt.time(),
            },
        );
        self.pointer_frame();
    }

    pub fn release_all_keys(&mut self) {
        let keyboard = self.seat.get_keyboard().unwrap();
        let mut suppressed_keys = self.suppressed_keys.clone();
        for keycode in keyboard.pressed_keys() {
            keyboard.input(
                self,
                keycode,
                KeyState::Released,
                SCOUNTER.next_serial(),
                InputTime::now(),
                |_, _, handle| {
                    let keysym = handle
                        .raw_latin_sym_or_raw_current_sym()
                        .unwrap_or_else(|| handle.modified_sym());
                    if suppressed_keys.contains(&keysym) {
                        suppressed_keys.retain(|candidate| *candidate != keysym);
                        FilterResult::Intercept(false)
                    } else {
                        FilterResult::Forward
                    }
                },
            );
        }
        self.suppressed_keys.clear();
        self.logo_tap_candidate = false;
    }
}

#[cfg(feature = "session-backend")]
impl KestrelState<UdevData> {
    pub fn process_input_event<B: InputBackend>(
        &mut self,
        dh: &DisplayHandle,
        event: InputEvent<B>,
    ) {
        self.notify_idle_activity();
        match event {
            InputEvent::Keyboard { event, .. } => match self.keyboard_key_to_action::<B>(event) {
                KeyAction::VtSwitch(vt) => {
                    info!(to = vt, "Trying to switch vt");
                    if let Err(err) = self.backend_data.session.change_vt(vt) {
                        error!(vt, %err, "failed to switch VT");
                    }
                }
                action => self.process_common_key_action(action),
            },
            InputEvent::PointerMotion { event, .. } => self.on_pointer_move::<B>(dh, event),
            InputEvent::PointerMotionAbsolute { event, .. } => {
                self.on_pointer_move_absolute::<B>(dh, event)
            }
            InputEvent::PointerButton { event, .. } => self.on_pointer_button::<B>(event),
            InputEvent::PointerAxis { event, .. } => self.on_pointer_axis::<B>(event),
            InputEvent::TabletToolAxis { event, .. } => self.on_tablet_tool_axis::<B>(event),
            InputEvent::TabletToolProximity { event, .. } => {
                self.on_tablet_tool_proximity::<B>(dh, event)
            }
            InputEvent::TabletToolTip { event, .. } => self.on_tablet_tool_tip::<B>(event),
            InputEvent::TabletToolButton { event, .. } => self.on_tablet_button::<B>(event),
            InputEvent::GestureSwipeBegin { event, .. } => self.on_gesture_swipe_begin::<B>(event),
            InputEvent::GestureSwipeUpdate { event, .. } => {
                self.on_gesture_swipe_update::<B>(event)
            }
            InputEvent::GestureSwipeEnd { event, .. } => self.on_gesture_swipe_end::<B>(event),
            InputEvent::GesturePinchBegin { event, .. } => self.on_gesture_pinch_begin::<B>(event),
            InputEvent::GesturePinchUpdate { event, .. } => {
                self.on_gesture_pinch_update::<B>(event)
            }
            InputEvent::GesturePinchEnd { event, .. } => self.on_gesture_pinch_end::<B>(event),
            InputEvent::GestureHoldBegin { event, .. } => self.on_gesture_hold_begin::<B>(event),
            InputEvent::GestureHoldEnd { event, .. } => self.on_gesture_hold_end::<B>(event),

            InputEvent::TouchDown { event } => self.on_touch_down::<B>(event),
            InputEvent::TouchUp { event } => self.on_touch_up::<B>(event),
            InputEvent::TouchMotion { event } => self.on_touch_motion::<B>(event),
            InputEvent::TouchFrame { event } => self.on_touch_frame::<B>(event),
            InputEvent::TouchCancel { event } => self.on_touch_cancel::<B>(event),

            InputEvent::DeviceAdded { device } => self.on_device_added::<B>(device),
            InputEvent::DeviceRemoved { device } => self.on_device_removed::<B>(device),
            _ => {
                // other events are not handled in kestrel (yet)
            }
        }
    }

    fn on_pointer_move<B: InputBackend>(
        &mut self,
        _dh: &DisplayHandle,
        evt: B::PointerMotionEvent,
    ) {
        let pointer_location = self.pointer.current_location();
        let serial = SCOUNTER.next_serial();

        let pointer = self.pointer.clone();
        let under = self.pointer_focus_at(pointer_location);

        pointer.relative_motion(
            self,
            under.clone(),
            &RelativeMotionEvent {
                delta: evt.delta(),
                delta_unaccel: evt.delta_unaccel(),
                time: evt.time(),
            },
        );

        if self.pointer_constraint_is_locked() {
            self.pointer_frame();
            return;
        }

        let pointer_location =
            self.constrained_pointer_location(self.clamp_coords(pointer_location + evt.delta()));
        let new_under = self.pointer_focus_at(pointer_location);

        self.pointer_motion(
            new_under,
            &MotionEvent {
                location: pointer_location,
                serial,
                time: evt.time(),
            },
        );
        self.pointer_frame();
    }

    fn on_pointer_move_absolute<B: InputBackend>(
        &mut self,
        _dh: &DisplayHandle,
        evt: B::PointerMotionAbsoluteEvent,
    ) {
        let serial = SCOUNTER.next_serial();

        if self.pointer_constraint_is_locked() {
            self.pointer_frame();
            return;
        }

        let Some(bounds) = self.output_bounds() else {
            return;
        };
        let pointer_location = self.constrained_pointer_location(self.clamp_coords(
            Point::from((
                evt.x_transformed(bounds.size.w),
                evt.y_transformed(bounds.size.h),
            )) + bounds.loc.to_f64(),
        ));

        let under = self.pointer_focus_at(pointer_location);

        self.pointer_motion(
            under,
            &MotionEvent {
                location: pointer_location,
                serial,
                time: evt.time(),
            },
        );
        self.pointer_frame();
    }

    fn on_tablet_tool_axis<B: InputBackend>(&mut self, evt: B::TabletToolAxisEvent) {
        let tablet_seat = self.seat.tablet_seat();

        if let Some(pointer_location) = self.touch_location_transformed(&evt) {
            let pointer_location =
                self.constrained_pointer_location(self.clamp_coords(pointer_location));
            let under = self.pointer_focus_at(pointer_location);
            let tool = tablet_seat.get_tool(&evt.tool());
            let time = InputTime::now();

            self.pointer_motion(
                under.clone(),
                &MotionEvent {
                    location: pointer_location,
                    serial: SCOUNTER.next_serial(),
                    time,
                },
            );

            if let Some(tool) = tool {
                let frame = tablet::tool::AxisFrame {
                    pressure: evt.pressure_has_changed().then(|| evt.pressure()),
                    distance: evt.distance_has_changed().then(|| evt.distance()),
                    tilt: evt.tilt_has_changed().then(|| evt.tilt()),
                    rotation: evt.rotation_has_changed().then(|| evt.rotation()),
                    slider: evt.slider_has_changed().then(|| evt.slider_position()),
                    wheel: evt
                        .wheel_has_changed()
                        .then(|| (evt.wheel_delta(), evt.wheel_delta_discrete())),
                };

                tool.axis(self, frame);

                tool.motion(
                    self,
                    under,
                    &tablet::tool::MotionEvent {
                        location: pointer_location,
                        serial: SCOUNTER.next_serial(),
                        time,
                    },
                );

                tool.frame(self, time);
            }

            self.pointer_frame();
        }
    }

    fn on_tablet_tool_proximity<B: InputBackend>(
        &mut self,
        dh: &DisplayHandle,
        evt: B::TabletToolProximityEvent,
    ) {
        let tablet_seat = self.seat.tablet_seat();

        if let Some(pointer_location) = self.touch_location_transformed(&evt) {
            let pointer_location =
                self.constrained_pointer_location(self.clamp_coords(pointer_location));
            let tool = evt.tool();

            let under = self.pointer_focus_at(pointer_location);
            let tablet = tablet_seat.get_tablet(&TabletDescriptor::from(&evt.device()));
            let tool = tablet_seat
                .get_tool(&tool)
                .unwrap_or_else(|| tablet_seat.add_wp_tool(self, dh, &tool));

            self.pointer_motion(
                under.clone(),
                &MotionEvent {
                    location: pointer_location,
                    serial: SCOUNTER.next_serial(),
                    time: evt.time(),
                },
            );
            self.pointer_frame();

            if let Some(tablet) = tablet {
                let frame = tablet::tool::AxisFrame {
                    pressure: evt.pressure_has_changed().then(|| evt.pressure()),
                    distance: evt.distance_has_changed().then(|| evt.distance()),
                    tilt: evt.tilt_has_changed().then(|| evt.tilt()),
                    rotation: evt.rotation_has_changed().then(|| evt.rotation()),
                    slider: evt.slider_has_changed().then(|| evt.slider_position()),
                    wheel: evt
                        .wheel_has_changed()
                        .then(|| (evt.wheel_delta(), evt.wheel_delta_discrete())),
                };

                match evt.state() {
                    ProximityState::In => {
                        tool.proximity_in(
                            self,
                            under,
                            tablet,
                            &tablet::tool::ProximityInEvent {
                                location: pointer_location,
                                axis: Some(frame),
                                serial: SCOUNTER.next_serial(),
                                time: evt.time(),
                            },
                        );
                    }
                    ProximityState::Out => {
                        tool.proximity_out(
                            self,
                            &tablet::tool::ProximityOutEvent {
                                serial: SCOUNTER.next_serial(),
                                time: evt.time(),
                            },
                        );
                    }
                }

                // Doing this in an idle handler would allow other events (e.g. buttons) to be
                // sent as part of the same frame, which is closer to what the protocol
                // expect, and let well behaved clients accumulate events.
                tool.frame(self, evt.time());
            }
        }
    }

    fn on_tablet_tool_tip<B: InputBackend>(&mut self, evt: B::TabletToolTipEvent) {
        let tool = self.seat.tablet_seat().get_tool(&evt.tool());

        if let Some(tool) = tool {
            let serial = SCOUNTER.next_serial();

            match evt.tip_state() {
                TabletToolTipState::Down => {
                    tool.down(
                        self,
                        &tablet::tool::DownEvent {
                            serial,
                            time: evt.time(),
                        },
                    );

                    // change the keyboard focus
                    self.update_keyboard_focus(self.pointer.current_location(), serial);
                }
                TabletToolTipState::Up => {
                    tool.up(
                        self,
                        &tablet::tool::UpEvent {
                            serial,
                            time: evt.time(),
                        },
                    );
                }
            }

            tool.frame(self, evt.time());
        }
    }

    fn on_tablet_button<B: InputBackend>(&mut self, evt: B::TabletToolButtonEvent) {
        let tool = self.seat.tablet_seat().get_tool(&evt.tool());

        if let Some(tool) = tool {
            tool.button(
                self,
                &tablet::tool::ButtonEvent {
                    serial: SCOUNTER.next_serial(),
                    button: evt.button(),
                    state: evt.button_state(),
                    time: evt.time(),
                },
            );

            tool.frame(self, evt.time());
        }
    }

    fn on_gesture_swipe_begin<B: InputBackend>(&mut self, evt: B::GestureSwipeBeginEvent) {
        let serial = SCOUNTER.next_serial();
        let pointer = self.pointer.clone();
        pointer.gesture_swipe_begin(
            self,
            &GestureSwipeBeginEvent {
                serial,
                time: evt.time(),
                fingers: evt.fingers(),
            },
        );
    }

    fn on_gesture_swipe_update<B: InputBackend>(&mut self, evt: B::GestureSwipeUpdateEvent) {
        let pointer = self.pointer.clone();
        pointer.gesture_swipe_update(
            self,
            &GestureSwipeUpdateEvent {
                time: evt.time(),
                delta: evt.delta(),
            },
        );
    }

    fn on_gesture_swipe_end<B: InputBackend>(&mut self, evt: B::GestureSwipeEndEvent) {
        let serial = SCOUNTER.next_serial();
        let pointer = self.pointer.clone();
        pointer.gesture_swipe_end(
            self,
            &GestureSwipeEndEvent {
                serial,
                time: evt.time(),
                cancelled: evt.cancelled(),
            },
        );
    }

    fn on_gesture_pinch_begin<B: InputBackend>(&mut self, evt: B::GesturePinchBeginEvent) {
        let serial = SCOUNTER.next_serial();
        let pointer = self.pointer.clone();
        pointer.gesture_pinch_begin(
            self,
            &GesturePinchBeginEvent {
                serial,
                time: evt.time(),
                fingers: evt.fingers(),
            },
        );
    }

    fn on_gesture_pinch_update<B: InputBackend>(&mut self, evt: B::GesturePinchUpdateEvent) {
        let pointer = self.pointer.clone();
        pointer.gesture_pinch_update(
            self,
            &GesturePinchUpdateEvent {
                time: evt.time(),
                delta: evt.delta(),
                scale: evt.scale(),
                rotation: evt.rotation(),
            },
        );
    }

    fn on_gesture_pinch_end<B: InputBackend>(&mut self, evt: B::GesturePinchEndEvent) {
        let serial = SCOUNTER.next_serial();
        let pointer = self.pointer.clone();
        pointer.gesture_pinch_end(
            self,
            &GesturePinchEndEvent {
                serial,
                time: evt.time(),
                cancelled: evt.cancelled(),
            },
        );
    }

    fn on_gesture_hold_begin<B: InputBackend>(&mut self, evt: B::GestureHoldBeginEvent) {
        let serial = SCOUNTER.next_serial();
        let pointer = self.pointer.clone();
        pointer.gesture_hold_begin(
            self,
            &GestureHoldBeginEvent {
                serial,
                time: evt.time(),
                fingers: evt.fingers(),
            },
        );
    }

    fn on_gesture_hold_end<B: InputBackend>(&mut self, evt: B::GestureHoldEndEvent) {
        let serial = SCOUNTER.next_serial();
        let pointer = self.pointer.clone();
        pointer.gesture_hold_end(
            self,
            &GestureHoldEndEvent {
                serial,
                time: evt.time(),
                cancelled: evt.cancelled(),
            },
        );
    }

    fn clamp_coords(&self, pos: Point<f64, Logical>) -> Point<f64, Logical> {
        let geometries = self
            .space
            .outputs()
            .filter_map(|output| self.space.output_geometry(output))
            .collect::<Vec<_>>();
        if geometries
            .iter()
            .any(|geometry| geometry.to_f64().contains(pos))
        {
            return pos;
        }

        geometries
            .into_iter()
            .map(|geometry| {
                let geometry = geometry.to_f64();
                let end = geometry.loc + geometry.size;
                let candidate = Point::from((
                    pos.x.clamp(geometry.loc.x, end.x - 0.001),
                    pos.y.clamp(geometry.loc.y, end.y - 0.001),
                ));
                let delta = candidate - pos;
                (candidate, delta.x.mul_add(delta.x, delta.y * delta.y))
            })
            .min_by(|(_, left), (_, right)| left.total_cmp(right))
            .map_or(pos, |(candidate, _)| candidate)
    }

    fn output_bounds(&self) -> Option<Rectangle<i32, Logical>> {
        let mut geometries = self
            .space
            .outputs()
            .filter_map(|output| self.space.output_geometry(output));
        let first = geometries.next()?;
        let mut min_x = first.loc.x;
        let mut min_y = first.loc.y;
        let mut max_x = first.loc.x + first.size.w;
        let mut max_y = first.loc.y + first.size.h;
        for geometry in geometries {
            min_x = min_x.min(geometry.loc.x);
            min_y = min_y.min(geometry.loc.y);
            max_x = max_x.max(geometry.loc.x + geometry.size.w);
            max_y = max_y.max(geometry.loc.y + geometry.size.h);
        }
        Some(Rectangle::new(
            (min_x, min_y).into(),
            (max_x - min_x, max_y - min_y).into(),
        ))
    }
}

#[derive(Debug)]
enum KeyAction {
    VtSwitch(i32),
    SwitchWorkspace(WorkspaceId),
    SwitchRelativeWorkspace(i32),
    MoveWindowToWorkspace(WorkspaceId),
    CycleWindows { reverse: bool },
    CloseActiveWindow,
    RestartShell,
    Shell(ShellCommand),
    None,
}

fn process_keyboard_shortcut(modifiers: ModifiersState, keysym: Keysym) -> Option<KeyAction> {
    let symbol = keysym.raw();
    if (xkb::KEY_XF86Switch_VT_1..=xkb::KEY_XF86Switch_VT_12).contains(&symbol) {
        return Some(KeyAction::VtSwitch(
            (keysym.raw() - xkb::KEY_XF86Switch_VT_1 + 1) as i32,
        ));
    }

    let plain_logo = modifiers.logo && !modifiers.ctrl && !modifiers.alt && !modifiers.shift;
    let shifted_logo = modifiers.logo && !modifiers.ctrl && !modifiers.alt && modifiers.shift;
    let plain_alt = modifiers.alt && !modifiers.ctrl && !modifiers.logo && !modifiers.shift;
    let shifted_alt = modifiers.alt && !modifiers.ctrl && !modifiers.logo && modifiers.shift;
    let workspace = (xkb::KEY_1..=xkb::KEY_9)
        .contains(&symbol)
        .then(|| WorkspaceId((symbol - xkb::KEY_1 + 1).to_string()));
    let tab = symbol == xkb::KEY_Tab || symbol == xkb::KEY_ISO_Left_Tab;

    if shifted_logo {
        if let Some(workspace) = workspace {
            return Some(KeyAction::MoveWindowToWorkspace(workspace));
        }
        if symbol == xkb::KEY_r {
            return Some(KeyAction::RestartShell);
        }
        if tab {
            return Some(KeyAction::CycleWindows { reverse: true });
        }
        return None;
    }

    if plain_logo {
        if let Some(workspace) = workspace {
            return Some(KeyAction::SwitchWorkspace(workspace));
        }
        return match symbol {
            xkb::KEY_Left | xkb::KEY_Up => Some(KeyAction::SwitchRelativeWorkspace(-1)),
            xkb::KEY_Right | xkb::KEY_Down => Some(KeyAction::SwitchRelativeWorkspace(1)),
            xkb::KEY_space => Some(KeyAction::Shell(ShellCommand::OpenLauncher)),
            xkb::KEY_Return => Some(KeyAction::Shell(ShellCommand::LaunchDefaultApp {
                app: DefaultAppKind::Terminal,
            })),
            xkb::KEY_e => Some(KeyAction::Shell(ShellCommand::LaunchDefaultApp {
                app: DefaultAppKind::FileManager,
            })),
            xkb::KEY_q => Some(KeyAction::CloseActiveWindow),
            _ if tab => Some(KeyAction::CycleWindows { reverse: false }),
            _ => None,
        };
    }

    if (plain_alt || shifted_alt) && tab {
        return Some(KeyAction::CycleWindows {
            reverse: shifted_alt,
        });
    }

    None
}

fn is_logo_key(keysym: Keysym) -> bool {
    matches!(keysym.raw(), xkb::KEY_Super_L | xkb::KEY_Super_R)
}

fn surface_contains_point(
    surface: &smithay::reexports::wayland_server::protocol::wl_surface::WlSurface,
    point: Point<f64, Logical>,
) -> bool {
    with_states(surface, |states| {
        let Some(size) = states
            .data_map
            .get::<RendererSurfaceStateUserData>()
            .and_then(|state| state.lock().ok()?.view().map(|view| view.dst))
        else {
            return false;
        };
        if !Rectangle::from_size(size).to_f64().contains(point) {
            return false;
        }
        states
            .cached_state
            .get::<SurfaceAttributes>()
            .current()
            .input_region
            .as_ref()
            .is_none_or(|region| region.contains(point.to_i32_floor()))
    })
}
