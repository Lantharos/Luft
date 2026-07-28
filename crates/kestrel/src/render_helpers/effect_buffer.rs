use crate::{
    scene_backdrop::SceneBackdrop,
    scene_composite::SceneCompositeElement,
};
use smithay::{
    backend::renderer::gles::{GlesError, GlesRenderer},
    output::Output,
    utils::{Physical, Size},
};

/// Backdrop capture used by the unified scene pipeline (blur sampling via `SceneBackdrop`).
#[derive(Default)]
pub struct EffectBuffer {
    backdrop: SceneBackdrop,
}

impl EffectBuffer {
    pub fn backdrop(&self) -> &SceneBackdrop {
        &self.backdrop
    }

    pub fn render_backdrop(
        &mut self,
        renderer: &mut GlesRenderer,
        output_size: Size<i32, Physical>,
        elements: &[SceneCompositeElement<'_>],
    ) -> Result<(), GlesError> {
        self.backdrop.render(renderer, output_size, elements)
    }

    pub fn reset(&mut self, output: &Output) {
        self.backdrop.reset(output);
    }
}
