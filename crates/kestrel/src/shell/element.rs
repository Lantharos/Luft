use std::{borrow::Cow, time::Duration};

use smithay::{
    backend::{
        input::InputTime,
        renderer::{
            ImportAll, ImportMem, Renderer, Texture,
            element::{
                AsRenderElements, Element, memory::MemoryRenderBufferRenderElement,
                surface::WaylandSurfaceRenderElement,
            },
        },
    },
    desktop::{
        Window, WindowSurface, WindowSurfaceType, space::SpaceElement,
        utils::OutputPresentationFeedback,
    },
    input::{
        Seat,
        pointer::{
            AxisFrame, ButtonEvent, GestureHoldBeginEvent, GestureHoldEndEvent,
            GesturePinchBeginEvent, GesturePinchEndEvent, GesturePinchUpdateEvent,
            GestureSwipeBeginEvent, GestureSwipeEndEvent, GestureSwipeUpdateEvent, MotionEvent,
            PointerTarget, RelativeMotionEvent,
        },
        tablet::tool::TabletToolTarget,
        touch::{FrameMarker, TouchTarget},
    },
    output::Output,
    reexports::{
        wayland_protocols::wp::presentation_time::server::wp_presentation_feedback,
        wayland_server::protocol::wl_surface::WlSurface,
    },
    render_elements,
    utils::{IsAlive, Logical, Physical, Point, Rectangle, Scale, Serial, user_data::UserDataMap},
    wayland::{
        compositor::SurfaceData as WlSurfaceData, dmabuf::DmabufFeedback, seat::WaylandFocus,
    },
};

use super::{
    RoundedRenderer, RoundedSurfaceRenderElement,
    ssd::{HEADER_BAR_HEIGHT, WINDOW_CORNER_RADIUS},
};
use crate::{
    KestrelState,
    blur::{BlurElement, BlurRenderElement, BlurRenderer},
    focus::PointerFocusTarget,
    state::Backend,
};

#[derive(Debug, Clone, PartialEq)]
pub struct WindowElement(pub Window);

impl WindowElement {
    pub fn surface_under(
        &self,
        location: Point<f64, Logical>,
        window_type: WindowSurfaceType,
    ) -> Option<(PointerFocusTarget, Point<i32, Logical>)> {
        let state = self.decoration_state();
        if state.is_ssd && location.y < HEADER_BAR_HEIGHT as f64 {
            return Some((PointerFocusTarget::SSD(SSD(self.clone())), Point::default()));
        }
        let offset = if state.is_ssd {
            Point::from((0, HEADER_BAR_HEIGHT))
        } else {
            Point::default()
        };

        let surface_under = self
            .0
            .surface_under(location - offset.to_f64(), window_type);
        let (under, loc) = match self.0.underlying_surface() {
            WindowSurface::Wayland(_) => {
                surface_under.map(|(surface, loc)| (PointerFocusTarget::WlSurface(surface), loc))
            }
        }?;
        Some((under, loc + offset))
    }

    pub fn with_surfaces<F>(&self, processor: F)
    where
        F: FnMut(&WlSurface, &WlSurfaceData),
    {
        self.0.with_surfaces(processor);
    }

    pub fn send_frame<T, F>(
        &self,
        output: &Output,
        time: T,
        throttle: Option<Duration>,
        primary_scan_out_output: F,
    ) where
        T: Into<Duration>,
        F: FnMut(&WlSurface, &WlSurfaceData) -> Option<Output> + Copy,
    {
        self.0
            .send_frame(output, time, throttle, primary_scan_out_output)
    }

