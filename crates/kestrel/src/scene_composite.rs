#![cfg_attr(not(feature = "session-backend"), allow(dead_code))]

use crate::{
    render::LayerElement, scene_blur::FramebufferBlurElement, scene_render::WindowSceneLayer,
    state::KestrelState,
};
use luft_ipc::WindowId;
use smithay::{
    backend::renderer::{
        element::{
            Element, Id, Kind, RenderElement, UnderlyingStorage,
            memory::MemoryRenderBufferRenderElement, surface::WaylandSurfaceRenderElement,
        },
        gles::{GlesError, GlesRenderer},
        utils::{CommitCounter, DamageSet, OpaqueRegions},
    },
    utils::{Buffer, Physical, Rectangle, Scale, Transform, user_data::UserDataMap},
};
use std::collections::HashMap;

type MemoryElement = MemoryRenderBufferRenderElement<GlesRenderer>;
type CursorSurfaceElement = WaylandSurfaceRenderElement<GlesRenderer>;

#[derive(Clone, Copy)]
pub enum SceneRenderElement<'a> {
    Rounded(&'a LayerElement),
    Memory(&'a MemoryElement),
    Blur(&'a FramebufferBlurElement),
    Cursor(&'a CursorSurfaceElement),
}

pub type SceneCompositeElement<'a> = SceneRenderElement<'a>;

impl Element for SceneRenderElement<'_> {
    fn id(&self) -> &Id {
        match self {
            Self::Rounded(element) => element.id(),
            Self::Memory(element) => element.id(),
            Self::Blur(element) => element.id(),
            Self::Cursor(element) => element.id(),
        }
    }

    fn current_commit(&self) -> CommitCounter {
        match self {
            Self::Rounded(element) => element.current_commit(),
            Self::Memory(element) => element.current_commit(),
            Self::Blur(element) => element.current_commit(),
            Self::Cursor(element) => element.current_commit(),
        }
    }

    fn src(&self) -> Rectangle<f64, Buffer> {
        match self {
            Self::Rounded(element) => element.src(),
            Self::Memory(element) => element.src(),
            Self::Blur(element) => element.src(),
            Self::Cursor(element) => element.src(),
        }
    }

    fn transform(&self) -> Transform {
        match self {
            Self::Rounded(element) => element.transform(),
            Self::Memory(element) => element.transform(),
            Self::Blur(element) => element.transform(),
            Self::Cursor(element) => element.transform(),
        }
    }

    fn geometry(&self, scale: Scale<f64>) -> Rectangle<i32, Physical> {
        match self {
            Self::Rounded(element) => element.geometry(scale),
            Self::Memory(element) => element.geometry(scale),
            Self::Blur(element) => element.geometry(scale),
            Self::Cursor(element) => element.geometry(scale),
        }
    }

    fn damage_since(
        &self,
        scale: Scale<f64>,
        commit: Option<CommitCounter>,
    ) -> DamageSet<i32, Physical> {
        match self {
            Self::Rounded(element) => element.damage_since(scale, commit),
            Self::Memory(element) => element.damage_since(scale, commit),
            Self::Blur(element) => element.damage_since(scale, commit),
            Self::Cursor(element) => element.damage_since(scale, commit),
        }
    }

    fn opaque_regions(&self, scale: Scale<f64>) -> OpaqueRegions<i32, Physical> {
        match self {
            Self::Rounded(element) => element.opaque_regions(scale),
            Self::Memory(element) => element.opaque_regions(scale),
            Self::Blur(element) => element.opaque_regions(scale),
            Self::Cursor(element) => element.opaque_regions(scale),
        }
    }

    fn alpha(&self) -> f32 {
        match self {
            Self::Rounded(element) => element.alpha(),
            Self::Memory(element) => element.alpha(),
            Self::Blur(element) => element.alpha(),
            Self::Cursor(element) => element.alpha(),
        }
    }

    fn kind(&self) -> Kind {
        match self {
            Self::Rounded(element) => element.kind(),
            Self::Memory(element) => element.kind(),
            Self::Blur(element) => element.kind(),
            Self::Cursor(element) => element.kind(),
        }
    }

    fn is_framebuffer_effect(&self) -> bool {
        match self {
            Self::Rounded(element) => element.is_framebuffer_effect(),
            Self::Memory(element) => element.is_framebuffer_effect(),
            Self::Blur(element) => element.is_framebuffer_effect(),
            Self::Cursor(element) => element.is_framebuffer_effect(),
        }
    }
}

impl RenderElement<GlesRenderer> for SceneRenderElement<'_> {
    fn capture_framebuffer(
        &self,
        frame: &mut <GlesRenderer as smithay::backend::renderer::RendererSuper>::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        cache: &UserDataMap,
    ) -> Result<(), GlesError> {
        match self {
            Self::Blur(element) => {
                RenderElement::<GlesRenderer>::capture_framebuffer(element, frame, src, dst, cache)
            }
            _ => Ok(()),
        }
    }

    fn draw(
        &self,
        frame: &mut <GlesRenderer as smithay::backend::renderer::RendererSuper>::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
        cache: Option<&UserDataMap>,
    ) -> Result<(), GlesError> {
        match self {
            Self::Rounded(element) => RenderElement::<GlesRenderer>::draw(
                element,
                frame,
                src,
                dst,
                damage,
                opaque_regions,
                cache,
            ),
            Self::Memory(element) => RenderElement::<GlesRenderer>::draw(
                element,
                frame,
                src,
                dst,
                damage,
                opaque_regions,
                cache,
            ),
            Self::Blur(element) => RenderElement::<GlesRenderer>::draw(
                element,
                frame,
                src,
                dst,
                damage,
                opaque_regions,
                cache,
            ),
            Self::Cursor(element) => RenderElement::<GlesRenderer>::draw(
                element,
                frame,
                src,
                dst,
                damage,
                opaque_regions,
                cache,
            ),
        }
    }

    fn underlying_storage(&self, renderer: &mut GlesRenderer) -> Option<UnderlyingStorage<'_>> {
        match self {
            Self::Rounded(element) => element.underlying_storage(renderer),
            Self::Memory(element) => element.underlying_storage(renderer),
            Self::Blur(element) => element.underlying_storage(renderer),
            Self::Cursor(element) => element.underlying_storage(renderer),
        }
    }
}

