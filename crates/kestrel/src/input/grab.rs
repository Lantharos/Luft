use crate::{
    state::{KestrelState, WindowGrabKind, WindowGrabMeta},
    window::ResizeEdge,
    window_geometry::{move_geometry, resize_geometry},
};
use luft_ipc::{Rect, WindowId};
use smithay::{
    input::pointer::{
        AxisFrame, ButtonEvent, Focus, GestureHoldBeginEvent, GestureHoldEndEvent,
        GesturePinchBeginEvent, GesturePinchEndEvent, GesturePinchUpdateEvent,
        GestureSwipeBeginEvent, GestureSwipeEndEvent, GestureSwipeUpdateEvent, GrabStartData,
        MotionEvent, PointerGrab, PointerHandle, PointerInnerHandle, RelativeMotionEvent,
    },
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    utils::{Logical, Point, Serial},
    wayland::shell::xdg::ToplevelSurface,
};

pub struct MoveSurfaceGrab {
    start_data: GrabStartData<KestrelState>,
    id: WindowId,
    start_geometry: Rect,
    forward_button_release: bool,
}

pub struct ResizeSurfaceGrab {
    start_data: GrabStartData<KestrelState>,
    id: WindowId,
    edge: ResizeEdge,
    start_geometry: Rect,
    forward_button_release: bool,
}

impl KestrelState {
    pub fn clear_window_grab(&mut self) {
        self.window_grab = None;
        self.pending_window_drag = None;
    }

    pub fn window_grab_forwards_button_release(&self) -> bool {
        self.window_grab
            .as_ref()
            .is_some_and(|grab| grab.forward_button_release)
    }

    pub fn start_move_grab(
        &mut self,
        pointer: &PointerHandle<Self>,
        surface: ToplevelSurface,
        serial: Serial,
        button: u32,
        forward_button_release: bool,
    ) {
        let Some((id, start_geometry)) = self.windows.geometry_for_surface(&surface) else {
            return;
        };

        self.windows.set_restore_geometry(id, None);
        self.pending_window_drag = None;

        let start_data = pointer.grab_start_data().unwrap_or(GrabStartData {
            focus: self.pointer_focus(self.pointer_location),
            button,
            location: self.pointer_location,
        });

        self.window_grab = Some(WindowGrabMeta {
            kind: WindowGrabKind::Move,
            forward_button_release,
        });

        pointer.set_grab(
            self,
            MoveSurfaceGrab {
                start_data,
                id,
                start_geometry,
                forward_button_release,
            },
            serial,
            Focus::Clear,
        );
    }

    pub fn start_resize_grab(
        &mut self,
        pointer: &PointerHandle<Self>,
        surface: ToplevelSurface,
        edge: ResizeEdge,
        serial: Serial,
        button: u32,
        forward_button_release: bool,
    ) {
        use luft_ipc::WindowState;

        let Some((id, start_geometry)) = self.windows.geometry_for_surface(&surface) else {
            return;
        };

        self.pending_window_drag = None;
        self.windows.set_restore_geometry(id, None);
        let _ = self.layout.set_window_state(id, WindowState::Floating);

        let start_data = pointer.grab_start_data().unwrap_or(GrabStartData {
            focus: self.pointer_focus(self.pointer_location),
            button,
            location: self.pointer_location,
        });

        self.window_grab = Some(WindowGrabMeta {
            kind: WindowGrabKind::Resize { edge },
            forward_button_release,
        });

        pointer.set_grab(
            self,
            ResizeSurfaceGrab {
                start_data,
                id,
                edge,
                start_geometry,
                forward_button_release,
            },
            serial,
            Focus::Clear,
        );
    }

    pub fn try_promote_pending_window_drag(
        &mut self,
        pointer: &PointerHandle<Self>,
        location: Point<f64, Logical>,
    ) {
        const DRAG_THRESHOLD: f64 = 8.0;

        let Some(pending) = self.pending_window_drag.clone() else {
            return;
        };
        let dx = location.x - pending.pointer_start.x;
        let dy = location.y - pending.pointer_start.y;
        if dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD {
            return;
        }

        self.start_move_grab(
            pointer,
            pending.surface,
            pending.serial,
            pending.button,
            true,
        );
    }

    pub(crate) fn apply_grabbed_window_geometry(&mut self, id: WindowId, geometry: Rect) {
        self.apply_window_geometry(id, geometry, false, false, false);
    }
}

impl PointerGrab<KestrelState> for MoveSurfaceGrab {
    fn motion(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        _focus: Option<(WlSurface, Point<f64, Logical>)>,
        event: &MotionEvent,
    ) {
        handle.motion(data, None, event);
        let geometry = move_geometry(
            self.start_geometry,
            self.start_data.location,
            event.location,
        );
        data.apply_grabbed_window_geometry(self.id, geometry);
    }

