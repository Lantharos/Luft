use std::sync::{
    atomic::{AtomicBool, Ordering},
    Mutex, OnceLock,
};

use gtk::prelude::*;
use tauri::{WebviewWindow, WindowEvent};
use wayland_client::{
    backend::{Backend, ObjectId},
    delegate_noop,
    globals::{registry_queue_init, GlobalListContents},
    protocol::{
        wl_compositor::WlCompositor, wl_region::WlRegion, wl_registry, wl_surface::WlSurface,
    },
    Connection, Dispatch, EventQueue, Proxy, QueueHandle,
};
use wayland_protocols::ext::background_effect::v1::client::{
    ext_background_effect_manager_v1::{
        Capability, Event as BackgroundEffectManagerEvent, ExtBackgroundEffectManagerV1,
    },
    ext_background_effect_surface_v1::ExtBackgroundEffectSurfaceV1,
};

const SIDEBAR_WIDTH: f64 = 268.0;
const WINDOW_RADIUS: i32 = 16;
const SURFACE_RED: f64 = 18.0 / 255.0;
const SURFACE_GREEN: f64 = 18.0 / 255.0;
const SURFACE_BLUE: f64 = 17.0 / 255.0;

static BACKGROUND_EFFECT: OnceLock<Mutex<Option<WaylandBackgroundEffect>>> = OnceLock::new();
static BLUR_AVAILABLE: AtomicBool = AtomicBool::new(false);
static MAP_HANDLER_INSTALLED: AtomicBool = AtomicBool::new(false);
static DRAW_HANDLER_INSTALLED: AtomicBool = AtomicBool::new(false);

#[derive(Default)]
struct BackgroundEffectState {
    blur_available: bool,
}

struct WaylandBackgroundEffect {
    connection: Connection,
    _event_queue: EventQueue<BackgroundEffectState>,
    queue_handle: QueueHandle<BackgroundEffectState>,
    _manager: ExtBackgroundEffectManagerV1,
    compositor: WlCompositor,
    surface: WlSurface,
    effect: ExtBackgroundEffectSurfaceV1,
}

pub fn install(window: &WebviewWindow) {
    configure_surface(window, false);
    refresh(window);
    install_resize_handler(window);
}

pub fn available() -> bool {
    BLUR_AVAILABLE.load(Ordering::SeqCst)
}

fn install_resize_handler(window: &WebviewWindow) {
    let window_for_event = window.clone();
    window.on_window_event(move |event| {
        if matches!(event, WindowEvent::Resized(_)) {
            refresh(&window_for_event);
        }
    });
}

fn refresh(window: &WebviewWindow) {
    let blur_available = apply_blur(window);
    configure_surface(window, blur_available);
    BLUR_AVAILABLE.store(blur_available, Ordering::SeqCst);
}

fn apply_blur(window: &WebviewWindow) -> bool {
    let size = match window.inner_size() {
        Ok(size) => size,
        Err(_) => return false,
    };
    if size.width == 0 || size.height == 0 {
        return false;
    }

    let sidebar_width = SIDEBAR_WIDTH.round().max(1.0) as i32;
    let height = size.height.min(i32::MAX as u32) as i32;
    let Ok(mut effect) = BACKGROUND_EFFECT.get_or_init(|| Mutex::new(None)).lock() else {
        return false;
    };

    if let Some(background_effect) = effect.as_ref() {
        if background_effect
            .apply_region(sidebar_width, height)
            .is_ok()
        {
            return true;
        }
    }

    let surface_info = match WaylandSurfaceInfo::from_window(window) {
        Ok(surface_info) => surface_info,
        Err(_) => return effect.is_some(),
    };

    match WaylandBackgroundEffect::new(surface_info, sidebar_width, height) {
        Ok(background_effect) => {
            *effect = Some(background_effect);
            true
        }
        Err(_) => {
            *effect = None;
            false
        }
    }
}

fn configure_surface(window: &WebviewWindow, translucent: bool) {
    if let Ok(gtk_window) = window.gtk_window() {
        install_clear_draw_handler(&gtk_window);
        install_map_handler(window, &gtk_window);
        gtk_window.set_app_paintable(true);
        gtk_window.set_opacity(1.0);
        if let Some(screen) = gtk::prelude::GtkWindowExt::screen(&gtk_window) {
            gtk_window.set_visual(screen.rgba_visual().as_ref());
        }
        if let Some(gdk_window) = gtk_window.window() {
            gdk_window.set_opaque_region(None);
        }
        apply_window_region(&gtk_window);
        gtk_window.queue_draw();
    }

    if let Ok(vbox) = window.default_vbox() {
        vbox.set_app_paintable(true);
        vbox.queue_draw();
    }

    set_webview_background(window, translucent);
}

