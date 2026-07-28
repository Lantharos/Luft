use super::device::SessionCompositor;
use super::DrmError;
use crate::state::KestrelState;
use smithay::{
    backend::{
        allocator::{Format, Modifier},
        allocator::format::FormatSet,
        renderer::element::{
            utils::select_dmabuf_feedback, RenderElementStates,
        },
    },
    desktop::utils::{
        send_dmabuf_feedback_surface_tree, surface_primary_scanout_output,
    },
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
    compositor: &SessionCompositor,
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

    let mut primary_scanout_formats = primary_plane_formats
        .intersection(&primary_formats)
        .copied()
        .collect::<Vec<Format>>();
    let mut primary_or_overlay_scanout_formats = primary_or_overlay_plane_formats
        .intersection(&primary_formats)
        .copied()
        .collect::<Vec<Format>>();

    primary_scanout_formats.retain(|format| format.modifier == Modifier::Linear);
    primary_or_overlay_scanout_formats.retain(|format| format.modifier == Modifier::Linear);

    let builder = DmabufFeedbackBuilder::new(render_node.dev_id(), primary_formats.clone());

    let scanout = builder
        .clone()
        .add_preference_tranche(
            render_node.dev_id(),
            Some(TrancheFlags::Scanout),
            primary_scanout_formats,
        )
        .add_preference_tranche(
            render_node.dev_id(),
            Some(TrancheFlags::Scanout),
            primary_or_overlay_scanout_formats,
        )
        .build()
        .map_err(|error| DrmError::Unsupported(format!("dmabuf feedback build failed: {error}")))?;

    let render = scanout.clone();

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
