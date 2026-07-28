use crate::{
    background::Background,
    background_effect,
    layers,
    render::{RenderStage, render_stage_elements},
    render_helpers::EffectBuffer,
    scene_blur::BlurEffectManager,
    scene_composite::scene_backdrop_elements,
    scene_render::{collect_window_scene_layers},
    state::KestrelState,
};
use luft_ipc::WindowId;
use std::collections::HashMap;
use smithay::{
    backend::renderer::{
        element::memory::MemoryRenderBufferRenderElement,
        gles::GlesRenderer,
    },
    wayland::shell::wlr_layer::Layer,
};

pub struct ScenePipeline {
    pub background: Background,
    pub blur_effects: BlurEffectManager,
    effect_buffer: EffectBuffer,
}

#[derive(Default)]
pub struct SceneScratch {
    pub background_element: Option<MemoryRenderBufferRenderElement<GlesRenderer>>,
    pub background_layer: Vec<crate::render::LayerElement>,
    pub bottom_layer: Vec<crate::render::LayerElement>,
    pub window_layers_by_id: HashMap<WindowId, crate::scene_render::WindowSceneLayer>,
    pub top_blurs: Vec<crate::scene_blur::FramebufferBlurElement>,
    pub top_layer: Vec<crate::render::LayerElement>,
    pub overlay_blurs: Vec<crate::scene_blur::FramebufferBlurElement>,
    pub overlay_layer: Vec<crate::render::LayerElement>,
}

impl Default for ScenePipeline {
    fn default() -> Self {
        Self {
            background: Background::new(None),
            blur_effects: BlurEffectManager::default(),
            effect_buffer: EffectBuffer::default(),
        }
    }
}

impl ScenePipeline {
    pub fn reset_for_output(&mut self, state: &KestrelState, background_path: Option<std::path::PathBuf>) {
        self.background.set_path(background_path);
        self.effect_buffer.reset(state.output());
        self.blur_effects.retain_targets(&[]);
    }

    pub fn reset_damage(&mut self, state: &KestrelState) {
        self.effect_buffer.reset(state.output());
    }

    pub fn build(
        &mut self,
        scratch: &mut SceneScratch,
        renderer: &mut GlesRenderer,
        state: &KestrelState,
        removed_windows: bool,
        finished_window_closes: bool,
    ) -> Result<(), smithay::backend::renderer::gles::GlesError> {
        let fullscreen_active = state
            .windows
            .fullscreen_on_workspace(state.layout.active_workspace())
            .is_some();

        let mut top_targets = if fullscreen_active {
            Vec::new()
        } else {
            layers::render_targets(state.output(), Layer::Top)
        };
        if !fullscreen_active {
            top_targets.extend(background_effect::layer_popup_blur_targets(state, Layer::Top));
        }

        let mut overlay_targets = if fullscreen_active {
            Vec::new()
        } else {
            layers::render_targets(state.output(), Layer::Overlay)
        };
        if !fullscreen_active {
            overlay_targets.extend(background_effect::layer_popup_blur_targets(
                state,
                Layer::Overlay,
            ));
        }

        let window_effect_targets = background_effect::window_blur_targets(state);
        let mut blur_targets = window_effect_targets.clone();
        blur_targets.extend(top_targets.iter().cloned());
        blur_targets.extend(overlay_targets.iter().cloned());
        self.blur_effects.retain_targets(&blur_targets);

        let output_size = state.output_size();
        scratch.background_element = self
            .background
            .render_element(renderer, output_size)?;
        scratch.background_layer =
            render_stage_elements(renderer, state, RenderStage::Layer(Layer::Background));
        scratch.bottom_layer =
            render_stage_elements(renderer, state, RenderStage::Layer(Layer::Bottom));

        if removed_windows || finished_window_closes {
            self.effect_buffer.reset(state.output());
        }

        let backdrop = self.effect_buffer.backdrop();
        let target_transform = state.output_transform();
        scratch.window_layers_by_id = collect_window_scene_layers(
            renderer,
            state,
            &mut self.blur_effects,
            output_size,
            target_transform,
            Some(backdrop),
        )?;
        scratch.top_blurs = self.blur_effects.elements_for(
            output_size,
            target_transform,
            &top_targets,
            Some(backdrop),
        );
        scratch.overlay_blurs = self.blur_effects.elements_for(
            output_size,
            target_transform,
            &overlay_targets,
            Some(backdrop),
        );
        scratch.top_layer = if fullscreen_active {
            Vec::new()
        } else {
            render_stage_elements(renderer, state, RenderStage::Layer(Layer::Top))
        };
        scratch.overlay_layer = if fullscreen_active {
            Vec::new()
        } else {
            render_stage_elements(renderer, state, RenderStage::Layer(Layer::Overlay))
        };

        let backdrop_elements = scene_backdrop_elements(
            state,
            scratch.background_element.as_ref(),
            &scratch.background_layer,
            &scratch.bottom_layer,
            &scratch.window_layers_by_id,
        );
        let needs_backdrop = !top_targets.is_empty()
            || !overlay_targets.is_empty()
            || !window_effect_targets.is_empty();
        if needs_backdrop {
            self.effect_buffer
                .render_backdrop(renderer, output_size, &backdrop_elements)?;
        }

        Ok(())
    }
}
