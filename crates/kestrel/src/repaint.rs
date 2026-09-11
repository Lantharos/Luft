use crate::state::{Backend, KestrelState};
use smithay::{
    desktop::{WindowSurfaceType, layer_map_for_output},
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    wayland::compositor::get_parent,
};

impl<B: Backend> KestrelState<B> {
    pub(crate) fn queue_surface_redraw(&mut self, surface: &WlSurface) {
        let mut root = surface.clone();
        while let Some(parent) = get_parent(&root) {
            root = parent;
        }
        if let Some(window) = self.window_for_surface(&root) {
            let outputs = self.space.outputs_for_element(&window);
            if outputs.is_empty() {
                self.backend_data.request_redraw(None);
            }
            for output in outputs {
                self.backend_data.request_redraw(Some(&output));
            }
            return;
        }
        let output = self
            .space
            .outputs()
            .find(|output| {
                layer_map_for_output(output)
                    .layer_for_surface(&root, WindowSurfaceType::ALL)
                    .is_some()
            })
            .cloned();
        self.backend_data.request_redraw(output.as_ref());
    }
}
