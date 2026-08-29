use std::cell::{RefCell, RefMut};

use smithay::{
    backend::{
        allocator::Fourcc,
        input::ButtonState,
        renderer::{
            ImportMem, Renderer,
            element::{
                AsRenderElements, Kind,
                memory::{MemoryRenderBuffer, MemoryRenderBufferRenderElement},
            },
        },
    },
    desktop::WindowSurface,
    input::Seat,
    utils::{Logical, Point, Rectangle, Serial, Transform},
    wayland::shell::xdg::XdgShellHandler,
};

use crate::{KestrelState, state::Backend};

use super::WindowElement;

pub struct WindowState {
    pub is_ssd: bool,
    pub header_bar: HeaderBar,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum HeaderButton {
    Minimize,
    Maximize,
    Close,
}

#[derive(Debug, Clone)]
pub struct HeaderBar {
    pointer_loc: Option<Point<f64, Logical>>,
    width: u32,
    hovered_button: Option<HeaderButton>,
    buffer: MemoryRenderBuffer,
}

pub const HEADER_BAR_HEIGHT: i32 = 40;
pub const WINDOW_CORNER_RADIUS: f64 = 14.0;

const BUTTON_SLOT_WIDTH: u32 = 36;
const BUTTON_COUNT: u32 = 3;
const BUTTONS_RIGHT_PADDING: u32 = 6;
const BUTTON_RADIUS: f32 = 6.5;

impl HeaderBar {
    pub fn pointer_enter(&mut self, loc: Point<f64, Logical>) {
        self.pointer_loc = Some(loc);
    }

    pub fn pointer_leave(&mut self) {
        self.pointer_loc = None;
    }

    pub fn clicked<BackendData: Backend>(
        &mut self,
        seat: &Seat<KestrelState<BackendData>>,
        state: &mut KestrelState<BackendData>,
        window: &WindowElement,
        serial: Serial,
        button_state: ButtonState,
    ) {
        if button_state != ButtonState::Pressed {
            return;
        }

        match self.button_at_pointer() {
            Some(button) => self.activate(button, state, window),
            None if self.pointer_loc.is_some() => {
                let WindowSurface::Wayland(toplevel) = window.0.underlying_surface();
                let seat = seat.clone();
                let toplevel = toplevel.clone();
                state
                    .handle
                    .insert_idle(move |data| data.move_request_xdg(&toplevel, &seat, serial));
            }
            None => {}
        }
    }

    pub fn touch_down<BackendData: Backend>(
        &mut self,
        seat: &Seat<KestrelState<BackendData>>,
        state: &mut KestrelState<BackendData>,
        window: &WindowElement,
        serial: Serial,
    ) {
        if self.button_at_pointer().is_none() && self.pointer_loc.is_some() {
            let WindowSurface::Wayland(toplevel) = window.0.underlying_surface();
            let seat = seat.clone();
            let toplevel = toplevel.clone();
            state
                .handle
                .insert_idle(move |data| data.move_request_xdg(&toplevel, &seat, serial));
        }
    }

    pub fn touch_up<BackendData: Backend>(
        &mut self,
        state: &mut KestrelState<BackendData>,
        window: &WindowElement,
    ) {
        if let Some(button) = self.button_at_pointer() {
            self.activate(button, state, window);
        }
    }

    fn activate<BackendData: Backend>(
        &self,
        button: HeaderButton,
        state: &mut KestrelState<BackendData>,
        window: &WindowElement,
    ) {
        let WindowSurface::Wayland(toplevel) = window.0.underlying_surface();
        let window_id = state
            .windows
            .iter()
            .find_map(|(id, candidate)| (candidate == window).then_some(*id));
        match button {
            HeaderButton::Close => toplevel.send_close(),
            HeaderButton::Maximize => {
                if let Some(id) = window_id {
                    let _ = state.toggle_maximize(id);
                } else {
                    state.maximize_request(toplevel.clone());
                }
            }
            HeaderButton::Minimize => {
                if let Some(id) = window_id {
                    let _ = state.minimize_window(id);
                }
            }
        }
    }