fn install_map_handler(window: &WebviewWindow, gtk_window: &gtk::ApplicationWindow) {
    if MAP_HANDLER_INSTALLED.swap(true, Ordering::SeqCst) {
        return;
    }

    let window = window.clone();
    gtk_window.connect_map_event(move |_, _| {
        let window = window.clone();
        gtk::glib::idle_add_local_once(move || {
            refresh(&window);
        });
        gtk::glib::Propagation::Proceed
    });
}

fn install_clear_draw_handler(window: &gtk::ApplicationWindow) {
    if DRAW_HANDLER_INSTALLED.swap(true, Ordering::SeqCst) {
        return;
    }

    window.connect_draw(|_, context| {
        context.set_operator(gtk::cairo::Operator::Clear);
        let _ = context.paint();
        context.set_operator(gtk::cairo::Operator::Over);
        gtk::glib::Propagation::Proceed
    });
}

fn apply_window_region(window: &gtk::ApplicationWindow) {
    let width = window.allocated_width();
    let height = window.allocated_height();
    if width <= 0 || height <= 0 {
        return;
    }

    let region = rounded_window_region(width, height, WINDOW_RADIUS);
    window.shape_combine_region(Some(&region));
    window.input_shape_combine_region(Some(&region));
    if let Some(gdk_window) = window.window() {
        gdk_window.shape_combine_region(Some(&region), 0, 0);
        gdk_window.input_shape_combine_region(&region, 0, 0);
    }
}

fn rounded_window_region(width: i32, height: i32, radius: i32) -> gtk::cairo::Region {
    let radius = radius.min(width / 2).min(height / 2).max(0);
    if radius == 0 {
        return gtk::cairo::Region::create_rectangle(&gtk::cairo::RectangleInt::new(
            0, 0, width, height,
        ));
    }

    let region = gtk::cairo::Region::create();
    for y in 0..height {
        let inset = rounded_row_inset(y, height, radius);
        let row_width = width - inset * 2;
        if row_width > 0 {
            let _ = region.union_rectangle(&gtk::cairo::RectangleInt::new(inset, y, row_width, 1));
        }
    }
    region
}

fn rounded_row_inset(y: i32, height: i32, radius: i32) -> i32 {
    let top = y < radius;
    let bottom = y >= height - radius;
    if !top && !bottom {
        return 0;
    }

    let center_y = if top { radius } else { height - radius - 1 };
    let dy = (y - center_y).abs() as f64;
    let radius = radius as f64;
    (radius - (radius * radius - dy * dy).max(0.0).sqrt()).ceil() as i32
}

fn set_webview_background(window: &WebviewWindow, translucent: bool) {
    use webkit2gtk::WebViewExt;

    let alpha = if translucent { 0.0 } else { 1.0 };
    let color = gtk::gdk::RGBA::new(SURFACE_RED, SURFACE_GREEN, SURFACE_BLUE, alpha);

    if let Ok(vbox) = window.default_vbox() {
        if let Some(webview) = vbox
            .children()
            .into_iter()
            .find_map(|child| child.downcast::<webkit2gtk::WebView>().ok())
        {
            webview.set_background_color(&color);
            return;
        }
    }

    let _ = window.with_webview(move |webview| {
        webview.inner().set_background_color(&color);
    });
}

struct WaylandSurfaceInfo {
    display_ptr: *mut std::ffi::c_void,
    surface_ptr: *mut std::ffi::c_void,
}

impl WaylandSurfaceInfo {
    fn from_window(window: &WebviewWindow) -> Result<Self, String> {
        let gtk_window = window.gtk_window().map_err(|error| error.to_string())?;
        let display = gtk_window.display();
        if !display.backend().is_wayland() {
            return Err(String::from("not a Wayland window"));
        }

        gtk_window.realize();
        let gdk_window = gtk_window
            .window()
            .ok_or_else(|| String::from("Wayland window surface is not realized"))?;

        let display_ptr = unsafe {
            gdk_wayland_sys::gdk_wayland_display_get_wl_display(display.as_ptr() as *mut _)
        };
        let surface_ptr = unsafe {
            gdk_wayland_sys::gdk_wayland_window_get_wl_surface(gdk_window.as_ptr() as *mut _)
        };
        if display_ptr.is_null() || surface_ptr.is_null() {
            return Err(String::from("Wayland display or surface is unavailable"));
        }

        Ok(Self {
            display_ptr,
            surface_ptr,
        })
    }
}

