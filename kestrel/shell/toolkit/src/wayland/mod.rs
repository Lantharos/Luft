mod dispatch;
mod protocols;
mod window;

use std::os::fd::{AsFd, BorrowedFd};
use std::time::Duration;

use wayland_client::globals::{GlobalList, registry_queue_init};
use wayland_client::protocol::{
    wl_compositor::WlCompositor, wl_keyboard::WlKeyboard, wl_pointer::WlPointer, wl_seat::WlSeat,
};
use wayland_client::{Connection, EventQueue, QueueHandle};
use wayland_protocols::ext::background_effect::v1::client::ext_background_effect_manager_v1::ExtBackgroundEffectManagerV1;
use wayland_protocols::wp::cursor_shape::v1::client::wp_cursor_shape_device_v1::WpCursorShapeDeviceV1;
use wayland_protocols::wp::cursor_shape::v1::client::wp_cursor_shape_manager_v1::WpCursorShapeManagerV1;
use wayland_protocols::wp::fractional_scale::v1::client::wp_fractional_scale_manager_v1::WpFractionalScaleManagerV1;
use wayland_protocols::wp::presentation_time::client::wp_presentation::WpPresentation;
use wayland_protocols::wp::viewporter::client::wp_viewporter::WpViewporter;
use wayland_protocols::xdg::shell::client::xdg_wm_base::XdgWmBase;

use protocols::glass::kestrel_glass_manager_v1::KestrelGlassManagerV1;
use protocols::window::kestrel_window_manager_v1::KestrelWindowManagerV1;
pub use window::Window;

/// What the compositor told a surface since the last look.
pub enum Event {
    Configured { active: bool },
    CloseRequested,
    Scale(f32),
    PointerMoved(f32, f32),
    PointerLeft,
    Pressed,
    Released,
    Key { code: u32 },
    FrameDone,
    Presented(Duration),
}

pub(crate) struct State {
    pub events: Vec<Event>,
    pointer: Option<WlPointer>,
    keyboard: Option<WlKeyboard>,
    cursor_shapes: Option<WpCursorShapeManagerV1>,
    cursor: Option<WpCursorShapeDeviceV1>,
    active: bool,
}

pub(crate) struct Globals {
    pub compositor: WlCompositor,
    pub shell: XdgWmBase,
    pub viewporter: WpViewporter,
    pub scales: Option<WpFractionalScaleManagerV1>,
    pub effects: Option<ExtBackgroundEffectManagerV1>,
    pub windows: Option<KestrelWindowManagerV1>,
    pub glass: Option<KestrelGlassManagerV1>,
    pub presentation: Option<WpPresentation>,
}

/// The connection to Kestrel and what it offers.
pub struct Wayland {
    pub(crate) connection: Connection,
    queue: EventQueue<State>,
    pub(crate) handle: QueueHandle<State>,
    pub(crate) globals: Globals,
    state: State,
}

impl Wayland {
    pub fn connect() -> Self {
        let connection = Connection::connect_to_env().expect("a Wayland display");
        let (list, queue): (GlobalList, EventQueue<State>) =
            registry_queue_init(&connection).expect("the display's globals");
        let handle = queue.handle();
        let _: WlSeat = list.bind(&handle, 5..=9, ()).expect("a seat");
        let globals = Globals {
            compositor: list.bind(&handle, 4..=6, ()).expect("wl_compositor"),
            shell: list.bind(&handle, 2..=6, ()).expect("xdg_wm_base"),
            viewporter: list.bind(&handle, 1..=1, ()).expect("wp_viewporter"),
            scales: list.bind(&handle, 1..=1, ()).ok(),
            effects: list.bind(&handle, 1..=1, ()).ok(),
            windows: list.bind(&handle, 3..=3, ()).ok(),
            glass: list.bind(&handle, 1..=1, ()).ok(),
            presentation: list.bind(&handle, 1..=2, ()).ok(),
        };
        let state = State {
            events: Vec::new(),
            pointer: None,
            keyboard: None,
            cursor_shapes: list.bind(&handle, 1..=2, ()).ok(),
            cursor: None,
            active: false,
        };
        Self {
            connection,
            queue,
            handle,
            globals,
            state,
        }
    }

    pub fn fd(&self) -> BorrowedFd<'_> {
        self.connection.as_fd()
    }

    /// Sends what is waiting, lets `wait` sleep until something happens when
    /// nothing has arrived yet, reads the display when `wait` says it has
    /// something, and hands over the events.
    pub fn exchange(&mut self, wait: impl FnOnce() -> bool) -> Vec<Event> {
        self.flush();
        self.queue
            .dispatch_pending(&mut self.state)
            .expect("the display's events");
        if self.state.events.is_empty()
            && let Some(read) = self.queue.prepare_read()
        {
            if wait() {
                read.read().expect("the display's events");
            }
            self.queue
                .dispatch_pending(&mut self.state)
                .expect("the display's events");
        }
        std::mem::take(&mut self.state.events)
    }

    pub fn flush(&self) {
        self.connection
            .flush()
            .expect("a display that takes requests");
    }
}