    pub fn send_dmabuf_feedback<'a, P, F>(
        &self,
        output: &Output,
        primary_scan_out_output: P,
        select_dmabuf_feedback: F,
    ) where
        P: FnMut(&WlSurface, &WlSurfaceData) -> Option<Output> + Copy,
        F: Fn(&WlSurface, &WlSurfaceData) -> &'a DmabufFeedback + Copy,
    {
        self.0
            .send_dmabuf_feedback(output, primary_scan_out_output, select_dmabuf_feedback)
    }

    pub fn take_presentation_feedback<F1, F2>(
        &self,
        output_feedback: &mut OutputPresentationFeedback,
        primary_scan_out_output: F1,
        presentation_feedback_flags: F2,
    ) where
        F1: FnMut(&WlSurface, &WlSurfaceData) -> Option<Output> + Copy,
        F2: FnMut(&WlSurface, &WlSurfaceData) -> wp_presentation_feedback::Kind + Copy,
    {
        self.0.take_presentation_feedback(
            output_feedback,
            primary_scan_out_output,
            presentation_feedback_flags,
        )
    }

    #[inline]
    pub fn is_wayland(&self) -> bool {
        self.0.is_wayland()
    }

    #[inline]
    pub fn wl_surface(&self) -> Option<Cow<'_, WlSurface>> {
        self.0.wl_surface()
    }

    #[inline]
    pub fn user_data(&self) -> &UserDataMap {
        self.0.user_data()
    }
}

impl IsAlive for WindowElement {
    #[inline]
    fn alive(&self) -> bool {
        self.0.alive()
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct SSD(WindowElement);

impl IsAlive for SSD {
    #[inline]
    fn alive(&self) -> bool {
        self.0.alive()
    }
}

impl WaylandFocus for SSD {
    #[inline]
    fn wl_surface(&self) -> Option<Cow<'_, WlSurface>> {
        self.0.wl_surface()
    }
}

impl<BackendData: Backend> PointerTarget<KestrelState<BackendData>> for SSD {
    fn enter(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        event: &MotionEvent,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state.header_bar.pointer_enter(event.location);
        }
    }
    fn motion(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        event: &MotionEvent,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state.header_bar.pointer_enter(event.location);
        }
    }
    fn relative_motion(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &RelativeMotionEvent,
    ) {
    }
    fn button(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &ButtonEvent,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state
                .header_bar
                .clicked(seat, data, &self.0, event.serial, event.state);
        }
    }
    fn axis(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _frame: AxisFrame,
    ) {
    }
    fn frame(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
    ) {
    }
    fn leave(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _serial: Serial,
        _time: InputTime,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state.header_bar.pointer_leave();
        }
    }
    fn gesture_swipe_begin(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &GestureSwipeBeginEvent,
    ) {
    }
    fn gesture_swipe_update(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &GestureSwipeUpdateEvent,
    ) {
    }
    fn gesture_swipe_end(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &GestureSwipeEndEvent,
    ) {
    }
    fn gesture_pinch_begin(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &GesturePinchBeginEvent,
    ) {
    }
    fn gesture_pinch_update(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &GesturePinchUpdateEvent,
    ) {
    }
    fn gesture_pinch_end(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &GesturePinchEndEvent,
    ) {
    }
    fn gesture_hold_begin(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &GestureHoldBeginEvent,
    ) {
    }
    fn gesture_hold_end(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &GestureHoldEndEvent,
    ) {
    }
}

impl<BackendData: Backend> TouchTarget<KestrelState<BackendData>> for SSD {
    fn down(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        event: &smithay::input::touch::DownEvent,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state.header_bar.pointer_enter(event.location);
            state
                .header_bar
                .touch_down(seat, data, &self.0, event.serial);
        }
    }

    fn up(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        _event: &smithay::input::touch::UpEvent,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state.header_bar.touch_up(data, &self.0);
        }
    }

    fn motion(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        event: &smithay::input::touch::MotionEvent,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state.header_bar.pointer_enter(event.location);
        }
    }

    fn frame(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _marker: FrameMarker,
    ) {
    }

    fn cancel(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _marker: FrameMarker,
    ) {
    }

    fn shape(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &smithay::input::touch::ShapeEvent,
    ) {
    }

    fn orientation(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _event: &smithay::input::touch::OrientationEvent,
    ) {
    }

    fn last_frame(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
    ) -> Option<FrameMarker> {
        // It would be more correct to store the marker on frame and cancel,
        // but since we're ignoring those anyway, no need for the added complexity.
        None
    }
}

impl<BackendData: Backend> TabletToolTarget<KestrelState<BackendData>> for SSD {
    fn proximity_in(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        _tablet: &smithay::input::tablet::Tablet,
        _serial: Serial,
    ) {
    }

