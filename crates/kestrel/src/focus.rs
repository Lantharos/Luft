use std::{borrow::Cow, sync::Arc};

pub use smithay::{
    backend::input::{InputTime, KeyState},
    desktop::{LayerSurface, PopupKind},
    input::{
        Seat,
        keyboard::{KeyboardTarget, KeysymHandle, ModifiersState},
        pointer::{AxisFrame, ButtonEvent, MotionEvent, PointerTarget, RelativeMotionEvent},
    },
    reexports::wayland_server::{Resource, backend::ObjectId, protocol::wl_surface::WlSurface},
    utils::{IsAlive, Serial},
    wayland::seat::WaylandFocus,
};
use smithay::{
    desktop::{Window, WindowSurface},
    input::{
        dnd::{DndFocus, OfferData, Source},
        pointer::{
            GestureHoldBeginEvent, GestureHoldEndEvent, GesturePinchBeginEvent,
            GesturePinchEndEvent, GesturePinchUpdateEvent, GestureSwipeBeginEvent,
            GestureSwipeEndEvent, GestureSwipeUpdateEvent,
        },
        tablet::tool::TabletToolTarget,
        touch::{FrameMarker, TouchTarget},
    },
    reexports::wayland_server::DisplayHandle,
    utils::{Logical, Point},
    wayland::selection::data_device::WlOfferData,
};

use crate::{
    shell::{SSD, WindowElement},
    state::{Backend, KestrelState},
};

#[derive(Debug, Clone, PartialEq)]
#[allow(clippy::large_enum_variant)]
pub enum KeyboardFocusTarget {
    Window(Window),
    LayerSurface(LayerSurface),
    Popup(PopupKind),
    Surface(WlSurface),
}

