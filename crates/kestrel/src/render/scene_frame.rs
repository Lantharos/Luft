#![cfg_attr(not(feature = "session-backend"), allow(dead_code))]

use crate::{
    damage::{DamageRenderResult, DamageTracker},
    render::{ScenePipeline, SceneScratch},
    scanout::PointerRenderElements,
    scene_composite::SceneRenderElement,
    state::KestrelState,
};
use smithay::{
    backend::{
        allocator::Fourcc,
        renderer::{
            Bind, ExportMem, Offscreen,
            element::{
                Kind, RenderElementStates,
                texture::{TextureRenderBuffer, TextureRenderElement},
            },
            gles::{GlesError, GlesRenderer, GlesTarget, GlesTexture},
        },
    },
    output::Output,
    utils::{Buffer, Physical, Rectangle, Size, Transform},
};

pub struct SceneFrameInput<'a> {
    pub state: &'a KestrelState,
    pub removed_windows: bool,
    pub finished_window_closes: bool,
    pub force_full_damage: bool,
    pub target_transform: Transform,
}

pub struct SceneFrameCore {
    pub pipeline: ScenePipeline,
    pub scratch: SceneScratch,
    capture_without_cursor: CaptureTarget,
    visible_popups: bool,
    last_scene_revision: u64,
    last_structural_revision: u64,
}

pub struct NestedFrameRenderer {
    core: SceneFrameCore,
    scene_damage: DamageTracker,
    host_damage: DamageTracker,
    scene_target: Option<NestedSceneTarget>,
    pending_states: Option<RenderElementStates>,
    frame_ready: bool,
}

struct NestedSceneTarget {
    buffer: TextureRenderBuffer<GlesTexture>,
    size: Size<i32, Physical>,
}

impl SceneFrameCore {
    pub fn new() -> Self {
        Self {
            pipeline: ScenePipeline::default(),
            scratch: SceneScratch::default(),
            capture_without_cursor: CaptureTarget::default(),
            visible_popups: false,
            last_scene_revision: 0,
            last_structural_revision: 0,
        }
    }

    pub fn reset_for_output(&mut self, state: &KestrelState) {
        self.pipeline
            .reset_for_output(state, state.config.compositor.background_image.clone());
        self.capture_without_cursor.reset();
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
            || self.last_scene_revision != state.scene_revision()
            || popup_visibility_changed
            || removed_windows
            || finished_window_closes
            || state.animations_active()
            || state.workspace_transition().is_some()
            || self
                .pipeline
                .background
                .set_path(state.config.compositor.background_image.clone())
    }

    pub fn structural_render_needed(&self, state: &KestrelState) -> bool {
        self.last_structural_revision != state.scene_structural_revision()
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
            target_transform,
        } = input;

        if force_full_damage
            || self.last_structural_revision != state.scene_structural_revision()
            || removed_windows
            || finished_window_closes
        {
            self.pipeline.reset_damage(state);
        }

        self.pipeline.build(
            &mut self.scratch,
            renderer,
            state,
            removed_windows,
            finished_window_closes,
            target_transform,
        )?;
        self.last_scene_revision = state.scene_revision();
        self.last_structural_revision = state.scene_structural_revision();
        Ok(())
    }

    pub fn collect_elements<'a>(
        &'a self,
        state: &'a KestrelState,
        pointer_surfaces: &'a [smithay::backend::renderer::element::surface::WaylandSurfaceRenderElement<GlesRenderer>],
        pointer_memory: Option<
            &'a smithay::backend::renderer::element::memory::MemoryRenderBufferRenderElement<
                GlesRenderer,
            >,
        >,
    ) -> Vec<SceneRenderElement<'a>> {
        collect_scene_elements(state, &self.scratch, pointer_surfaces, pointer_memory)
    }

    pub fn capture_without_cursor(
        &mut self,
        state: &KestrelState,
        renderer: &mut GlesRenderer,
    ) -> Result<<GlesRenderer as ExportMem>::TextureMapping, GlesError> {
        let elements = collect_scene_elements(state, &self.scratch, &[], None);
        self.capture_without_cursor
            .render(state.output(), renderer, &elements)
    }
}

#[derive(Default)]
struct CaptureTarget {
    texture: Option<GlesTexture>,
    size: Size<i32, Physical>,
    damage: Option<DamageTracker>,
}

