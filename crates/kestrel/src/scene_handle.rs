use crate::{
    render::SceneScratch,
    scene_composite::SceneRenderElement,
    scene_render::WindowSceneLayer,
};
use luft_ipc::WindowId;
use smithay::{
    backend::renderer::{
        element::{Element, Id, Kind, RenderElement, UnderlyingStorage},
        gles::{GlesError, GlesRenderer},
        utils::{CommitCounter, DamageSet, OpaqueRegions},
    },
    utils::{user_data::UserDataMap, Buffer, Physical, Rectangle, Scale, Transform},
};
use std::{cell::RefCell, marker::PhantomData, sync::OnceLock};

thread_local! {
    static ACTIVE_SCRATCH: RefCell<Option<*const SceneScratch>> = const { RefCell::new(None) };
}

pub struct SceneDrawSession<'a> {
    _marker: PhantomData<&'a ()>,
}

impl<'a> SceneDrawSession<'a> {
    pub fn enter<R>(scratch: &'a SceneScratch, f: impl FnOnce() -> R) -> R {
        ACTIVE_SCRATCH.with(|cell| {
            cell.replace(Some(scratch as *const SceneScratch));
            let result = f();
            cell.replace(None);
            result
        })
    }
}

pub fn active_scratch_for_render<'scratch>() -> Option<&'scratch SceneScratch> {
    ACTIVE_SCRATCH.with(|cell| cell.borrow().map(|ptr| unsafe { &*ptr }))
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum KestrelRenderHandle {
    Chrome { window: WindowId, index: u16 },
    Surface { window: WindowId, index: u16 },
    Blur { window: WindowId, index: u16 },
}

impl KestrelRenderHandle {
    pub fn handles_for_layer(window: WindowId, layer: &WindowSceneLayer) -> Vec<Self> {
        let capacity = layer.chrome.len() + layer.surfaces.len() + layer.blurs.len();
        let mut handles = Vec::with_capacity(capacity);
        for (index, _) in layer.chrome.iter().enumerate() {
            handles.push(Self::Chrome {
                window,
                index: index as u16,
            });
        }
        for (index, _) in layer.surfaces.iter().enumerate() {
            handles.push(Self::Surface {
                window,
                index: index as u16,
            });
        }
        for (index, _) in layer.blurs.iter().enumerate() {
            handles.push(Self::Blur {
                window,
                index: index as u16,
            });
        }
        handles
    }
}

pub fn layer_element_for_handle<'a>(
    scratch: &'a SceneScratch,
    handle: KestrelRenderHandle,
) -> Option<SceneRenderElement<'a>> {
    let layer = scratch
        .window_layers_by_id
        .get(&window_for_handle(handle))?;
    match handle {
        KestrelRenderHandle::Chrome { index, .. } => layer
            .chrome
            .get(index as usize)
            .map(SceneRenderElement::Memory),
        KestrelRenderHandle::Surface { index, .. } => layer
            .surfaces
            .get(index as usize)
            .map(SceneRenderElement::Rounded),
        KestrelRenderHandle::Blur { index, .. } => layer
            .blurs
            .get(index as usize)
            .map(SceneRenderElement::Blur),
    }
}

fn window_for_handle(handle: KestrelRenderHandle) -> WindowId {
    match handle {
        KestrelRenderHandle::Chrome { window, .. }
        | KestrelRenderHandle::Surface { window, .. }
        | KestrelRenderHandle::Blur { window, .. } => window,
    }
}

impl Element for KestrelRenderHandle {
    fn id(&self) -> &Id {
        static_handle_id()
    }

    fn current_commit(&self) -> CommitCounter {
        lookup(*self, |element| element.current_commit())
    }

    fn src(&self) -> Rectangle<f64, Buffer> {
        lookup(*self, |element| element.src())
    }

    fn transform(&self) -> Transform {
        lookup(*self, |element| element.transform())
    }

    fn geometry(&self, scale: Scale<f64>) -> Rectangle<i32, Physical> {
        lookup(*self, |element| element.geometry(scale))
    }

    fn damage_since(
        &self,
        scale: Scale<f64>,
        commit: Option<CommitCounter>,
    ) -> DamageSet<i32, Physical> {
        lookup(*self, |element| element.damage_since(scale, commit))
    }

    fn opaque_regions(&self, scale: Scale<f64>) -> OpaqueRegions<i32, Physical> {
        lookup(*self, |element| element.opaque_regions(scale))
    }

    fn alpha(&self) -> f32 {
        lookup(*self, |element| element.alpha())
    }

    fn kind(&self) -> Kind {
        lookup(*self, |element| element.kind())
    }

    fn is_framebuffer_effect(&self) -> bool {
        lookup(*self, |element| element.is_framebuffer_effect())
    }
}

impl RenderElement<GlesRenderer> for KestrelRenderHandle {
    fn capture_framebuffer(
        &self,
        frame: &mut <GlesRenderer as smithay::backend::renderer::RendererSuper>::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        cache: &UserDataMap,
    ) -> Result<(), GlesError> {
        if let Some(element) = active_scratch_for_render()
            .and_then(|scratch| layer_element_for_handle(scratch, *self))
        {
            RenderElement::<GlesRenderer>::capture_framebuffer(
                &element, frame, src, dst, cache,
            )?;
        }
        Ok(())
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
        if let Some(element) = active_scratch_for_render()
            .and_then(|scratch| layer_element_for_handle(scratch, *self))
        {
            RenderElement::<GlesRenderer>::draw(
                &element, frame, src, dst, damage, opaque_regions, cache,
            )?;
        }
        Ok(())
    }

    fn underlying_storage(
        &self,
        _renderer: &mut GlesRenderer,
    ) -> Option<UnderlyingStorage<'_>> {
        None
    }
}

fn lookup<T>(handle: KestrelRenderHandle, f: impl FnOnce(SceneRenderElement<'_>) -> T) -> T
where
    T: Default,
{
    if let Some(scratch) = active_scratch_for_render()
        && let Some(element) = layer_element_for_handle(scratch, handle)
    {
        return f(element);
    }
    T::default()
}

fn static_handle_id() -> &'static Id {
    static ID: OnceLock<Id> = OnceLock::new();
    ID.get_or_init(Id::new)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::scene_render::WindowSceneLayer;

    #[test]
    fn handles_cover_layer_contents() {
        let mut scratch = SceneScratch::default();
        let window = WindowId(1);
        scratch.window_layers_by_id.insert(
            window,
            WindowSceneLayer {
                chrome: Vec::new(),
                surfaces: Vec::new(),
                blurs: Vec::new(),
            },
        );
        let layer = scratch.window_layers_by_id.get(&window).unwrap();
        assert!(KestrelRenderHandle::handles_for_layer(window, layer).is_empty());
    }
}
