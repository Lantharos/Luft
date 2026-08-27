use smithay::{
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    utils::{Logical, Point},
    wayland::{
        compositor,
        shell::xdg::{ToplevelSurface, XdgToplevelSurfaceData},
    },
};

#[derive(Debug)]
pub struct DndIcon {
    pub surface: WlSurface,
    pub offset: Point<i32, Logical>,
}

#[derive(Clone)]
pub struct ClientGrabSerial {
    pub(super) surface: ToplevelSurface,
}

#[derive(Clone, Copy, Debug)]
pub enum WindowGrabKind {
    Move,
    Resize { edge: crate::window::ResizeEdge },
}

#[derive(Clone, Copy, Debug)]
pub struct WindowGrabMeta {
    pub kind: WindowGrabKind,
    pub forward_button_release: bool,
}

#[derive(Clone)]
pub struct PendingWindowDrag {
    pub surface: ToplevelSurface,
    pub pointer_start: Point<f64, Logical>,
    pub serial: smithay::utils::Serial,
    pub button: u32,
}

#[derive(Debug, Default)]
pub(super) struct ToplevelMetadata {
    pub title: String,
    pub app_id: String,
}

pub(super) fn toplevel_metadata(surface: &ToplevelSurface) -> ToplevelMetadata {
    compositor::with_states(surface.wl_surface(), |states| {
        let Some(data) = states.data_map.get::<XdgToplevelSurfaceData>() else {
            return ToplevelMetadata::default();
        };
        let role = data.lock().unwrap();
        ToplevelMetadata {
            title: role.title.clone().unwrap_or_default(),
            app_id: role.app_id.clone().unwrap_or_default(),
        }
    })
}
