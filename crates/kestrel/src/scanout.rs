#![cfg_attr(not(feature = "session-backend"), allow(dead_code))]

use crate::state::KestrelState;
use smithay::{
    backend::renderer::{
        element::{
            Kind, RenderElementStates,
            memory::MemoryRenderBufferRenderElement,
            surface::{WaylandSurfaceRenderElement, render_elements_from_surface_tree},
        },
        gles::GlesRenderer,
    },
    desktop::utils::{
        OutputPresentationFeedback, send_frames_surface_tree,
        surface_presentation_feedback_flags_from_states, surface_primary_scanout_output,
        take_presentation_feedback_surface_tree, update_surface_primary_scanout_output,
    },
    input::pointer::CursorImageStatus,
    output::Output,
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    utils::{Monotonic, Physical, Point, Scale, Time},
    wayland::compositor::{SurfaceData, TraversalAction, with_surface_tree_downward},
};
use std::{sync::Mutex, time::Duration};

pub const FRAME_CALLBACK_THROTTLE: Option<Duration> = Some(Duration::from_millis(1));

type CursorElement = WaylandSurfaceRenderElement<GlesRenderer>;

#[derive(Default)]
struct SurfaceFrameThrottlingState {
    last_sent_at: Mutex<Option<(Output, u32)>>,
}

pub fn update_primary_scanout_output(
    state: &KestrelState,
    output: &Output,
    render_element_states: &RenderElementStates,
) {
    if let CursorImageStatus::Surface(surface) = &state.cursor_image {
        walk_surface_tree(surface, output, render_element_states);
    }
    if let Some(icon) = &state.dnd_icon {
        walk_surface_tree(&icon.surface, output, render_element_states);
    }

    for workspace in state.visible_workspaces() {
        for surface in state.windows.visible_surfaces_for_workspace(&workspace) {
            walk_surface_tree(&surface, output, render_element_states);
        }
    }

    for surface in state.layer_surfaces() {
        walk_surface_tree(&surface, output, render_element_states);
    }
}

fn walk_surface_tree(
    surface: &WlSurface,
    output: &Output,
    render_element_states: &RenderElementStates,
) {
    with_surface_tree_downward(
        surface,
        (),
        |_, _, _| TraversalAction::DoChildren(()),
        |surface, surface_data, _| {
            update_surface_primary_scanout_output(
                surface,
                output,
                surface_data,
                None,
                render_element_states,
                |current, _, candidate, _| {
                    if current == candidate {
                        current
                    } else {
                        candidate
                    }
                },
            );
        },
        |_, _, _| true,
    );
}

pub fn send_frame_callbacks(
    state: &KestrelState,
    output: &Output,
    sequence: u32,
    time: Time<Monotonic>,
) {
    let should_send = |surface: &WlSurface, surface_data: &SurfaceData| {
        if surface_primary_scanout_output(surface, surface_data).as_ref() != Some(output) {
            return None;
        }

        surface_data
            .data_map
            .insert_if_missing_threadsafe(SurfaceFrameThrottlingState::default);
        let throttling = surface_data
            .data_map
            .get::<SurfaceFrameThrottlingState>()
            .unwrap();
        let mut last_sent_at = throttling.last_sent_at.lock().unwrap();

        let send = !matches!(
            &*last_sent_at,
            Some((last_output, last_sequence))
                if last_output == output && *last_sequence == sequence
        );

        if send {
            *last_sent_at = Some((output.clone(), sequence));
            Some(output.clone())
        } else {
            None
        }
    };

    for workspace in state.visible_workspaces() {
        for surface in state.windows.visible_surfaces_for_workspace(&workspace) {
            send_frames_surface_tree(
                &surface,
                output,
                time,
                FRAME_CALLBACK_THROTTLE,
                &should_send,
            );
        }
    }

    for surface in state.layer_surfaces() {
        send_frames_surface_tree(
            &surface,
            output,
            time,
            FRAME_CALLBACK_THROTTLE,
            &should_send,
        );
    }

    if let CursorImageStatus::Surface(surface) = &state.cursor_image {
        send_frames_surface_tree(surface, output, time, FRAME_CALLBACK_THROTTLE, &should_send);
    }
    if let Some(icon) = &state.dnd_icon {
        send_frames_surface_tree(
            &icon.surface,
            output,
            time,
            FRAME_CALLBACK_THROTTLE,
            &should_send,
        );
    }
}

