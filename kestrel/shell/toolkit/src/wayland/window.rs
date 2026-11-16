use std::ffi::c_void;
use std::ptr::NonNull;

use raw_window_handle::{
    RawDisplayHandle, RawWindowHandle, WaylandDisplayHandle, WaylandWindowHandle,
};
use wayland_client::Proxy;
use wayland_client::protocol::wl_surface::WlSurface;
use wayland_protocols::ext::background_effect::v1::client::ext_background_effect_surface_v1::ExtBackgroundEffectSurfaceV1;
use wayland_protocols::wp::fractional_scale::v1::client::wp_fractional_scale_v1::WpFractionalScaleV1;
use wayland_protocols::wp::viewporter::client::wp_viewport::WpViewport;
use wayland_protocols::xdg::shell::client::{xdg_surface::XdgSurface, xdg_toplevel::XdgToplevel};

use super::Wayland;
use super::protocols::glass::kestrel_glass_v1::{KestrelGlassV1, Role};
use super::protocols::window::kestrel_window_state_v1::KestrelWindowStateV1;

/// A surface of the shell: a toplevel handed to Kestrel, which places it,
/// shows and hides it and keeps it above windows, with glass behind all of it.
pub struct Window {
    surface: WlSurface,
    role: XdgSurface,
    toplevel: XdgToplevel,
    viewport: WpViewport,
    scale: Option<WpFractionalScaleV1>,
    effect: Option<ExtBackgroundEffectSurfaceV1>,
    placement: Option<KestrelWindowStateV1>,
    glass: Option<KestrelGlassV1>,
}

impl Window {
    pub fn open(wayland: &Wayland, app_id: &str) -> Self {
        let (globals, handle) = (&wayland.globals, &wayland.handle);
        let surface = globals.compositor.create_surface(handle, ());
        let role = globals.shell.get_xdg_surface(&surface, handle, ());
        let toplevel = role.get_toplevel(handle, ());
        toplevel.set_app_id(app_id.to_owned());
        let viewport = globals.viewporter.get_viewport(&surface, handle, ());
        let scale = globals
            .scales
            .as_ref()
            .map(|scales| scales.get_fractional_scale(&surface, handle, ()));
        let effect = globals
            .effects
            .as_ref()
            .map(|effects| effects.get_background_effect(&surface, handle, ()));
        let placement = globals.windows.as_ref().map(|windows| {
            let placement = windows.get_window_state(&toplevel, handle, ());
            placement.set_shell_surface();
            placement.set_keep_above();
            placement
        });
        let glass = globals.glass.as_ref().map(|glass| {
            let glass = glass.get_glass(&surface, handle, ());
            glass.set_role(Role::Transient);
            glass
        });
        surface.commit();
        Self {
            surface,
            role,
            toplevel,
            viewport,
            scale,
            effect,
            placement,
            glass,
        }
    }

    /// Sets the logical size the next frame is shown at and blurs behind all
    /// of it.
    pub fn resize(&self, wayland: &Wayland, width: i32, height: i32) {
        self.viewport.set_destination(width, height);
        self.role.set_window_geometry(0, 0, width, height);
        if let Some(effect) = &self.effect {
            let region = wayland
                .globals
                .compositor
                .create_region(&wayland.handle, ());
            region.add(0, 0, width, height);
            effect.set_blur_region(Some(&region));
            region.destroy();
        }
    }

    /// Asks Kestrel to take the surface off the screen.
    pub fn hide(&self) {
        self.toplevel.set_minimized();
    }

    pub fn request_frame(&self, wayland: &Wayland) {
        self.surface.frame(&wayland.handle, ());
        if let Some(presentation) = &wayland.globals.presentation {
            presentation.feedback(&self.surface, &wayland.handle, ());
        }
    }

    pub fn handles(&self, wayland: &Wayland) -> (RawDisplayHandle, RawWindowHandle) {
        let display = NonNull::new(wayland.connection.backend().display_ptr().cast::<c_void>())
            .expect("a display");
        let surface = NonNull::new(self.surface.id().as_ptr().cast::<c_void>()).expect("a surface");
        (
            RawDisplayHandle::Wayland(WaylandDisplayHandle::new(display)),
            RawWindowHandle::Wayland(WaylandWindowHandle::new(surface)),
        )
    }
}

impl Drop for Window {
    fn drop(&mut self) {
        if let Some(glass) = &self.glass {
            glass.destroy();
        }
        if let Some(placement) = &self.placement {
            placement.destroy();
        }
        if let Some(effect) = &self.effect {
            effect.destroy();
        }
        if let Some(scale) = &self.scale {
            scale.destroy();
        }
        self.viewport.destroy();
        self.toplevel.destroy();
        self.role.destroy();
        self.surface.destroy();
    }
}
