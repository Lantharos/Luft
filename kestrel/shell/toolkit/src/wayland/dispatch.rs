use std::time::Duration;

use wayland_client::globals::GlobalListContents;
use wayland_client::protocol::{
    wl_callback::{self, WlCallback},
    wl_compositor::WlCompositor,
    wl_keyboard::{self, WlKeyboard},
    wl_pointer::{self, WlPointer},
    wl_region::WlRegion,
    wl_registry::{self, WlRegistry},
    wl_seat::{self, WlSeat},
    wl_surface::WlSurface,
};
use wayland_client::{Connection, Dispatch, QueueHandle, WEnum, delegate_noop};
use wayland_protocols::ext::background_effect::v1::client::{
    ext_background_effect_manager_v1::ExtBackgroundEffectManagerV1,
    ext_background_effect_surface_v1::ExtBackgroundEffectSurfaceV1,
};
use wayland_protocols::wp::cursor_shape::v1::client::{
    wp_cursor_shape_device_v1::{Shape, WpCursorShapeDeviceV1},
    wp_cursor_shape_manager_v1::WpCursorShapeManagerV1,
};
use wayland_protocols::wp::fractional_scale::v1::client::{
    wp_fractional_scale_manager_v1::WpFractionalScaleManagerV1,
    wp_fractional_scale_v1::{self, WpFractionalScaleV1},
};
use wayland_protocols::wp::presentation_time::client::{
    wp_presentation::WpPresentation,
    wp_presentation_feedback::{self, WpPresentationFeedback},
};
use wayland_protocols::wp::viewporter::client::{
    wp_viewport::WpViewport, wp_viewporter::WpViewporter,
};
use wayland_protocols::xdg::shell::client::{
    xdg_surface::{self, XdgSurface},
    xdg_toplevel::{self, XdgToplevel},
    xdg_wm_base::{self, XdgWmBase},
};

use super::protocols::glass::{
    kestrel_glass_manager_v1::KestrelGlassManagerV1, kestrel_glass_v1::KestrelGlassV1,
};
use super::protocols::window::{
    kestrel_window_manager_v1::KestrelWindowManagerV1,
    kestrel_window_state_v1::KestrelWindowStateV1,
};
use super::{Event, State};

const LEFT_BUTTON: u32 = 0x110;
const SCALE_DENOMINATOR: f32 = 120.0;

delegate_noop!(State: WlCompositor);
delegate_noop!(State: WlRegion);
delegate_noop!(State: WpViewporter);
delegate_noop!(State: WpViewport);
delegate_noop!(State: WpFractionalScaleManagerV1);
delegate_noop!(State: WpCursorShapeManagerV1);
delegate_noop!(State: WpCursorShapeDeviceV1);
delegate_noop!(State: ExtBackgroundEffectSurfaceV1);
delegate_noop!(State: KestrelWindowManagerV1);
delegate_noop!(State: KestrelWindowStateV1);
delegate_noop!(State: KestrelGlassManagerV1);
delegate_noop!(State: ignore WlSurface);
delegate_noop!(State: ignore ExtBackgroundEffectManagerV1);
delegate_noop!(State: ignore KestrelGlassV1);
delegate_noop!(State: ignore WpPresentation);

impl Dispatch<WlRegistry, GlobalListContents> for State {
    fn event(
        _: &mut Self,
        _: &WlRegistry,
        _: wl_registry::Event,
        _: &GlobalListContents,
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
    }
}

impl Dispatch<XdgWmBase, ()> for State {
    fn event(
        _: &mut Self,
        shell: &XdgWmBase,
        event: xdg_wm_base::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let xdg_wm_base::Event::Ping { serial } = event {
            shell.pong(serial);
        }
    }
}

impl Dispatch<XdgToplevel, ()> for State {
    fn event(
        state: &mut Self,
        _: &XdgToplevel,
        event: xdg_toplevel::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        match event {
            xdg_toplevel::Event::Configure { states, .. } => {
                let activated = xdg_toplevel::State::Activated as u32;
                state.active = states
                    .as_chunks::<4>()
                    .0
                    .iter()
                    .any(|value| u32::from_ne_bytes(*value) == activated);
            }
            xdg_toplevel::Event::Close => state.events.push(Event::CloseRequested),
            _ => {}
        }
    }
}

