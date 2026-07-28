use smithay::{
    backend::renderer::{
        element::RenderElementStates,
        Color32F,
        damage::OutputDamageTracker,
        gles::{GlesError, GlesRenderer, GlesTarget},
    },
    output::Output,
    utils::{Physical, Rectangle},
};

pub struct DamageRenderResult {
    pub damage: Option<Vec<Rectangle<i32, Physical>>>,
    pub states: RenderElementStates,
}

#[derive(Debug)]
pub struct DamageTracker {
    tracker: OutputDamageTracker,
}

pub const SCENE_CLEAR_COLOR: Color32F = Color32F::new(0.08, 0.085, 0.09, 1.0);

impl DamageTracker {
    pub fn from_output(output: &Output) -> Self {
        Self {
            tracker: OutputDamageTracker::from_output(output),
        }
    }

    pub fn reset(&mut self, output: &Output) {
        self.tracker = OutputDamageTracker::from_output(output);
    }

    pub fn render_output<E>(
        &mut self,
        renderer: &mut GlesRenderer,
        framebuffer: &mut GlesTarget<'_>,
        buffer_age: usize,
        elements: &[E],
    ) -> Result<DamageRenderResult, GlesError>
    where
        E: smithay::backend::renderer::element::RenderElement<GlesRenderer>,
    {
        let result = self.tracker.render_output(
            renderer,
            framebuffer,
            buffer_age,
            elements,
            SCENE_CLEAR_COLOR,
        );

        match result {
            Ok(output) => Ok(DamageRenderResult {
                damage: output.damage.cloned(),
                states: output.states,
            }),
            Err(smithay::backend::renderer::damage::Error::Rendering(error)) => Err(error),
            Err(smithay::backend::renderer::damage::Error::OutputNoMode(_)) => {
                Ok(DamageRenderResult {
                    damage: None,
                    states: RenderElementStates::default(),
                })
            }
        }
    }
}