impl CaptureTarget {
    fn reset(&mut self) {
        self.texture = None;
        self.size = Size::from((0, 0));
        self.damage = None;
    }

    fn render(
        &mut self,
        output: &Output,
        renderer: &mut GlesRenderer,
        elements: &[SceneRenderElement<'_>],
    ) -> Result<<GlesRenderer as ExportMem>::TextureMapping, GlesError> {
        let size = output
            .current_mode()
            .map(|mode| mode.size)
            .unwrap_or_default();
        if self.texture.is_none() || self.size != size {
            self.texture = Some(renderer.create_buffer(
                Fourcc::Abgr8888,
                Size::<i32, Buffer>::from((size.w, size.h)),
            )?);
            self.damage = Some(DamageTracker::from_output(output));
            self.size = size;
        }

        let texture = self.texture.as_mut().expect("capture texture initialized");
        {
            let mut target = renderer.bind(texture)?;
            self.damage
                .as_mut()
                .expect("capture damage initialized")
                .render_output(renderer, &mut target, 0, elements)?;
        }
        renderer.copy_texture(
            texture,
            Rectangle::<i32, Buffer>::from_size((size.w, size.h).into()),
            Fourcc::Argb8888,
        )
    }
}

impl NestedFrameRenderer {
    pub fn new(output: &Output) -> Self {
        Self {
            core: SceneFrameCore::new(),
            scene_damage: DamageTracker::from_output_with_target_transform(
                output,
                Transform::Normal,
            ),
            host_damage: DamageTracker::from_output_with_target_transform(
                output,
                Transform::Flipped180,
            ),
            scene_target: None,
            pending_states: None,
            frame_ready: false,
        }
    }

    pub fn reset_buffers(&mut self, state: &KestrelState) {
        self.scene_damage =
            DamageTracker::from_output_with_target_transform(state.output(), Transform::Normal);
        self.host_damage =
            DamageTracker::from_output_with_target_transform(state.output(), Transform::Flipped180);
        self.scene_target = None;
        self.pending_states = None;
        self.core.reset_for_output(state);
        self.frame_ready = false;
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
            self.scene_damage = DamageTracker::from_output_with_target_transform(
                input.state.output(),
                Transform::Normal,
            );
            self.host_damage = DamageTracker::from_output_with_target_transform(
                input.state.output(),
                Transform::Flipped180,
            );
            self.scene_target = None;
        }

        self.core.prepare(renderer, input)?;
        self.frame_ready = true;
        Ok(())
    }

    pub fn compose(
        &mut self,
        state: &KestrelState,
        renderer: &mut GlesRenderer,
        pointer: &PointerRenderElements,
    ) -> Result<bool, GlesError> {
        if !self.frame_ready {
            return Ok(false);
        }
        self.frame_ready = false;
        self.ensure_scene_target(renderer, state)?;
        let elements =
            self.core
                .collect_elements(state, &pointer.surfaces, pointer.memory.as_ref());
        if elements.is_empty() {
            self.pending_states = Some(RenderElementStates::default());
            return Ok(false);
        }
        let target = self
            .scene_target
            .as_mut()
            .expect("scene target initialized");
        let mut context = target.buffer.render();
        let mut states = None;
        let mut changed = false;
        context.draw(|texture| {
            let mut framebuffer = renderer.bind(texture)?;
            let output =
                self.scene_damage
                    .render_output(renderer, &mut framebuffer, 1, &elements)?;
            states = Some(output.states);
            let damage = output.damage.unwrap_or_default();
            changed = !damage.is_empty();
            Ok::<_, GlesError>(
                damage
                    .into_iter()
                    .map(|rect| {
                        Rectangle::<i32, Buffer>::new(
                            (rect.loc.x, rect.loc.y).into(),
                            (rect.size.w, rect.size.h).into(),
                        )
                    })
                    .collect(),
            )
        })?;
        drop(context);
        self.pending_states = states;
        Ok(changed)
    }