impl Dispatch<XdgSurface, ()> for State {
    fn event(
        state: &mut Self,
        role: &XdgSurface,
        event: xdg_surface::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let xdg_surface::Event::Configure { serial } = event {
            role.ack_configure(serial);
            state.events.push(Event::Configured {
                active: state.active,
            });
        }
    }
}

impl Dispatch<WpFractionalScaleV1, ()> for State {
    fn event(
        state: &mut Self,
        _: &WpFractionalScaleV1,
        event: wp_fractional_scale_v1::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let wp_fractional_scale_v1::Event::PreferredScale { scale } = event {
            state
                .events
                .push(Event::Scale(scale as f32 / SCALE_DENOMINATOR));
        }
    }
}

impl Dispatch<WlSeat, ()> for State {
    fn event(
        state: &mut Self,
        seat: &WlSeat,
        event: wl_seat::Event,
        (): &(),
        _: &Connection,
        handle: &QueueHandle<Self>,
    ) {
        let wl_seat::Event::Capabilities {
            capabilities: WEnum::Value(capabilities),
        } = event
        else {
            return;
        };
        if capabilities.contains(wl_seat::Capability::Pointer) && state.pointer.is_none() {
            let pointer = seat.get_pointer(handle, ());
            state.cursor = state
                .cursor_shapes
                .as_ref()
                .map(|shapes| shapes.get_pointer(&pointer, handle, ()));
            state.pointer = Some(pointer);
        }
        if capabilities.contains(wl_seat::Capability::Keyboard) && state.keyboard.is_none() {
            state.keyboard = Some(seat.get_keyboard(handle, ()));
        }
    }
}

impl Dispatch<WlPointer, ()> for State {
    fn event(
        state: &mut Self,
        _: &WlPointer,
        event: wl_pointer::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        match event {
            wl_pointer::Event::Enter {
                serial,
                surface_x,
                surface_y,
                ..
            } => {
                if let Some(cursor) = &state.cursor {
                    cursor.set_shape(serial, Shape::Default);
                }
                state
                    .events
                    .push(Event::PointerMoved(surface_x as f32, surface_y as f32));
            }
            wl_pointer::Event::Motion {
                surface_x,
                surface_y,
                ..
            } => {
                state
                    .events
                    .push(Event::PointerMoved(surface_x as f32, surface_y as f32));
            }
            wl_pointer::Event::Leave { .. } => state.events.push(Event::PointerLeft),
            wl_pointer::Event::Button {
                button: LEFT_BUTTON,
                state: WEnum::Value(pressed),
                ..
            } => {
                state.events.push(match pressed {
                    wl_pointer::ButtonState::Pressed => Event::Pressed,
                    _ => Event::Released,
                });
            }
            _ => {}
        }
    }
}

impl Dispatch<WlKeyboard, ()> for State {
    fn event(
        state: &mut Self,
        _: &WlKeyboard,
        event: wl_keyboard::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let wl_keyboard::Event::Key {
            key,
            state: WEnum::Value(wl_keyboard::KeyState::Pressed),
            ..
        } = event
        {
            state.events.push(Event::Key { code: key });
        }
    }
}

impl Dispatch<WlCallback, ()> for State {
    fn event(
        state: &mut Self,
        _: &WlCallback,
        event: wl_callback::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let wl_callback::Event::Done { .. } = event {
            state.events.push(Event::FrameDone);
        }
    }
}

impl Dispatch<WpPresentationFeedback, ()> for State {
    fn event(
        state: &mut Self,
        _: &WpPresentationFeedback,
        event: wp_presentation_feedback::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let wp_presentation_feedback::Event::Presented {
            tv_sec_hi,
            tv_sec_lo,
            tv_nsec,
            ..
        } = event
        {
            let seconds = (u64::from(tv_sec_hi) << 32) | u64::from(tv_sec_lo);
            state
                .events
                .push(Event::Presented(Duration::new(seconds, tv_nsec)));
        }
    }
}
