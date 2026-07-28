use crate::scene_composite::SceneCompositeElement;
use smithay::{
    backend::{
        allocator::Fourcc,
        renderer::{
            damage::OutputDamageTracker,
            utils::CommitCounter,
            Bind, Color32F, Offscreen,
            gles::{GlesError, GlesRenderer, GlesTexture},
        },
    },
    output::Output,
    utils::{Buffer, Physical, Scale, Size, Transform},
};

/// Offscreen copy of the scene below layer-shell blur targets (niri `EffectBuffer` pattern).
pub struct SceneBackdrop {
    damage: OutputDamageTracker,
    commit_counter: CommitCounter,
    texture: Option<GlesTexture>,
    size: Size<i32, Physical>,
    scale: Scale<f64>,
    generation: u64,
}

impl Default for SceneBackdrop {
    fn default() -> Self {
        Self {
            damage: OutputDamageTracker::new(
                Size::<i32, Physical>::from((1, 1)),
                Scale::from(1.0),
                Transform::Normal,
            ),
            commit_counter: CommitCounter::default(),
            texture: None,
            size: Size::from((0, 0)),
            scale: Scale::from(1.0),
            generation: 0,
        }
    }
}

impl SceneBackdrop {
    pub fn generation(&self) -> u64 {
        self.generation
    }

    pub fn texture(&self) -> Option<&GlesTexture> {
        self.texture.as_ref()
    }

    #[allow(dead_code)]
    pub fn commit(&self) -> CommitCounter {
        self.commit_counter
    }

    pub fn render(
        &mut self,
        renderer: &mut GlesRenderer,
        output_size: Size<i32, Physical>,
        elements: &[SceneCompositeElement<'_>],
    ) -> Result<(), GlesError> {
        if elements.is_empty() {
            return Ok(());
        }

        self.ensure_texture(renderer, output_size)?;
        let texture = self
            .texture
            .as_mut()
            .expect("texture ensured before backdrop render");
        let mut target = renderer.bind(texture)?;
        let result = self
            .damage
            .render_output(renderer, &mut target, 0, elements, Color32F::TRANSPARENT)
            .map_err(|_error| GlesError::BlitError)?;
        if result.damage.is_some() {
            self.commit_counter.increment();
            self.generation = self.generation.wrapping_add(1);
        }
        Ok(())
    }

    fn ensure_texture(
        &mut self,
        renderer: &mut GlesRenderer,
        output_size: Size<i32, Physical>,
    ) -> Result<(), GlesError> {
        if self.size == output_size && self.texture.is_some() {
            return Ok(());
        }

        self.size = output_size;
        self.texture = Some(create_texture(renderer, output_size)?);
        self.damage = OutputDamageTracker::new(output_size, self.scale, Transform::Normal);
        self.commit_counter.increment();
        self.generation = self.generation.wrapping_add(1);
        Ok(())
    }

    pub fn reset(&mut self, output: &Output) {
        self.scale = Scale::from(output.current_scale().fractional_scale());
        self.size = output
            .current_mode()
            .map(|mode| mode.size)
            .unwrap_or_default();
        self.texture = None;
        self.damage = OutputDamageTracker::new(self.size, self.scale, Transform::Normal);
        self.commit_counter.increment();
        self.generation = self.generation.wrapping_add(1);
    }
}

fn create_texture(
    renderer: &mut GlesRenderer,
    size: Size<i32, Physical>,
) -> Result<GlesTexture, GlesError> {
    renderer.create_buffer(
        Fourcc::Abgr8888,
        Size::<i32, Buffer>::from((size.w, size.h)),
    )
}
