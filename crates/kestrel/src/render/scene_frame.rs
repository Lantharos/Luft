#![cfg_attr(not(feature = "session-backend"), allow(dead_code))]

use crate::{
    damage::{DamageRenderResult, DamageTracker},
    render::{ScenePipeline, SceneScratch},
    scanout::collect_pointer_elements,
    scene_composite::SceneRenderElement,
    scene_handle::SceneDrawSession,
    state::{KestrelState},
};
use smithay::{
    backend::renderer::gles::{GlesError, GlesRenderer, GlesTarget},
    output::Output,
};

pub struct SceneFrameInput<'a> {
    pub state: &'a KestrelState,
    pub removed_windows: bool,
    pub finished_window_closes: bool,
    pub force_full_damage: bool,
}

pub struct SceneFrameCore {
    pub pipeline: ScenePipeline,
    pub scratch: SceneScratch,
    visible_popups: bool,
}

pub struct NestedFrameRenderer {
    core: SceneFrameCore,
    damage_tracker: DamageTracker,
    frame_ready: bool,
}

impl SceneFrameCore {
    pub fn new() -> Self {
        Self {
            pipeline: ScenePipeline::default(),
            scratch: SceneScratch::default(),
            visible_popups: false,
        }
    }

    pub fn reset_for_output(&mut self, state: &KestrelState) {
        self.pipeline
            .reset_for_output(state, state.config.compositor.background_image.clone());
    }

    pub fn reset_damage(&mut self, state: &KestrelState) {
        self.pipeline.reset_damage(state);
    }

    pub fn content_render_needed(
        &mut self,
        state: &KestrelState,
        removed_windows: bool,
        finished_window_closes: bool,
        force_full_damage: bool,
    ) -> bool {
        let visible_popups = state.has_visible_popups();
        let popup_visibility_changed =
            std::mem::replace(&mut self.visible_popups, visible_popups) != visible_popups;

        force_full_damage
            || state.scene_structural_dirty()
            || state.scene_content_dirty()
            || popup_visibility_changed
            || state.cursor_dirty
            || removed_windows
            || finished_window_closes
            || state.animations_active()
            || state.workspace_transition().is_some()
            || self
                .pipeline
                .background
                .set_path(state.config.compositor.background_image.clone())
    }

    pub fn prepare(
        &mut self,
        renderer: &mut GlesRenderer,
        input: SceneFrameInput<'_>,
    ) -> Result<(), GlesError> {
        let SceneFrameInput {
            state,
            removed_windows,
            finished_window_closes,
            force_full_damage,
        } = input;

        if force_full_damage || removed_windows || finished_window_closes {
            self.pipeline.reset_damage(state);
        }

        self.pipeline.build(
            &mut self.scratch,
            renderer,
            state,
            removed_windows,
            finished_window_closes,
        )
    }

    pub fn collect_elements<'a>(
        &'a self,
        state: &'a KestrelState,
        pointer_surfaces: &'a [smithay::backend::renderer::element::surface::WaylandSurfaceRenderElement<GlesRenderer>],
    ) -> Vec<SceneRenderElement<'a>> {
        collect_scene_elements(state, &self.scratch, pointer_surfaces)
    }
}

impl NestedFrameRenderer {
    pub fn new(output: &Output) -> Self {
        Self {
            core: SceneFrameCore::new(),
            damage_tracker: DamageTracker::from_output(output),
            frame_ready: false,
        }
    }

    pub fn reset_buffers(&mut self, state: &KestrelState) {
        self.damage_tracker.reset(state.output());
        self.core.reset_for_output(state);
        self.frame_ready = false;
    }

    pub fn reset_damage(&mut self, state: &KestrelState) {
        self.damage_tracker.reset(state.output());
    }

    pub fn content_render_needed(
        &mut self,
        state: &KestrelState,
        removed_windows: bool,
        finished_window_closes: bool,
        force_full_damage: bool,
    ) -> bool {
        self.core.content_render_needed(
            state,
            removed_windows,
            finished_window_closes,
            force_full_damage,
        )
    }

    pub fn prepare(
        &mut self,
        renderer: &mut GlesRenderer,
        input: SceneFrameInput<'_>,
    ) -> Result<(), GlesError> {
        self.frame_ready = false;

        if input.force_full_damage || input.removed_windows || input.finished_window_closes {
            self.damage_tracker.reset(input.state.output());
        }

        self.core.prepare(renderer, input)?;
        self.frame_ready = true;
        Ok(())
    }

    pub fn present(
        &mut self,
        state: &KestrelState,
        renderer: &mut GlesRenderer,
        framebuffer: &mut GlesTarget<'_>,
        buffer_age: usize,
    ) -> Result<Option<DamageRenderResult>, GlesError> {
        if !self.frame_ready {
            return Ok(None);
        }
        self.frame_ready = false;
        self.render_prepared(state, renderer, framebuffer, buffer_age)
            .map(Some)
    }

    pub fn render_prepared(
        &mut self,
        state: &KestrelState,
        renderer: &mut GlesRenderer,
        framebuffer: &mut GlesTarget<'_>,
        buffer_age: usize,
    ) -> Result<DamageRenderResult, GlesError> {
        let pointer = collect_pointer_elements(state, state.output(), renderer);
        let elements = SceneDrawSession::enter(&self.core.scratch, || {
            self.core.collect_elements(state, &pointer.surfaces)
        });
        if elements.is_empty() {
            return Ok(DamageRenderResult {
                damage: None,
                states: smithay::backend::renderer::element::RenderElementStates::default(),
            });
        }
        self.damage_tracker
            .render_output(renderer, framebuffer, buffer_age, &elements)
    }
}

pub fn collect_scene_elements<'a>(
    state: &KestrelState,
    scratch: &'a SceneScratch,
    pointer_surfaces: &'a [smithay::backend::renderer::element::surface::WaylandSurfaceRenderElement<GlesRenderer>],
) -> Vec<SceneRenderElement<'a>> {
    crate::scene_composite::scene_elements(
        Some(state),
        scratch.background_element.as_ref(),
        &scratch.background_layer,
        &scratch.bottom_layer,
        &scratch.window_layers_by_id,
        &scratch.top_blurs,
        &scratch.top_layer,
        &scratch.overlay_blurs,
        &scratch.overlay_layer,
    )
    .into_iter()
    .chain(
        pointer_surfaces
            .iter()
            .map(SceneRenderElement::Cursor),
    )
    .collect()
}