impl IsAlive for KeyboardFocusTarget {
    #[inline]
    fn alive(&self) -> bool {
        match self {
            KeyboardFocusTarget::Window(w) => w.alive(),
            KeyboardFocusTarget::LayerSurface(l) => l.alive(),
            KeyboardFocusTarget::Popup(p) => p.alive(),
            KeyboardFocusTarget::Surface(surface) => surface.alive(),
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
#[allow(clippy::large_enum_variant)]
pub enum PointerFocusTarget {
    WlSurface(WlSurface),
    SSD(SSD),
}

impl IsAlive for PointerFocusTarget {
    #[inline]
    fn alive(&self) -> bool {
        match self {
            PointerFocusTarget::WlSurface(w) => w.alive(),
            PointerFocusTarget::SSD(x) => x.alive(),
        }
    }
}

impl From<PointerFocusTarget> for WlSurface {
    #[inline]
    fn from(target: PointerFocusTarget) -> Self {
        target.wl_surface().unwrap().into_owned()
    }
}

impl KeyboardFocusTarget {
    fn inner_keyboard_target<BackendData: Backend>(
        &self,
    ) -> &dyn KeyboardTarget<KestrelState<BackendData>> {
        match self {
            Self::Window(w) => match w.underlying_surface() {
                WindowSurface::Wayland(w) => w.wl_surface(),
            },
            Self::LayerSurface(l) => l.wl_surface(),
            Self::Popup(p) => p.wl_surface(),
            Self::Surface(surface) => surface,
        }
    }
}

impl PointerFocusTarget {
    fn inner_pointer_target<BackendData: Backend>(
        &self,
    ) -> &dyn PointerTarget<KestrelState<BackendData>> {
        match self {
            Self::WlSurface(w) => w,
            Self::SSD(w) => w,
        }
    }

    fn inner_touch_target<BackendData: Backend>(
        &self,
    ) -> &dyn TouchTarget<KestrelState<BackendData>> {
        match self {
            Self::WlSurface(w) => w,
            Self::SSD(w) => w,
        }
    }

    fn inner_tablet_tool_target<BackendData: Backend>(
        &self,
    ) -> &dyn TabletToolTarget<KestrelState<BackendData>> {
        match self {
            Self::WlSurface(w) => w,
            Self::SSD(w) => w,
        }
    }
}

impl<BackendData: Backend> PointerTarget<KestrelState<BackendData>> for PointerFocusTarget {
    fn enter(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &MotionEvent,
    ) {
        self.inner_pointer_target().enter(seat, data, event)
    }
    fn motion(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &MotionEvent,
    ) {
        self.inner_pointer_target().motion(seat, data, event)
    }
    fn relative_motion(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &RelativeMotionEvent,
    ) {
        self.inner_pointer_target()
            .relative_motion(seat, data, event)
    }
    fn button(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &ButtonEvent,
    ) {
        self.inner_pointer_target().button(seat, data, event)
    }
    fn axis(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        frame: AxisFrame,
    ) {
        self.inner_pointer_target().axis(seat, data, frame)
    }
    fn frame(&self, seat: &Seat<KestrelState<BackendData>>, data: &mut KestrelState<BackendData>) {
        self.inner_pointer_target().frame(seat, data)
    }
    fn leave(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        serial: Serial,
        time: InputTime,
    ) {
        self.inner_pointer_target().leave(seat, data, serial, time)
    }
    fn gesture_swipe_begin(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &GestureSwipeBeginEvent,
    ) {
        self.inner_pointer_target()
            .gesture_swipe_begin(seat, data, event)
    }
    fn gesture_swipe_update(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &GestureSwipeUpdateEvent,
    ) {
        self.inner_pointer_target()
            .gesture_swipe_update(seat, data, event)
    }
    fn gesture_swipe_end(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &GestureSwipeEndEvent,
    ) {
        self.inner_pointer_target()
            .gesture_swipe_end(seat, data, event)
    }
    fn gesture_pinch_begin(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &GesturePinchBeginEvent,
    ) {
        self.inner_pointer_target()
            .gesture_pinch_begin(seat, data, event)
    }
    fn gesture_pinch_update(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &GesturePinchUpdateEvent,
    ) {
        self.inner_pointer_target()
            .gesture_pinch_update(seat, data, event)
    }
    fn gesture_pinch_end(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &GesturePinchEndEvent,
    ) {
        self.inner_pointer_target()
            .gesture_pinch_end(seat, data, event)
    }
    fn gesture_hold_begin(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &GestureHoldBeginEvent,
    ) {
        self.inner_pointer_target()
            .gesture_hold_begin(seat, data, event)
    }
    fn gesture_hold_end(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &GestureHoldEndEvent,
    ) {
        self.inner_pointer_target()
            .gesture_hold_end(seat, data, event)
    }
}

impl<BackendData: Backend> KeyboardTarget<KestrelState<BackendData>> for KeyboardFocusTarget {
    fn enter(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        keys: Vec<KeysymHandle<'_>>,
        serial: Serial,
    ) {
        self.inner_keyboard_target().enter(seat, data, keys, serial)
    }
    fn leave(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        serial: Serial,
    ) {
        self.inner_keyboard_target().leave(seat, data, serial)
    }
    fn key(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        key: KeysymHandle<'_>,
        state: KeyState,
        serial: Serial,
        time: InputTime,
    ) {
        self.inner_keyboard_target()
            .key(seat, data, key, state, serial, time)
    }
    fn modifiers(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        modifiers: ModifiersState,
        serial: Serial,
    ) {
        self.inner_keyboard_target()
            .modifiers(seat, data, modifiers, serial)
    }
}

impl<BackendData: Backend> TouchTarget<KestrelState<BackendData>> for PointerFocusTarget {
    fn down(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &smithay::input::touch::DownEvent,
    ) {
        self.inner_touch_target().down(seat, data, event)
    }

    fn up(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &smithay::input::touch::UpEvent,
    ) {
        self.inner_touch_target().up(seat, data, event)
    }

    fn motion(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &smithay::input::touch::MotionEvent,
    ) {
        self.inner_touch_target().motion(seat, data, event)
    }

    fn frame(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        marker: FrameMarker,
    ) {
        self.inner_touch_target().frame(seat, data, marker)
    }

    fn cancel(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        marker: FrameMarker,
    ) {
        self.inner_touch_target().cancel(seat, data, marker)
    }

    fn shape(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &smithay::input::touch::ShapeEvent,
    ) {
        self.inner_touch_target().shape(seat, data, event)
    }

    fn orientation(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &smithay::input::touch::OrientationEvent,
    ) {
        self.inner_touch_target().orientation(seat, data, event)
    }

    fn last_frame(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
    ) -> Option<FrameMarker> {
        self.inner_touch_target().last_frame(seat, data)
    }
}

impl<BackendData: Backend> TabletToolTarget<KestrelState<BackendData>> for PointerFocusTarget {
    fn proximity_in(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        tablet: &smithay::input::tablet::Tablet,
        serial: Serial,
    ) {
        self.inner_tablet_tool_target()
            .proximity_in(seat, data, tool_descriptor, tablet, serial);
    }

    fn proximity_out(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
    ) {
        self.inner_tablet_tool_target()
            .proximity_out(seat, data, tool_descriptor);
    }

    fn down(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        event: &smithay::input::tablet::tool::DownEvent,
    ) {
        self.inner_tablet_tool_target()
            .down(seat, data, tool_descriptor, event);
    }

    fn up(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        event: &smithay::input::tablet::tool::UpEvent,
    ) {
        self.inner_tablet_tool_target()
            .up(seat, data, tool_descriptor, event);
    }

    fn motion(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        event: &smithay::input::tablet::tool::MotionEvent,
    ) {
        self.inner_tablet_tool_target()
            .motion(seat, data, tool_descriptor, event);
    }

    fn button(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        event: &smithay::input::tablet::tool::ButtonEvent,
    ) {
        self.inner_tablet_tool_target()
            .button(seat, data, tool_descriptor, event);
    }

    fn axis(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        frame: smithay::input::tablet::tool::AxisFrame,
    ) {
        self.inner_tablet_tool_target()
            .axis(seat, data, tool_descriptor, frame);
    }

    fn frame(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        time: InputTime,
    ) {
        self.inner_tablet_tool_target()
            .frame(seat, data, tool_descriptor, time);
    }
}

impl WaylandFocus for PointerFocusTarget {
    #[inline]
    fn wl_surface(&self) -> Option<Cow<'_, WlSurface>> {
        match self {
            PointerFocusTarget::WlSurface(w) => w.wl_surface(),
            PointerFocusTarget::SSD(_) => None,
        }
    }
    #[inline]
    fn same_client_as(&self, object_id: &ObjectId) -> bool {
        match self {
            PointerFocusTarget::WlSurface(w) => w.same_client_as(object_id),
            PointerFocusTarget::SSD(w) => w
                .wl_surface()
                .map(|surface| surface.same_client_as(object_id))
                .unwrap_or(false),
        }
    }
}

impl WaylandFocus for KeyboardFocusTarget {
    #[inline]
    fn wl_surface(&self) -> Option<Cow<'_, WlSurface>> {
        match self {
            KeyboardFocusTarget::Window(w) => w.wl_surface(),
            KeyboardFocusTarget::LayerSurface(l) => Some(Cow::Borrowed(l.wl_surface())),
            KeyboardFocusTarget::Popup(p) => Some(Cow::Borrowed(p.wl_surface())),
            KeyboardFocusTarget::Surface(surface) => Some(Cow::Borrowed(surface)),
        }
    }
}

pub enum KestrelOfferData<S: Source> {
    Wayland(WlOfferData<S>),
}

impl<S: Source> OfferData for KestrelOfferData<S> {
    fn disable(&self) {
        match self {
            KestrelOfferData::Wayland(data) => data.disable(),
        }
    }