    fn proximity_out(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state.header_bar.pointer_leave();
        }
    }

    fn down(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        _tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        event: &smithay::input::tablet::tool::DownEvent,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state
                .header_bar
                .touch_down(seat, data, &self.0, event.serial);
        }
    }

    fn up(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        _tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        _event: &smithay::input::tablet::tool::UpEvent,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state.header_bar.touch_up(data, &self.0);
        }
    }

    fn motion(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        event: &smithay::input::tablet::tool::MotionEvent,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state.header_bar.pointer_enter(event.location);
        }
    }

    fn button(
        &self,
        seat: &Seat<KestrelState<BackendData>>,
        data: &mut KestrelState<BackendData>,
        _tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        event: &smithay::input::tablet::tool::ButtonEvent,
    ) {
        let mut state = self.0.decoration_state();
        if state.is_ssd {
            state
                .header_bar
                .clicked(seat, data, &self.0, event.serial, event.state);
        }
    }

    fn axis(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        _frame: smithay::input::tablet::tool::AxisFrame,
    ) {
    }

    fn frame(
        &self,
        _seat: &Seat<KestrelState<BackendData>>,
        _data: &mut KestrelState<BackendData>,
        _tool_descriptor: &smithay::backend::input::TabletToolDescriptor,
        _time: InputTime,
    ) {
    }
}

impl SpaceElement for WindowElement {
    fn geometry(&self) -> Rectangle<i32, Logical> {
        let mut geo = SpaceElement::geometry(&self.0);
        if self.decoration_state().is_ssd {
            geo.size.h += HEADER_BAR_HEIGHT;
        }
        geo
    }
    fn bbox(&self) -> Rectangle<i32, Logical> {
        let mut bbox = SpaceElement::bbox(&self.0);
        if self.decoration_state().is_ssd {
            bbox.size.h += HEADER_BAR_HEIGHT;
        }
        bbox
    }
    fn is_in_input_region(&self, point: &Point<f64, Logical>) -> bool {
        if self.decoration_state().is_ssd {
            let mut size = SpaceElement::geometry(&self.0).size.to_f64();
            size.h += HEADER_BAR_HEIGHT as f64;
            if !point_in_rounded_window(*point, size) {
                return false;
            }
            point.y < HEADER_BAR_HEIGHT as f64
                || SpaceElement::is_in_input_region(
                    &self.0,
                    &(*point - Point::from((0.0, HEADER_BAR_HEIGHT as f64))),
                )
        } else {
            SpaceElement::is_in_input_region(&self.0, point)
        }
    }
    fn z_index(&self) -> u8 {
        SpaceElement::z_index(&self.0)
    }

    fn set_activate(&self, activated: bool) {
        SpaceElement::set_activate(&self.0, activated);
    }
    fn output_enter(&self, output: &Output, overlap: Rectangle<i32, Logical>) {
        SpaceElement::output_enter(&self.0, output, overlap);
    }
    fn output_leave(&self, output: &Output) {
        SpaceElement::output_leave(&self.0, output);
    }
    #[profiling::function]
    fn refresh(&self) {
        SpaceElement::refresh(&self.0);
    }
}

fn point_in_rounded_window(
    point: Point<f64, Logical>,
    size: smithay::utils::Size<f64, Logical>,
) -> bool {
    if point.x < 0.0 || point.y < 0.0 || point.x >= size.w || point.y >= size.h {
        return false;
    }
    let radius = WINDOW_CORNER_RADIUS;
    let corner_center = match (
        point.x < radius,
        point.x > size.w - radius,
        point.y < radius,
        point.y > size.h - radius,
    ) {
        (true, _, true, _) => Some((radius, radius)),
        (_, true, true, _) => Some((size.w - radius, radius)),
        (true, _, _, true) => Some((radius, size.h - radius)),
        (_, true, _, true) => Some((size.w - radius, size.h - radius)),
        _ => None,
    };
    corner_center.is_none_or(|(center_x, center_y)| {
        (point.x - center_x).powi(2) + (point.y - center_y).powi(2) <= radius.powi(2)
    })
}

render_elements!(
    pub WindowRenderElement<R> where R: ImportAll + ImportMem + RoundedRenderer + BlurRenderer;
    Window=WaylandSurfaceRenderElement<R>,
    Rounded=RoundedSurfaceRenderElement<R>,
    Decoration=MemoryRenderBufferRenderElement<R>,
    Blur=BlurRenderElement<R>,
);

