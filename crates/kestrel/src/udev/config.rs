use super::*;

impl KestrelState<UdevData> {
    pub(super) fn configure_outputs(
        &mut self,
        config: &luft_config::DisplayConfig,
    ) -> Result<(), String> {
        let connectors = self
            .backend_data
            .backends
            .iter()
            .flat_map(|(node, backend)| {
                backend
                    .drm_scanner
                    .crtcs()
                    .map(|(connector, crtc)| (*node, connector.clone(), crtc))
                    .collect::<Vec<_>>()
            })
            .collect::<Vec<_>>();
        let enabled = connectors.iter().any(|(_, connector, _)| {
            let name = format!(
                "{}-{}",
                connector.interface().as_str(),
                connector.interface_id()
            );
            config
                .outputs
                .get(&name)
                .is_none_or(|output| output.enabled)
        });
        if !connectors.is_empty() && !enabled {
            return Err("at least one connected display must remain enabled".into());
        }
        for (_, connector, _) in &connectors {
            let name = format!(
                "{}-{}",
                connector.interface().as_str(),
                connector.interface_id()
            );
            if let Some(output) = config.outputs.get(&name)
                && output.enabled
                && !connector.modes().iter().any(|mode| {
                    let mode = WlMode::from(*mode);
                    output.width.is_none_or(|width| width == mode.size.w)
                        && output.height.is_none_or(|height| height == mode.size.h)
                        && output
                            .refresh_millihertz
                            .is_none_or(|refresh| refresh == mode.refresh)
                })
            {
                return Err(format!("unsupported mode for {name}"));
            }
        }
        for (node, connector, crtc) in connectors {
            let name = format!(
                "{}-{}",
                connector.interface().as_str(),
                connector.interface_id()
            );
            let configured = config.outputs.get(&name);
            let existing = self
                .backend_data
                .backends
                .get(&node)
                .is_some_and(|backend| backend.surfaces.contains_key(&crtc));
            if configured.is_some_and(|output| !output.enabled) {
                if existing {
                    self.connector_disconnected(node, connector, crtc);
                }
                continue;
            }
            if !existing {
                self.connector_connected(node, connector, crtc);
                continue;
            }
            let backend = self.backend_data.backends.get_mut(&node).unwrap();
            let render_node = backend.render_node.unwrap_or(self.backend_data.primary_gpu);
            let mut renderer = self
                .backend_data
                .gpus
                .single_renderer(&render_node)
                .map_err(|error| error.to_string())?;
            let mut elements = DrmOutputRenderElements::new();
            for (id, surface) in &backend.surfaces {
                let lock = self
                    .session_lock
                    .surface_for_output(&surface.output)
                    .map(|surface| surface.wl_surface());
                let (render, clear) = crate::render::output_elements::<UdevRenderer<'_>>(
                    &surface.output,
                    &self.space,
                    [],
                    &mut renderer,
                    self.show_window_preview,
                    self.session_lock.is_active(),
                    lock,
                    &self.wallpaper,
                    &self.layer_motion,
                );
                elements.add_output(id, clear, render);
            }
            let surface = backend.surfaces.get_mut(&crtc).unwrap();
            let mode = configured
                .filter(|output| {
                    output.width.is_some()
                        || output.height.is_some()
                        || output.refresh_millihertz.is_some()
                })
                .map(|output| {
                    connector
                        .modes()
                        .iter()
                        .copied()
                        .find(|mode| {
                            let mode = WlMode::from(*mode);
                            output.width.is_none_or(|width| width == mode.size.w)
                                && output.height.is_none_or(|height| height == mode.size.h)
                                && output
                                    .refresh_millihertz
                                    .is_none_or(|refresh| refresh == mode.refresh)
                        })
                        .ok_or_else(|| format!("unsupported mode for {name}"))
                })
                .transpose()?;
            if let Some(mode) = mode
                && surface.output.current_mode() != Some(WlMode::from(mode))
            {
                surface
                    .drm_output
                    .use_mode(mode, &mut renderer, &elements)
                    .map_err(|error| error.to_string())?;
                surface
                    .output
                    .change_current_state(Some(WlMode::from(mode)), None, None, None);
            }
            let adaptive = configured.is_some_and(|output| output.adaptive_sync);
            surface
                .drm_output
                .with_compositor(|compositor| {
                    if compositor.vrr_enabled() != adaptive {
                        compositor.use_vrr(adaptive)
                    } else {
                        Ok(())
                    }
                })
                .map_err(|error| format!("adaptive sync for {name}: {error}"))?;
            let transform = configured
                .map(|output| output_transform(output.transform))
                .unwrap_or(Transform::Normal);
            let current = self
                .space
                .output_geometry(&surface.output)
                .map(|geometry| geometry.loc)
                .unwrap_or_default();
            let position = configured
                .map(|output| (output.x.unwrap_or(current.x), output.y.unwrap_or(current.y)).into())
                .unwrap_or(current);
            surface.output.change_current_state(
                None,
                Some(transform),
                Some(OutputScale::Fractional(config.output_scale(&name))),
                Some(position),
            );
            self.space.map_output(&surface.output, position);
            surface.drm_output.reset_buffers();
            self.session_lock.configure_output(&surface.output);
        }
        crate::shell::fixup_positions(&mut self.space, self.pointer.current_location());
        Ok(())
    }
}