    fn button_at_pointer(&self) -> Option<HeaderButton> {
        let x = self.pointer_loc?.x;
        let buttons_start = self
            .width
            .saturating_sub(BUTTONS_RIGHT_PADDING + BUTTON_SLOT_WIDTH * BUTTON_COUNT);
        if x < buttons_start as f64 || x >= self.width.saturating_sub(BUTTONS_RIGHT_PADDING) as f64
        {
            return None;
        }

        match ((x as u32 - buttons_start) / BUTTON_SLOT_WIDTH).min(BUTTON_COUNT - 1) {
            0 => Some(HeaderButton::Minimize),
            1 => Some(HeaderButton::Maximize),
            _ => Some(HeaderButton::Close),
        }
    }

    pub fn redraw(&mut self, width: u32) {
        if width == 0 {
            self.width = 0;
            return;
        }

        let hovered_button = self.button_at_pointer();
        if self.width == width && self.hovered_button == hovered_button {
            return;
        }

        self.width = width;
        self.hovered_button = self.button_at_pointer();
        let hovered_button = self.hovered_button;
        let mut context = self.buffer.render();
        context.resize((width as i32, HEADER_BAR_HEIGHT));
        context.update_opaque_regions(None);
        context
            .draw(|pixels| {
                draw_header(pixels, width, hovered_button);
                Result::<_, std::convert::Infallible>::Ok(vec![Rectangle::from_size(
                    (width as i32, HEADER_BAR_HEIGHT).into(),
                )])
            })
            .unwrap();
    }
}

impl<R> AsRenderElements<R> for HeaderBar
where
    R: Renderer + ImportMem,
    R::TextureId: Send + Clone + 'static,
{
    type RenderElement = MemoryRenderBufferRenderElement<R>;

    fn render_elements<C: From<Self::RenderElement>>(
        &self,
        renderer: &mut R,
        location: Point<i32, smithay::utils::Physical>,
        _scale: smithay::utils::Scale<f64>,
        alpha: f32,
    ) -> Vec<C> {
        MemoryRenderBufferRenderElement::from_buffer(
            renderer,
            location.to_f64(),
            &self.buffer,
            Some(alpha),
            None,
            None,
            Kind::Unspecified,
        )
        .ok()
        .into_iter()
        .map(Into::into)
        .collect()
    }
}

fn draw_header(pixels: &mut [u8], width: u32, hovered_button: Option<HeaderButton>) {
    for y in 0..HEADER_BAR_HEIGHT as u32 {
        for x in 0..width {
            let coverage = top_rounded_coverage(x as f32 + 0.5, y as f32 + 0.5, width as f32);
            let mut color = [0.105, 0.102, 0.095, 0.76 * coverage];
            if y == HEADER_BAR_HEIGHT as u32 - 1 {
                color = over([1.0, 1.0, 1.0, 0.10 * coverage], color);
            }

            for (index, button) in [
                HeaderButton::Minimize,
                HeaderButton::Maximize,
                HeaderButton::Close,
            ]
            .into_iter()
            .enumerate()
            {
                let center_x = width as f32
                    - BUTTONS_RIGHT_PADDING as f32
                    - BUTTON_SLOT_WIDTH as f32 * (BUTTON_COUNT as f32 - index as f32 - 0.5);
                let center_y = HEADER_BAR_HEIGHT as f32 / 2.0;
                let distance = ((x as f32 + 0.5 - center_x).powi(2)
                    + (y as f32 + 0.5 - center_y).powi(2))
                .sqrt();
                let circle_coverage = (BUTTON_RADIUS + 0.5 - distance).clamp(0.0, 1.0);
                let hovered = hovered_button == Some(button);
                let rgb = if hovered {
                    match button {
                        HeaderButton::Minimize => [1.0, 0.74, 0.18],
                        HeaderButton::Maximize => [0.16, 0.78, 0.25],
                        HeaderButton::Close => [1.0, 0.37, 0.34],
                    }
                } else {
                    [0.47, 0.47, 0.46]
                };
                color = over(
                    [rgb[0], rgb[1], rgb[2], 0.92 * circle_coverage * coverage],
                    color,
                );

                if hovered {
                    let icon_coverage =
                        icon_coverage(button, x as f32 + 0.5 - center_x, y as f32 + 0.5 - center_y);
                    color = over([0.12, 0.11, 0.10, icon_coverage * coverage], color);
                }
            }

            let offset = ((y * width + x) * 4) as usize;
            let alpha = color[3].clamp(0.0, 1.0);
            pixels[offset] = (color[2] * alpha * 255.0).round() as u8;
            pixels[offset + 1] = (color[1] * alpha * 255.0).round() as u8;
            pixels[offset + 2] = (color[0] * alpha * 255.0).round() as u8;
            pixels[offset + 3] = (alpha * 255.0).round() as u8;
        }
    }
}

fn top_rounded_coverage(x: f32, y: f32, width: f32) -> f32 {
    let radius = WINDOW_CORNER_RADIUS as f32;
    let center_x = if x < radius {
        radius
    } else if x > width - radius {
        width - radius
    } else {
        return 1.0;
    };
    if y >= radius {
        return 1.0;
    }
    let distance = ((x - center_x).powi(2) + (y - radius).powi(2)).sqrt();
    (radius + 0.5 - distance).clamp(0.0, 1.0)
}

fn icon_coverage(button: HeaderButton, x: f32, y: f32) -> f32 {
    match button {
        HeaderButton::Minimize => line_coverage(x, y, -2.4, 0.0, 2.4, 0.0),
        HeaderButton::Maximize => {
            let first = line_coverage(x, y, -2.2, 1.7, 1.7, -2.2);
            let second = line_coverage(x, y, -0.2, -2.2, 1.7, -2.2)
                .max(line_coverage(x, y, 1.7, -2.2, 1.7, -0.2));
            first.max(second)
        }
        HeaderButton::Close => {
            line_coverage(x, y, -2.0, -2.0, 2.0, 2.0).max(line_coverage(x, y, -2.0, 2.0, 2.0, -2.0))
        }
    }
}

fn line_coverage(x: f32, y: f32, ax: f32, ay: f32, bx: f32, by: f32) -> f32 {
    let ab_x = bx - ax;
    let ab_y = by - ay;
    let t = (((x - ax) * ab_x + (y - ay) * ab_y) / (ab_x * ab_x + ab_y * ab_y)).clamp(0.0, 1.0);
    let distance = ((x - (ax + ab_x * t)).powi(2) + (y - (ay + ab_y * t)).powi(2)).sqrt();
    (1.15 - distance).clamp(0.0, 1.0)
}

fn over(foreground: [f32; 4], background: [f32; 4]) -> [f32; 4] {
    let alpha = foreground[3] + background[3] * (1.0 - foreground[3]);
    if alpha <= f32::EPSILON {
        return [0.0; 4];
    }
    [
        (foreground[0] * foreground[3] + background[0] * background[3] * (1.0 - foreground[3]))
            / alpha,
        (foreground[1] * foreground[3] + background[1] * background[3] * (1.0 - foreground[3]))
            / alpha,
        (foreground[2] * foreground[3] + background[2] * background[3] * (1.0 - foreground[3]))
            / alpha,
        alpha,
    ]
}

impl WindowElement {
    pub fn decoration_state(&self) -> RefMut<'_, WindowState> {
        self.user_data().insert_if_missing(|| {
            RefCell::new(WindowState {
                is_ssd: true,
                header_bar: HeaderBar {
                    pointer_loc: None,
                    width: 0,
                    hovered_button: None,
                    buffer: MemoryRenderBuffer::new(
                        Fourcc::Argb8888,
                        (1, HEADER_BAR_HEIGHT),
                        1,
                        Transform::Normal,
                        None,
                    ),
                },
            })
        });

        self.user_data()
            .get::<RefCell<WindowState>>()
            .unwrap()
            .borrow_mut()
    }

    pub fn set_ssd(&self, ssd: bool) {
        self.decoration_state().is_ssd = ssd;
    }
}
