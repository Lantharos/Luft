use crate::{
    background_effect,
    render::window_chrome_elements_for_window,
    scene_backdrop::SceneBackdrop,
    scene_blur::{BlurEffectManager, FramebufferBlurElement},
    space_window::space_window_render_targets,
    state::KestrelState,
    window_clip::{RoundedWindowElement, window_elements_for_window},
};
use luft_ipc::WindowId;
use smithay::{
    backend::renderer::{
        element::{memory::MemoryRenderBufferRenderElement, surface::WaylandSurfaceRenderElement},
        gles::{GlesError, GlesRenderer},
    },
    utils::{Physical, Size, Transform},
};
use std::collections::HashMap;

type WindowSurfaceElement = WaylandSurfaceRenderElement<GlesRenderer>;
type MemoryElement = MemoryRenderBufferRenderElement<GlesRenderer>;
type WindowElement = RoundedWindowElement<WindowSurfaceElement>;

pub struct WindowSceneLayer {
    pub chrome: Vec<MemoryElement>,
    pub surfaces: Vec<WindowElement>,
    pub blurs: Vec<FramebufferBlurElement>,
}

pub fn collect_window_scene_layers(
    renderer: &mut GlesRenderer,
    state: &KestrelState,
    blur_effects: &mut BlurEffectManager,
    output_size: Size<i32, Physical>,
    target_transform: Transform,
    backdrop: Option<&SceneBackdrop>,
) -> Result<HashMap<WindowId, WindowSceneLayer>, GlesError> {
    let grouped_targets = background_effect::window_blur_targets_grouped(state);
    let mut target_groups = grouped_targets.into_iter();
    let mut layers = HashMap::new();

    for target in space_window_render_targets(state) {
        let Some(managed) = state.windows.window(target.id) else {
            target_groups.next();
            continue;
        };
        let blur_targets = target_groups.next().unwrap_or_default();
        layers.insert(
            target.id,
            WindowSceneLayer {
                chrome: window_chrome_elements_for_window(renderer, state, managed, target.offset)?,
                surfaces: window_elements_for_window(renderer, managed, target.offset, output_size),
                blurs: blur_effects.elements_for(
                    output_size,
                    target_transform,
                    &blur_targets,
                    backdrop,
                ),
            },
        );
    }

    Ok(layers)
}
