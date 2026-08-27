use crate::state::KestrelState;
use smithay::{
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    wayland::{
        background_effect::{
            BackgroundEffectSurfaceCachedState, Capability, ExtBackgroundEffectHandler,
        },
        compositor::{self, RegionAttributes},
    },
};

mod targets;

pub use targets::{layer_popup_blur_targets, window_blur_targets, window_blur_targets_grouped};

impl ExtBackgroundEffectHandler for KestrelState {
    fn capabilities(&self) -> Capability {
        Capability::Blur
    }

    fn set_blur_region(&mut self, surface: WlSurface, _region: RegionAttributes) {
        self.mark_surface_content_dirty(&surface);
    }

    fn unset_blur_region(&mut self, surface: WlSurface) {
        self.mark_surface_content_dirty(&surface);
    }
}

pub(crate) fn current_blur_region(surface: &WlSurface) -> Option<RegionAttributes> {
    compositor::with_states(surface, |states| {
        states
            .cached_state
            .get::<BackgroundEffectSurfaceCachedState>()
            .current()
            .blur_region
            .clone()
    })
}