    pub fn present(
        &mut self,
        renderer: &mut GlesRenderer,
        framebuffer: &mut GlesTarget<'_>,
        buffer_age: usize,
    ) -> Result<DamageRenderResult, GlesError> {
        let Some(target) = &self.scene_target else {
            return Ok(DamageRenderResult {
                damage: None,
                states: self.pending_states.take().unwrap_or_default(),
            });
        };
        let element = TextureRenderElement::from_texture_render_buffer(
            (0.0, 0.0),
            &target.buffer,
            None,
            None,
            None,
            Kind::Unspecified,
        );
        let mut output = self.host_damage.damage_output(buffer_age, &[element]);
        if std::env::var_os("KESTREL_RENDER_DIAGNOSTICS").is_some() {
            eprintln!("host damage age={buffer_age}: {:?}", output.damage);
        }
        if let Some(damage) = output.damage.as_deref() {
            renderer.blit_texture_to_current_surface(
                target.buffer.texture(),
                framebuffer,
                target.size,
                damage,
            )?;
            if std::env::var_os("KESTREL_RENDER_DIAGNOSTICS").is_some() {
                eprintln!("host blit complete");
            }
        }
        output.states = self.pending_states.take().unwrap_or_default();
        Ok(output)
    }

    pub fn capture_with_cursor(
        &mut self,
        renderer: &mut GlesRenderer,
    ) -> Result<<GlesRenderer as ExportMem>::TextureMapping, GlesError> {
        let target = self
            .scene_target
            .as_mut()
            .ok_or(GlesError::FramebufferBindingError)?;
        let size = target.size;
        let mut context = target.buffer.render();
        let mut mapping = None;
        context.draw(|texture| {
            mapping = Some(renderer.copy_texture(
                texture,
                Rectangle::<i32, Buffer>::from_size((size.w, size.h).into()),
                Fourcc::Argb8888,
            ));
            Ok::<_, GlesError>(Vec::new())
        })?;
        mapping.expect("scene capture mapping initialized")
    }

    pub fn capture_without_cursor(
        &mut self,
        state: &KestrelState,
        renderer: &mut GlesRenderer,
    ) -> Result<<GlesRenderer as ExportMem>::TextureMapping, GlesError> {
        self.core.capture_without_cursor(state, renderer)
    }

    fn ensure_scene_target(
        &mut self,
        renderer: &mut GlesRenderer,
        state: &KestrelState,
    ) -> Result<(), GlesError> {
        let size = state.output_size();
        if self
            .scene_target
            .as_ref()
            .is_some_and(|target| target.size == size)
        {
            return Ok(());
        }
        let texture = renderer.create_buffer(
            Fourcc::Xbgr8888,
            Size::<i32, Buffer>::from((size.w, size.h)),
        )?;
        let opaque = vec![Rectangle::<i32, Buffer>::from_size((size.w, size.h).into())];
        self.scene_target = Some(NestedSceneTarget {
            buffer: TextureRenderBuffer::from_texture(
                renderer,
                texture,
                1,
                Transform::Flipped180,
                Some(opaque),
            ),
            size,
        });
        self.scene_damage =
            DamageTracker::from_output_with_target_transform(state.output(), Transform::Normal);
        self.host_damage =
            DamageTracker::from_output_with_target_transform(state.output(), Transform::Flipped180);
        Ok(())
    }
}

pub fn collect_scene_elements<'a>(
    state: &KestrelState,
    scratch: &'a SceneScratch,
    pointer_surfaces: &'a [smithay::backend::renderer::element::surface::WaylandSurfaceRenderElement<GlesRenderer>],
    pointer_memory: Option<
        &'a smithay::backend::renderer::element::memory::MemoryRenderBufferRenderElement<
            GlesRenderer,
        >,
    >,
) -> Vec<SceneRenderElement<'a>> {
    if state.session_locked() {
        return scratch
            .lock_surfaces
            .iter()
            .map(SceneRenderElement::Cursor)
            .chain(
                scratch
                    .background_element
                    .iter()
                    .map(SceneRenderElement::Memory),
            )
            .collect();
    }
    let scene = crate::scene_composite::scene_elements(
        Some(state),
        scratch.background_element.as_ref(),
        &scratch.background_layer,
        &scratch.bottom_layer,
        &scratch.window_layers_by_id,
        &scratch.top_blurs,
        &scratch.top_layer,
        &scratch.overlay_blurs,
        &scratch.overlay_layer,
    );
    pointer_memory
        .into_iter()
        .map(SceneRenderElement::Memory)
        .chain(pointer_surfaces.iter().map(SceneRenderElement::Cursor))
        .chain(scene)
        .collect()
}