impl WaylandBackgroundEffect {
    fn new(surface_info: WaylandSurfaceInfo, width: i32, height: i32) -> Result<Self, String> {
        let backend = unsafe { Backend::from_foreign_display(surface_info.display_ptr.cast()) };
        let connection = Connection::from_backend(backend);
        let surface_id =
            unsafe { ObjectId::from_ptr(WlSurface::interface(), surface_info.surface_ptr.cast()) }
                .map_err(|error| error.to_string())?;
        let surface =
            WlSurface::from_id(&connection, surface_id).map_err(|error| error.to_string())?;

        let (globals, mut event_queue) = registry_queue_init::<BackgroundEffectState>(&connection)
            .map_err(|error| error.to_string())?;
        let queue_handle = event_queue.handle();
        let compositor: WlCompositor = globals
            .bind(&queue_handle, 1..=6, ())
            .map_err(|error| error.to_string())?;
        let manager: ExtBackgroundEffectManagerV1 = globals
            .bind(&queue_handle, 1..=1, ())
            .map_err(|error| error.to_string())?;
        let mut state = BackgroundEffectState::default();
        event_queue
            .roundtrip(&mut state)
            .map_err(|error| error.to_string())?;
        if !state.blur_available {
            return Err(String::from(
                "Wayland compositor does not advertise background blur",
            ));
        }

        let effect = manager.get_background_effect(&surface, &queue_handle, ());
        let background_effect = Self {
            connection,
            _event_queue: event_queue,
            queue_handle,
            _manager: manager,
            compositor,
            surface,
            effect,
        };
        background_effect.apply_region(width, height)?;

        Ok(background_effect)
    }

    fn apply_region(&self, width: i32, height: i32) -> Result<(), String> {
        if !self.effect.is_alive() || !self.surface.is_alive() {
            return Err(String::from(
                "Wayland background effect surface is no longer alive",
            ));
        }

        let region = self.compositor.create_region(&self.queue_handle, ());
        add_sidebar_region(&region, width, height);
        self.effect.set_blur_region(Some(&region));
        region.destroy();
        self.surface.commit();
        self.connection.flush().map_err(|error| error.to_string())
    }
}

impl Drop for WaylandBackgroundEffect {
    fn drop(&mut self) {
        if self.effect.is_alive() {
            self.effect.destroy();
        }
        if self.surface.is_alive() {
            self.surface.commit();
        }
        if self._manager.is_alive() {
            self._manager.destroy();
        }
        let _ = self.connection.flush();
    }
}

fn add_sidebar_region(region: &WlRegion, width: i32, height: i32) {
    if width <= 0 || height <= 0 {
        return;
    }

    for y in 0..height {
        let inset = rounded_row_inset(y, height, WINDOW_RADIUS);
        let row_width = width - inset;
        if row_width > 0 {
            region.add(inset, y, row_width, 1);
        }
    }
}

impl Dispatch<ExtBackgroundEffectManagerV1, ()> for BackgroundEffectState {
    fn event(
        state: &mut Self,
        _: &ExtBackgroundEffectManagerV1,
        event: BackgroundEffectManagerEvent,
        _: &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let BackgroundEffectManagerEvent::Capabilities { flags } = event {
            state.blur_available = flags
                .into_result()
                .is_ok_and(|flags| flags.contains(Capability::Blur));
        }
    }
}

impl Dispatch<wl_registry::WlRegistry, GlobalListContents> for BackgroundEffectState {
    fn event(
        _: &mut Self,
        _: &wl_registry::WlRegistry,
        _: <wl_registry::WlRegistry as Proxy>::Event,
        _: &GlobalListContents,
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
    }
}

impl Dispatch<WlCompositor, ()> for BackgroundEffectState {
    fn event(
        _: &mut Self,
        _: &WlCompositor,
        _: <WlCompositor as Proxy>::Event,
        _: &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
    }
}

delegate_noop!(BackgroundEffectState: ignore WlSurface);
delegate_noop!(BackgroundEffectState: ignore WlRegion);
delegate_noop!(BackgroundEffectState: ignore ExtBackgroundEffectSurfaceV1);