impl<R: Renderer + RoundedRenderer + BlurRenderer> std::fmt::Debug for WindowRenderElement<R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Window(arg0) => f.debug_tuple("Window").field(arg0).finish(),
            Self::Rounded(arg0) => f.debug_tuple("Rounded").field(arg0).finish(),
            Self::Decoration(arg0) => f.debug_tuple("Decoration").field(arg0).finish(),
            Self::Blur(arg0) => f.debug_tuple("Blur").field(arg0).finish(),
            Self::_GenericCatcher(arg0) => f.debug_tuple("_GenericCatcher").field(arg0).finish(),
        }
    }
}

impl<R> AsRenderElements<R> for WindowElement
where
    R: Renderer + ImportAll + ImportMem + RoundedRenderer + BlurRenderer,
    R::TextureId: Send + Clone + Texture + 'static,
{
    type RenderElement = WindowRenderElement<R>;

    fn render_elements<C: From<Self::RenderElement>>(
        &self,
        renderer: &mut R,
        mut location: Point<i32, Physical>,
        scale: Scale<f64>,
        alpha: f32,
    ) -> Vec<C> {
        let window_bbox = SpaceElement::bbox(&self.0);

        if self.decoration_state().is_ssd && !window_bbox.is_empty() {
            let window_geo = SpaceElement::geometry(&self.0);

            let mut state = self.decoration_state();
            let width = window_geo.size.w;
            state.header_bar.redraw(width as u32);
            let mut vec = AsRenderElements::<R>::render_elements::<WindowRenderElement<R>>(
                &state.header_bar,
                renderer,
                location,
                scale,
                alpha,
            );
            if let Some(header) = vec.first() {
                let geometry = header.geometry(scale);
                vec.push(WindowRenderElement::Blur(
                    BlurElement::from_geometry(
                        header.id().clone(),
                        geometry,
                        rounded_top_regions(geometry.size, scale),
                    )
                    .into(),
                ));
            }

            location.y += (scale.y * HEADER_BAR_HEIGHT as f64) as i32;
            let clip_geometry = Rectangle::new(
                location.to_f64().to_logical(scale),
                window_geo.size.to_f64(),
            );
            let program = R::rounded_program(renderer).ok();
            let window_elements = AsRenderElements::<R>::render_elements::<
                WaylandSurfaceRenderElement<R>,
            >(&self.0, renderer, location, scale, alpha);
            vec.extend(window_elements.into_iter().map(|element| {
                if let Some(program) = &program {
                    WindowRenderElement::Rounded(RoundedSurfaceRenderElement::new(
                        element,
                        program.clone(),
                        clip_geometry,
                        [
                            0.0,
                            0.0,
                            WINDOW_CORNER_RADIUS as f32,
                            WINDOW_CORNER_RADIUS as f32,
                        ],
                        scale,
                    ))
                } else {
                    WindowRenderElement::Window(element)
                }
            }));
            vec.into_iter().map(C::from).collect()
        } else {
            AsRenderElements::render_elements(&self.0, renderer, location, scale, alpha)
                .into_iter()
                .map(C::from)
                .collect()
        }
    }
}

fn rounded_top_regions(
    size: smithay::utils::Size<i32, Physical>,
    scale: Scale<f64>,
) -> Vec<Rectangle<i32, Physical>> {
    let radius = (WINDOW_CORNER_RADIUS * scale.x).round() as i32;
    let mut regions = Vec::with_capacity(radius.max(1) as usize + 1);
    for y in 0..radius.min(size.h) {
        let sample_y = y as f64 + 0.5;
        let distance_y = radius as f64 - sample_y;
        let inset = (radius as f64
            - (radius as f64 * radius as f64 - distance_y * distance_y).sqrt())
        .ceil() as i32;
        let width = size.w - inset * 2;
        if width > 0 {
            regions.push(Rectangle::new((inset, y).into(), (width, 1).into()));
        }
    }
    if size.h > radius {
        regions.push(Rectangle::new(
            (0, radius).into(),
            (size.w, size.h - radius).into(),
        ));
    }
    regions
}
