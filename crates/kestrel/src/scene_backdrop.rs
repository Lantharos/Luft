use crate::scene_composite::SceneCompositeElement;
use smithay::{
    backend::{
        allocator::Fourcc,
        renderer::{
            Bind, Color32F, Offscreen,
            damage::OutputDamageTracker,
            gles::{GlesError, GlesRenderer, GlesTexture},
            utils::CommitCounter,
        },
    },
    output::Output,
    utils::{Buffer, Physical, Rectangle, Scale, Size, Transform},
};
use std::collections::VecDeque;

const DAMAGE_HISTORY_LIMIT: usize = 16;

#[derive(Clone, Debug)]
pub(crate) struct BackdropDamage {
    pub generation: u64,
    pub rectangles: Vec<Rectangle<i32, Physical>>,
}

/// Offscreen copy of the scene below layer-shell blur targets (niri `EffectBuffer` pattern).
pub struct SceneBackdrop {
    damage: OutputDamageTracker,
    commit_counter: CommitCounter,
    texture: Option<GlesTexture>,
    size: Size<i32, Physical>,
    scale: Scale<f64>,
    generation: u64,
    damage_history: VecDeque<BackdropDamage>,
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
            damage_history: VecDeque::new(),
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

    pub(crate) fn damage_history(&self) -> &VecDeque<BackdropDamage> {
        &self.damage_history
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

        let buffer_age = usize::from(self.size == output_size && self.texture.is_some());
        self.ensure_texture(renderer, output_size)?;
        let damage = {
            let texture = self
                .texture
                .as_mut()
                .expect("texture ensured before backdrop render");
            let mut target = renderer.bind(texture)?;
            self.damage
                .render_output(
                    renderer,
                    &mut target,
                    buffer_age,
                    elements,
                    Color32F::TRANSPARENT,
                )
                .map_err(|_error| GlesError::BlitError)?
                .damage
                .cloned()
        };
        if let Some(damage) = damage {
            self.commit_counter.increment();
            self.generation = self.generation.wrapping_add(1);
            self.record_damage(damage.clone());
            let area = damage
                .iter()
                .map(|rect| i64::from(rect.size.w) * i64::from(rect.size.h))
                .sum::<i64>();
            tracing::trace!(
                generation = self.generation,
                rectangles = damage.len(),
                damaged_pixels = area,
                output_pixels = i64::from(output_size.w) * i64::from(output_size.h),
                "updated scene backdrop"
            );
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
        self.record_damage(vec![Rectangle::from_size(output_size)]);
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
        self.record_damage(vec![Rectangle::from_size(self.size)]);
    }

    fn record_damage(&mut self, rectangles: Vec<Rectangle<i32, Physical>>) {
        self.damage_history.push_back(BackdropDamage {
            generation: self.generation,
            rectangles,
        });
        while self.damage_history.len() > DAMAGE_HISTORY_LIMIT {
            self.damage_history.pop_front();
        }
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
