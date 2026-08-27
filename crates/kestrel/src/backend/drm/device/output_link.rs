use super::*;
use crate::{backend::drm::dmabuf_feedback::build_surface_dmabuf_feedback, state::KestrelState};
use luft_config::DisplayConfig;
use smithay::{backend::drm::VrrSupport, output::OutputModeSource};

impl SessionDevice {
    pub fn link_compositor_outputs(&mut self, state: &KestrelState) {
        for session_output in &mut self.outputs {
            let Some(output) = state.outputs.output(&session_output.descriptor.name) else {
                continue;
            };
            session_output.compositor.with_compositor(|compositor| {
                compositor.set_output_mode_source(OutputModeSource::Auto(output.downgrade()));
            });
            let adaptive_sync = state
                .config
                .display
                .outputs
                .get(&session_output.descriptor.name)
                .is_some_and(|config| config.adaptive_sync);
            let connector = session_output.output.connector;
            session_output.compositor.with_compositor(|compositor| {
                let supported = compositor
                    .vrr_supported(connector)
                    .is_ok_and(|support| support != VrrSupport::NotSupported);
                let enabled = adaptive_sync && supported;
                if compositor.vrr_enabled() != enabled
                    && let Err(error) = compositor.use_vrr(enabled)
                {
                    tracing::warn!(
                        output = %session_output.descriptor.name,
                        %error,
                        "failed to update DRM adaptive sync"
                    );
                }
            });
            if session_output.dmabuf_feedback.is_none()
                && let Some(render_node) = self.import_node
            {
                session_output.dmabuf_feedback =
                    session_output.compositor.with_compositor(|compositor| {
                        build_surface_dmabuf_feedback(
                            compositor,
                            state.dmabuf_formats.clone(),
                            render_node,
                        )
                        .ok()
                    });
            }
        }
    }

    pub fn validate_adaptive_sync(&mut self, config: &DisplayConfig) -> Result<(), DrmError> {
        for output in &mut self.outputs {
            let requested = config
                .outputs
                .get(&output.descriptor.name)
                .is_some_and(|config| config.adaptive_sync);
            let connector = output.output.connector;
            output.compositor.with_compositor(|compositor| {
                let supported = compositor
                    .vrr_supported(connector)
                    .map_err(compositor_error)?;
                if requested && supported == VrrSupport::NotSupported {
                    return Err(DrmError::Unsupported(format!(
                        "{} does not support adaptive sync",
                        output.descriptor.name
                    )));
                }
                if compositor.vrr_enabled() != requested {
                    compositor.use_vrr(requested).map_err(compositor_error)?;
                }
                Ok(())
            })?;
        }
        Ok(())
    }
}
