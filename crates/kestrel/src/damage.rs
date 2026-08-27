use smithay::{
    backend::renderer::{
        Color32F,
        damage::OutputDamageTracker,
        element::RenderElementStates,
        gles::{GlesError, GlesRenderer, GlesTarget},
    },
    output::Output,
    utils::{Physical, Rectangle, Scale, Transform},
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

    pub fn from_output_with_target_transform(output: &Output, transform: Transform) -> Self {
        let size = output
            .current_mode()
            .map(|mode| mode.size)
            .unwrap_or_else(|| (1, 1).into());
        let scale = Scale::from(output.current_scale().fractional_scale());
        Self {
            tracker: OutputDamageTracker::new(size, scale, transform),
        }
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

    pub fn damage_output<E>(&mut self, buffer_age: usize, elements: &[E]) -> DamageRenderResult
    where
        E: smithay::backend::renderer::element::Element,
    {
        match self.tracker.damage_output(buffer_age, elements) {
            Ok((damage, states)) => DamageRenderResult {
                damage: damage.cloned(),
                states,
            },
            Err(_) => DamageRenderResult {
                damage: None,
                states: RenderElementStates::default(),
            },
        }
    }
}
