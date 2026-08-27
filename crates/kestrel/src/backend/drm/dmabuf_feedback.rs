use super::DrmError;
use super::device::SessionRawCompositor;
use crate::state::KestrelState;
use smithay::{
    backend::{
        allocator::Format,
        allocator::format::FormatSet,
        renderer::element::{RenderElementStates, utils::select_dmabuf_feedback},
    },
    desktop::utils::{send_dmabuf_feedback_surface_tree, surface_primary_scanout_output},
    output::Output,
    reexports::{
        drm::node::DrmNode,
        wayland_protocols::wp::linux_dmabuf::zv1::server::zwp_linux_dmabuf_feedback_v1::TrancheFlags,
    },
    wayland::dmabuf::{DmabufFeedback, DmabufFeedbackBuilder},
};

#[derive(Clone)]
pub struct SurfaceDmabufFeedback {
    pub render: DmabufFeedback,
    pub scanout: DmabufFeedback,
}

pub fn build_surface_dmabuf_feedback(
    compositor: &SessionRawCompositor,
    primary_formats: FormatSet,
    render_node: DrmNode,
) -> Result<SurfaceDmabufFeedback, DrmError> {
    let surface = compositor.surface();
    let planes = surface.planes();
    let primary_plane_formats = surface.plane_info().formats.clone();
    let primary_or_overlay_plane_formats = primary_plane_formats
        .iter()
        .chain(planes.overlay.iter().flat_map(|plane| plane.formats.iter()))
        .copied()
        .collect::<FormatSet>();

    let primary_scanout_formats = primary_plane_formats
        .intersection(&primary_formats)
        .copied()
        .collect::<Vec<Format>>();
    let primary_or_overlay_scanout_formats = primary_or_overlay_plane_formats
        .intersection(&primary_formats)
        .copied()
        .collect::<Vec<Format>>();

    let builder = DmabufFeedbackBuilder::new(render_node.dev_id(), primary_formats.clone());
    let scanout_node = surface.device_fd().dev_id().map_err(|error| {
        DrmError::Unsupported(format!("failed to identify DRM scanout device: {error}"))
    })?;

    let scanout = builder
        .clone()
        .add_preference_tranche(
            scanout_node,
            TrancheFlags::Scanout,
            primary_scanout_formats,
            4u32..=6,
        )
        .add_preference_tranche(
            scanout_node,
            TrancheFlags::Scanout,
            primary_or_overlay_scanout_formats,
            4u32..=6,
        )
        .build()
        .map_err(|error| DrmError::Unsupported(format!("dmabuf feedback build failed: {error}")))?;

    let render = builder
        .build()
        .map_err(|error| DrmError::Unsupported(format!("dmabuf feedback build failed: {error}")))?;

    Ok(SurfaceDmabufFeedback { render, scanout })
}

pub fn send_dmabuf_feedbacks(
    state: &KestrelState,
    output: &Output,
    feedback: &SurfaceDmabufFeedback,
    render_element_states: &RenderElementStates,
) {
    let select = |surface: &smithay::reexports::wayland_server::protocol::wl_surface::WlSurface,
                  _surface_data: &smithay::wayland::compositor::SurfaceData| {
        select_dmabuf_feedback(
            surface,
            render_element_states,
            &feedback.render,
            &feedback.scanout,
        )
    };

    for workspace in state.visible_workspaces() {
        for surface in state.windows.visible_surfaces_for_workspace(&workspace) {
            send_dmabuf_feedback_surface_tree(
                &surface,
                output,
                surface_primary_scanout_output,
                |surface, _surface_data| select(surface, _surface_data),
            );
        }
    }

    for surface in state.layer_surfaces() {
        send_dmabuf_feedback_surface_tree(
            &surface,
            output,
            surface_primary_scanout_output,
            |surface, surface_data| select(surface, surface_data),
        );
    }

    if let smithay::input::pointer::CursorImageStatus::Surface(surface) = &state.cursor_image {
        send_dmabuf_feedback_surface_tree(
            surface,
            output,
            surface_primary_scanout_output,
            |surface, surface_data| select(surface, surface_data),
        );
    }
}
