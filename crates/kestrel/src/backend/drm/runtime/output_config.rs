use std::collections::BTreeMap;

use tracing::warn;

use super::timing::refresh_interval;
use crate::backend::drm::{device, frame::SessionFrameRenderer};
use crate::state::KestrelState;

pub(super) fn process_pending_output_apply(
    state: &mut KestrelState,
    device: &mut device::SessionDevice,
    frame_renderers: &mut BTreeMap<String, SessionFrameRenderer>,
) {
    let Some(apply) = state.take_pending_output_apply() else {
        return;
    };
    let previous = state.config.display.clone();
    let mut next_config = state.config.clone();
    next_config.display = apply.config.clone();
    match device.rescan_outputs(&apply.config) {
        Ok(_) => {
            if let Err(error) = device.validate_adaptive_sync(&apply.config) {
                warn!(%error, "rejected adaptive-sync configuration");
                rollback(state, device, frame_renderers, &previous);
                state.output_apply_failed(apply);
                return;
            }
            if let Err(error) = luft_config::save_config(&next_config) {
                warn!(%error, "failed to persist output configuration");
                rollback(state, device, frame_renderers, &previous);
                state.output_apply_failed(apply);
                return;
            }
            state.config = next_config;
            sync_runtime_outputs(state, device, frame_renderers);
            state.output_apply_succeeded(apply);
        }
        Err(error) => {
            warn!(%error, "rejected output configuration");
            rollback(state, device, frame_renderers, &previous);
            state.output_apply_failed(apply);
        }
    }
}

pub(super) fn sync_runtime_outputs(
    state: &mut KestrelState,
    device: &mut device::SessionDevice,
    frame_renderers: &mut BTreeMap<String, SessionFrameRenderer>,
) {
    let descriptors = device.descriptors();
    if !descriptors.is_empty() {
        state.set_output_descriptors(descriptors.clone());
    }
    device.link_compositor_outputs(state);
    if !descriptors.is_empty() {
        frame_renderers.retain(|name, _| descriptors.iter().any(|output| &output.name == name));
    }
    for descriptor in descriptors {
        frame_renderers
            .entry(descriptor.name)
            .or_insert_with(|| {
                SessionFrameRenderer::new(refresh_interval(descriptor.refresh_millihertz))
            })
            .reset_for_output(state);
    }
    device.queue_full_redraws();
    state.mark_all_outputs_scene_dirty();
}

fn rollback(
    state: &mut KestrelState,
    device: &mut device::SessionDevice,
    frame_renderers: &mut BTreeMap<String, SessionFrameRenderer>,
    previous: &luft_config::DisplayConfig,
) {
    if let Err(error) = device.rescan_outputs(previous) {
        warn!(%error, "failed to restore previous output configuration");
        return;
    }
    sync_runtime_outputs(state, device, frame_renderers);
}
