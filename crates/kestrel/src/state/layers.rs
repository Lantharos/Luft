use super::KestrelState;
use crate::layers;
use smithay::{
    desktop::PopupManager, output::Output,
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    wayland::shell::wlr_layer::LayerSurface,
};

impl KestrelState {
    pub fn map_layer_surface(&mut self, surface: LayerSurface, namespace: String, output: Output) {
        output.enter(surface.wl_surface());
        self.update_surface_scale_for_output(surface.wl_surface(), &output);
        layers::map(&output, surface, namespace);
    }

    pub fn unmap_layer_surface(&mut self, surface: &LayerSurface) {
        self.dismiss_popups_for_surface(surface.wl_surface());
        let Some(output) = self.layer_surface_output(surface) else {
            return;
        };
        output.leave(surface.wl_surface());
        layers::unmap(&output, surface);
    }

    pub fn arrange_layer_surface(&self, surface: &LayerSurface) {
        if let Some(output) = self.layer_surface_output(surface) {
            layers::arrange(&output);
        }
    }

    pub fn cleanup_layers(&mut self) {
        let outputs = self
            .outputs
            .managed_outputs()
            .map(|managed| managed.output.clone())
            .collect::<Vec<_>>();
        for output in outputs {
            layers::cleanup(&output);
        }
        self.popup_manager.cleanup();
    }

    #[cfg(feature = "session-backend")]
    pub fn arrange_all_layers(&self) {
        for managed in self
            .outputs
            .managed_outputs()
            .filter(|managed| managed.enabled)
        {
            layers::arrange(&managed.output);
        }
    }

    pub fn layer_surfaces(&self) -> Vec<WlSurface> {
        let mut surfaces = layers::surfaces(self.output());
        let roots = surfaces.clone();
        for root in roots {
            surfaces.extend(
                PopupManager::popups_for_surface(&root)
                    .map(|(popup, _)| popup.wl_surface().clone()),
            );
        }
        surfaces
    }

    pub fn all_layer_surfaces(&self) -> Vec<WlSurface> {
        self.outputs
            .managed_outputs()
            .filter(|managed| managed.enabled)
            .flat_map(|managed| layers::surfaces(&managed.output))
            .collect()
    }

    fn layer_surface_output(&self, surface: &LayerSurface) -> Option<Output> {
        self.outputs
            .managed_outputs()
            .find(|managed| layers::contains(&managed.output, surface))
            .map(|managed| managed.output.clone())
    }

    pub(crate) fn layer_output_for_surface(&self, surface: &WlSurface) -> Option<Output> {
        self.outputs.managed_outputs().find_map(|managed| {
            layers::surfaces(&managed.output)
                .iter()
                .any(|root| root == surface)
                .then(|| managed.output.clone())
        })
    }

    pub fn dismiss_popups_for_surface(&mut self, surface: &WlSurface) {
        let popups = PopupManager::popups_for_surface(surface)
            .map(|(popup, _)| popup)
            .collect::<Vec<_>>();
        for popup in popups {
            let _ = PopupManager::dismiss_popup(surface, &popup);
        }
        self.popup_manager.cleanup();
    }

    #[cfg_attr(not(feature = "session-backend"), allow(dead_code))]
    pub fn has_visible_popups(&self) -> bool {
        self.windows.iter().any(|window| {
            PopupManager::popups_for_surface(window.surface.wl_surface())
                .next()
                .is_some()
        }) || layers::surfaces(self.output())
            .iter()
            .any(|surface| PopupManager::popups_for_surface(surface).next().is_some())
    }
}