pub fn space_ordered_window_layers<'a>(
    state: &KestrelState,
    layers_by_id: &'a HashMap<WindowId, WindowSceneLayer>,
) -> Vec<&'a WindowSceneLayer> {
    let mut layers = Vec::new();
    let mut seen = std::collections::HashSet::new();

    for window in state.space.elements() {
        if let Some(layer) = layers_by_id.get(&window.id()) {
            seen.insert(window.id());
            layers.push(layer);
        }
    }

    for target in crate::space_window::space_window_render_targets(state) {
        if seen.contains(&target.id) {
            continue;
        }
        if let Some(layer) = layers_by_id.get(&target.id) {
            layers.push(layer);
        }
    }

    layers
}

#[allow(clippy::too_many_arguments)]
pub fn scene_elements<'a>(
    state: Option<&KestrelState>,
    background: Option<&'a MemoryElement>,
    background_layer: &'a [LayerElement],
    bottom_layer: &'a [LayerElement],
    window_layers_by_id: &'a HashMap<WindowId, WindowSceneLayer>,
    top_blurs: &'a [FramebufferBlurElement],
    top_layer: &'a [LayerElement],
    overlay_blurs: &'a [FramebufferBlurElement],
    overlay_layer: &'a [LayerElement],
) -> Vec<SceneRenderElement<'a>> {
    let window_layers = state
        .map(|state| space_ordered_window_layers(state, window_layers_by_id))
        .unwrap_or_default();
    let window_count = window_layers
        .iter()
        .map(|layer| layer.chrome.len() + layer.surfaces.len() + layer.blurs.len())
        .sum::<usize>();
    let mut elements = Vec::with_capacity(
        overlay_layer.len()
            + overlay_blurs.len()
            + top_layer.len()
            + top_blurs.len()
            + window_count
            + bottom_layer.len()
            + background_layer.len()
            + usize::from(background.is_some()),
    );
    elements.extend(overlay_layer.iter().map(SceneRenderElement::Rounded));
    elements.extend(overlay_blurs.iter().map(SceneRenderElement::Blur));
    elements.extend(top_layer.iter().map(SceneRenderElement::Rounded));
    elements.extend(top_blurs.iter().map(SceneRenderElement::Blur));
    for layer in window_layers {
        elements.extend(layer.chrome.iter().map(SceneRenderElement::Memory));
        elements.extend(layer.surfaces.iter().map(SceneRenderElement::Rounded));
        elements.extend(layer.blurs.iter().map(SceneRenderElement::Blur));
    }
    elements.extend(bottom_layer.iter().map(SceneRenderElement::Rounded));
    elements.extend(background_layer.iter().map(SceneRenderElement::Rounded));
    if let Some(background) = background {
        elements.push(SceneRenderElement::Memory(background));
    }
    elements
}

pub fn scene_backdrop_elements<'a>(
    state: &KestrelState,
    background: Option<&'a MemoryElement>,
    background_layer: &'a [LayerElement],
    bottom_layer: &'a [LayerElement],
    window_layers_by_id: &'a HashMap<WindowId, WindowSceneLayer>,
) -> Vec<SceneRenderElement<'a>> {
    scene_elements(
        Some(state),
        background,
        background_layer,
        bottom_layer,
        window_layers_by_id,
        &[],
        &[],
        &[],
        &[],
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_scene_has_no_elements() {
        let window_layers = HashMap::new();
        let elements = scene_elements(None, None, &[], &[], &window_layers, &[], &[], &[], &[]);
        assert!(elements.is_empty());
    }
}