    fn drop(&self) {
        match self {
            KestrelOfferData::Wayland(data) => data.drop(),
        }
    }

    fn validated(&self) -> bool {
        match self {
            KestrelOfferData::Wayland(data) => data.validated(),
        }
    }
}

#[allow(unreachable_patterns)]
impl<BackendData: Backend> DndFocus<KestrelState<BackendData>> for PointerFocusTarget {
    type OfferData<S>
        = KestrelOfferData<S>
    where
        S: Source;

    fn enter<S: Source>(
        &self,
        data: &mut KestrelState<BackendData>,
        dh: &DisplayHandle,
        source: Arc<S>,
        seat: &Seat<KestrelState<BackendData>>,
        location: Point<f64, Logical>,
        serial: &Serial,
    ) -> Option<KestrelOfferData<S>> {
        match self {
            PointerFocusTarget::WlSurface(surface) => {
                DndFocus::enter(surface, data, dh, source, seat, location, serial)
                    .map(KestrelOfferData::Wayland)
            }
            _ => None,
        }
    }

    fn motion<S: Source>(
        &self,
        data: &mut KestrelState<BackendData>,
        offer: Option<&mut KestrelOfferData<S>>,
        seat: &Seat<KestrelState<BackendData>>,
        location: Point<f64, Logical>,
        time: InputTime,
    ) {
        if let PointerFocusTarget::WlSurface(surface) = self {
            let offer = match offer {
                Some(KestrelOfferData::Wayland(offer)) => Some(offer),
                None => None,
                _ => return,
            };
            DndFocus::motion(surface, data, offer, seat, location, time)
        }
    }