pub fn take_presentation_feedback(
    state: &KestrelState,
    output: &Output,
    render_element_states: &RenderElementStates,
) -> OutputPresentationFeedback {
    let mut feedback = OutputPresentationFeedback::new(output);

    for workspace in state.visible_workspaces() {
        for surface in state.windows.visible_surfaces_for_workspace(&workspace) {
            take_presentation_feedback_surface_tree(
                &surface,
                &mut feedback,
                surface_primary_scanout_output,
                |surface, _| {
                    surface_presentation_feedback_flags_from_states(
                        surface,
                        None,
                        render_element_states,
                    )
                },
            );
        }
    }

    for surface in state.layer_surfaces() {
        take_presentation_feedback_surface_tree(
            &surface,
            &mut feedback,
            surface_primary_scanout_output,
            |surface, _| {
                surface_presentation_feedback_flags_from_states(
                    surface,
                    None,
                    render_element_states,
                )
            },
        );
    }

    if let CursorImageStatus::Surface(surface) = &state.cursor_image {
        take_presentation_feedback_surface_tree(
            surface,
            &mut feedback,
            surface_primary_scanout_output,
            |surface, _| {
                surface_presentation_feedback_flags_from_states(
                    surface,
                    None,
                    render_element_states,
                )
            },
        );
    }
    if let Some(icon) = &state.dnd_icon {
        take_presentation_feedback_surface_tree(
            &icon.surface,
            &mut feedback,
            surface_primary_scanout_output,
            |surface, _| {
                surface_presentation_feedback_flags_from_states(
                    surface,
                    None,
                    render_element_states,
                )
            },
        );
    }

    let _ = state;
    feedback
}

pub struct PointerRenderElements {
    pub surfaces: Vec<CursorElement>,
    pub memory: Option<MemoryRenderBufferRenderElement<GlesRenderer>>,
}

pub fn collect_pointer_elements(
    state: &KestrelState,
    output: &Output,
    renderer: &mut GlesRenderer,
) -> PointerRenderElements {
    let mut elements = PointerRenderElements {
        surfaces: Vec::new(),
        memory: None,
    };

    let output_scale = Scale::from(output.current_scale().fractional_scale());
    let output_location = output.current_location();
    let pointer_location = state.pointer_location - output_location.to_f64();
    let pointer_pos = pointer_location.to_physical(output_scale);
    let pointer_loc =
        Point::<i32, Physical>::from((pointer_pos.x.round() as i32, pointer_pos.y.round() as i32));

    if let Some(icon) = &state.dnd_icon {
        let location = pointer_loc
            + icon
                .offset
                .to_f64()
                .to_physical(output_scale)
                .to_i32_round();
        elements.surfaces.extend(render_elements_from_surface_tree(
            renderer,
            &icon.surface,
            location,
            output_scale.x,
            1.0,
            Kind::Cursor,
        ));
    }

    match &state.cursor_image {
        CursorImageStatus::Hidden => {}
        CursorImageStatus::Named(icon) => {
            elements.memory =
                crate::cursor_image::named_cursor_element(renderer, *icon, pointer_loc);
        }
        CursorImageStatus::Surface(surface) => {
            elements.surfaces.extend(render_elements_from_surface_tree(
                renderer,
                surface,
                pointer_loc,
                output_scale.x,
                1.0,
                Kind::Cursor,
            ));
        }
    }

    elements
}