    fn relative_motion(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        focus: Option<(WlSurface, Point<f64, Logical>)>,
        event: &RelativeMotionEvent,
    ) {
        handle.relative_motion(data, focus, event);
    }

    fn button(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &ButtonEvent,
    ) {
        if self.forward_button_release {
            handle.button(data, event);
        }
        if event.button == self.start_data.button && !button_pressed(event.state) {
            handle.unset_grab(self, data, event.serial, event.time, true);
        }
    }

    fn axis(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        details: AxisFrame,
    ) {
        handle.axis(data, details);
    }

    fn frame(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
    ) {
        handle.frame(data);
    }

    fn gesture_swipe_begin(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GestureSwipeBeginEvent,
    ) {
        handle.gesture_swipe_begin(data, event);
    }

    fn gesture_swipe_update(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GestureSwipeUpdateEvent,
    ) {
        handle.gesture_swipe_update(data, event);
    }

    fn gesture_swipe_end(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GestureSwipeEndEvent,
    ) {
        handle.gesture_swipe_end(data, event);
    }

    fn gesture_pinch_begin(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GesturePinchBeginEvent,
    ) {
        handle.gesture_pinch_begin(data, event);
    }

    fn gesture_pinch_update(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GesturePinchUpdateEvent,
    ) {
        handle.gesture_pinch_update(data, event);
    }

    fn gesture_pinch_end(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GesturePinchEndEvent,
    ) {
        handle.gesture_pinch_end(data, event);
    }

    fn gesture_hold_begin(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GestureHoldBeginEvent,
    ) {
        handle.gesture_hold_begin(data, event);
    }

    fn gesture_hold_end(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GestureHoldEndEvent,
    ) {
        handle.gesture_hold_end(data, event);
    }

    fn start_data(&self) -> &GrabStartData<KestrelState> {
        &self.start_data
    }

    fn unset(&mut self, data: &mut KestrelState) {
        data.clear_window_grab();
    }
}

impl PointerGrab<KestrelState> for ResizeSurfaceGrab {
    fn motion(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        _focus: Option<(WlSurface, Point<f64, Logical>)>,
        event: &MotionEvent,
    ) {
        handle.motion(data, None, event);
        let geometry = resize_geometry(
            self.start_geometry,
            self.edge,
            self.start_data.location,
            event.location,
        );
        data.apply_grabbed_window_geometry(self.id, geometry);
    }

    fn relative_motion(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        focus: Option<(WlSurface, Point<f64, Logical>)>,
        event: &RelativeMotionEvent,
    ) {
        handle.relative_motion(data, focus, event);
    }

    fn button(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &ButtonEvent,
    ) {
        if self.forward_button_release {
            handle.button(data, event);
        }
        if event.button == self.start_data.button && !button_pressed(event.state) {
            handle.unset_grab(self, data, event.serial, event.time, true);
        }
    }

    fn axis(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        details: AxisFrame,
    ) {
        handle.axis(data, details);
    }

    fn frame(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
    ) {
        handle.frame(data);
    }

    fn gesture_swipe_begin(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GestureSwipeBeginEvent,
    ) {
        handle.gesture_swipe_begin(data, event);
    }

    fn gesture_swipe_update(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GestureSwipeUpdateEvent,
    ) {
        handle.gesture_swipe_update(data, event);
    }

    fn gesture_swipe_end(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GestureSwipeEndEvent,
    ) {
        handle.gesture_swipe_end(data, event);
    }

    fn gesture_pinch_begin(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GesturePinchBeginEvent,
    ) {
        handle.gesture_pinch_begin(data, event);
    }

    fn gesture_pinch_update(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GesturePinchUpdateEvent,
    ) {
        handle.gesture_pinch_update(data, event);
    }

    fn gesture_pinch_end(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GesturePinchEndEvent,
    ) {
        handle.gesture_pinch_end(data, event);
    }

    fn gesture_hold_begin(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GestureHoldBeginEvent,
    ) {
        handle.gesture_hold_begin(data, event);
    }

    fn gesture_hold_end(
        &mut self,
        data: &mut KestrelState,
        handle: &mut PointerInnerHandle<'_, KestrelState>,
        event: &GestureHoldEndEvent,
    ) {
        handle.gesture_hold_end(data, event);
    }

    fn start_data(&self) -> &GrabStartData<KestrelState> {
        &self.start_data
    }

    fn unset(&mut self, data: &mut KestrelState) {
        data.clear_window_grab();
    }
}

fn button_pressed(state: smithay::backend::input::ButtonState) -> bool {
    matches!(state, smithay::backend::input::ButtonState::Pressed)
}
