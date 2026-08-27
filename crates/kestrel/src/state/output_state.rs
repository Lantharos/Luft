use super::KestrelState;
use crate::layers;
use luft_ipc::Rect;
use smithay::{
    output::Output,
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    utils::{Logical, Physical, Size},
};

impl KestrelState {
    pub fn output(&self) -> &Output {
        self.render_output_name
            .as_deref()
            .and_then(|name| self.outputs.output(name))
            .unwrap_or_else(|| self.outputs.primary_output())
    }

    pub fn output_size(&self) -> Size<i32, Physical> {
        self.render_output_name
            .as_deref()
            .and_then(|name| self.outputs.managed(name))
            .map(|output| output.descriptor.size)
            .unwrap_or_else(|| self.outputs.primary_size())
    }

    #[cfg(feature = "session-backend")]
    pub fn output_refresh_millihertz(&self) -> i32 {
        self.render_output_name
            .as_deref()
            .and_then(|name| self.outputs.managed(name))
            .map(|output| output.descriptor.refresh_millihertz)
            .unwrap_or_else(|| self.outputs.primary_refresh_millihertz())
    }

    pub fn output_scale(&self) -> f64 {
        self.output().current_scale().fractional_scale()
    }

    pub fn output_logical_size(&self) -> Size<i32, Logical> {
        let output = self.output_size();
        let scale = self.output_scale().max(1.0);
        (
            (f64::from(output.w) / scale).round().max(1.0) as i32,
            (f64::from(output.h) / scale).round().max(1.0) as i32,
        )
            .into()
    }

    #[cfg(feature = "session-backend")]
    pub fn output_transform(&self) -> smithay::utils::Transform {
        self.render_output_name
            .as_deref()
            .and_then(|name| self.outputs.managed(name))
            .map(|output| output.descriptor.transform)
            .unwrap_or_else(|| self.outputs.primary_transform())
    }

    #[cfg(feature = "session-backend")]
    pub fn set_render_output(&mut self, name: Option<&str>) {
        self.render_output_name = name.map(str::to_string);
    }

    #[cfg(feature = "session-backend")]
    pub fn set_output_descriptors(&mut self, descriptors: Vec<crate::output::OutputDescriptor>) {
        self.outputs
            .replace(&self.display_handle, &self.config.display, descriptors);
        self.sync_space_outputs();
        self.resize_primary_layout();
    }

    #[cfg(feature = "session-backend")]
    fn sync_space_outputs(&mut self) {
        let mapped = self.space.outputs().cloned().collect::<Vec<_>>();
        for output in mapped {
            self.space.unmap_output(&output);
        }
        let outputs = self
            .outputs
            .managed_outputs()
            .filter(|output| output.enabled)
            .map(|output| (output.output.clone(), output.location))
            .collect::<Vec<_>>();
        for (output, location) in outputs {
            self.space.map_output(&output, location);
        }
        self.arrange_all_layers();
    }

    #[cfg(feature = "session-backend")]
    fn resize_primary_layout(&mut self) {
        let size = self.output_logical_size();
        self.layout.set_bounds(Rect::new(0, 0, size.w, size.h));
        layers::arrange(self.output());
        self.apply_active_arrangement();
        self.mark_scene_dirty();
    }

    pub fn set_output_size(&mut self, size: Size<i32, Physical>) {
        self.outputs.set_primary_size(size);
        let logical = self.output_logical_size();
        self.layout
            .set_bounds(Rect::new(0, 0, logical.w, logical.h));
        layers::arrange(self.output());
        self.apply_active_arrangement();
        self.mark_scene_dirty();
    }

    pub fn set_output_refresh(&mut self, refresh_millihertz: i32) {
        if !self
            .outputs
            .set_primary_refresh_millihertz(refresh_millihertz)
        {
            return;
        }

        self.mark_scene_dirty();
    }

    pub fn set_output_scale(&mut self, output: Option<&str>, scale: f64) -> bool {
        let primary = self.output().name();
        let target_is_primary = output.is_none_or(|output| output == primary);
        let Some(changed) = self.outputs.set_scale(output, scale) else {
            return false;
        };
        if !changed {
            return false;
        }

        let target_output = output
            .and_then(|name| self.outputs.output(name))
            .unwrap_or_else(|| self.outputs.primary_output())
            .clone();
        for surface in layers::surfaces(&target_output) {
            self.update_surface_scale_for_output(&surface, &target_output);
        }
        layers::arrange(&target_output);

        if !target_is_primary {
            let output_name = target_output.name();
            self.mark_output_structural_dirty(&output_name);
            return true;
        }

        for surface in self
            .windows
            .iter()
            .map(|window| window.surface.wl_surface())
        {
            self.update_surface_scale(surface);
        }
        self.apply_active_arrangement();
        self.mark_scene_dirty();
        true
    }

    pub fn set_primary_output_scale(&mut self, scale: f64) -> bool {
        self.set_output_scale(None, scale)
    }

    pub fn enter_output(&self, surface: &WlSurface) {
        self.output().enter(surface);
        self.update_surface_scale(surface);
    }

    pub fn leave_output(&self, surface: &WlSurface) {
        self.output().leave(surface);
    }

    pub fn cleanup_output(&self) {
        self.output().cleanup();
    }
}