    fn leave<S: Source>(
        &self,
        data: &mut KestrelState<BackendData>,
        offer: Option<&mut KestrelOfferData<S>>,
        seat: &Seat<KestrelState<BackendData>>,
    ) {
        if let PointerFocusTarget::WlSurface(surface) = self {
            let offer = match offer {
                Some(KestrelOfferData::Wayland(offer)) => Some(offer),
                None => None,
                _ => return,
            };
            DndFocus::leave(surface, data, offer, seat)
        }
    }

    fn drop<S: Source>(
        &self,
        data: &mut KestrelState<BackendData>,
        offer: Option<&mut KestrelOfferData<S>>,
        seat: &Seat<KestrelState<BackendData>>,
    ) {
        if let PointerFocusTarget::WlSurface(surface) = self {
            let offer = match offer {
                Some(KestrelOfferData::Wayland(offer)) => Some(offer),
                None => None,
                _ => return,
            };
            DndFocus::drop(surface, data, offer, seat)
        }
    }
}

impl From<WlSurface> for PointerFocusTarget {
    #[inline]
    fn from(value: WlSurface) -> Self {
        PointerFocusTarget::WlSurface(value)
    }
}

impl From<&WlSurface> for PointerFocusTarget {
    #[inline]
    fn from(value: &WlSurface) -> Self {
        PointerFocusTarget::from(value.clone())
    }
}

impl From<PopupKind> for PointerFocusTarget {
    #[inline]
    fn from(value: PopupKind) -> Self {
        PointerFocusTarget::from(value.wl_surface())
    }
}

impl From<WindowElement> for KeyboardFocusTarget {
    #[inline]
    fn from(w: WindowElement) -> Self {
        KeyboardFocusTarget::Window(w.0.clone())
    }
}

impl From<LayerSurface> for KeyboardFocusTarget {
    #[inline]
    fn from(l: LayerSurface) -> Self {
        KeyboardFocusTarget::LayerSurface(l)
    }
}

impl From<PopupKind> for KeyboardFocusTarget {
    #[inline]
    fn from(p: PopupKind) -> Self {
        KeyboardFocusTarget::Popup(p)
    }
}

impl From<KeyboardFocusTarget> for PointerFocusTarget {
    #[inline]
    fn from(value: KeyboardFocusTarget) -> Self {
        match value {
            KeyboardFocusTarget::Window(w) => match w.underlying_surface() {
                WindowSurface::Wayland(w) => PointerFocusTarget::from(w.wl_surface()),
            },
            KeyboardFocusTarget::LayerSurface(surface) => {
                PointerFocusTarget::from(surface.wl_surface())
            }
            KeyboardFocusTarget::Popup(popup) => PointerFocusTarget::from(popup.wl_surface()),
            KeyboardFocusTarget::Surface(surface) => PointerFocusTarget::from(surface),
        }
    }
}
