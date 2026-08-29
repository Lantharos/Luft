use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
    marker::PhantomData,
    sync::Mutex,
};

use smithay::{
    backend::{
        allocator::Fourcc,
        renderer::{
            Bind, BlitFrame, Frame, FrameContext, Offscreen, Texture, TextureFilter,
            element::{Element, Id, Kind, RenderElement},
            gles::{GlesError, GlesFrame, GlesRenderer, GlesTexture},
            utils::{CommitCounter, DamageSet, OpaqueRegions, RendererSurfaceStateUserData},
        },
    },
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    utils::{Buffer, Logical, Physical, Point, Rectangle, Scale, user_data::UserDataMap},
    wayland::{
        alpha_modifier::AlphaModifierSurfaceCachedState,
        background_effect::BackgroundEffectSurfaceCachedState,
        compositor::{RectangleKind, with_states},
    },
};

use crate::blur_pipeline::BlurPipeline;

pub trait BlurRenderer: smithay::backend::renderer::Renderer {
    fn draw_blur(
        element: &BlurElement,
        frame: &mut Self::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
        cache: Option<&UserDataMap>,
    ) -> Result<(), Self::Error>;

    fn capture_blur(
        element: &BlurElement,
        frame: &mut Self::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        cache: &UserDataMap,
    ) -> Result<(), Self::Error>;
}

impl BlurRenderer for GlesRenderer {
    fn draw_blur(
        element: &BlurElement,
        frame: &mut Self::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
        cache: Option<&UserDataMap>,
    ) -> Result<(), Self::Error> {
        RenderElement::<GlesRenderer>::draw(element, frame, src, dst, damage, opaque_regions, cache)
    }

    fn capture_blur(
        element: &BlurElement,
        frame: &mut Self::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        cache: &UserDataMap,
    ) -> Result<(), Self::Error> {
        RenderElement::<GlesRenderer>::capture_framebuffer(element, frame, src, dst, cache)
    }
}

#[cfg(feature = "session-backend")]
impl<'render, 'target> BlurRenderer
    for smithay::backend::renderer::multigpu::MultiRenderer<
        'render,
        'target,
        smithay::backend::renderer::multigpu::gbm::GbmGlesBackend<
            GlesRenderer,
            smithay::backend::drm::DrmDeviceFd,
        >,
        smithay::backend::renderer::multigpu::gbm::GbmGlesBackend<
            GlesRenderer,
            smithay::backend::drm::DrmDeviceFd,
        >,
    >
{
    fn draw_blur(
        element: &BlurElement,
        frame: &mut Self::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
        cache: Option<&UserDataMap>,
    ) -> Result<(), Self::Error> {
        RenderElement::<GlesRenderer>::draw(
            element,
            frame.as_mut(),
            src,
            dst,
            damage,
            opaque_regions,
            cache,
        )
        .map_err(smithay::backend::renderer::multigpu::Error::Render)
    }

    fn capture_blur(
        element: &BlurElement,
        frame: &mut Self::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        cache: &UserDataMap,
    ) -> Result<(), Self::Error> {
        RenderElement::<GlesRenderer>::capture_framebuffer(element, frame.as_mut(), src, dst, cache)
            .map_err(smithay::backend::renderer::multigpu::Error::Render)
    }
}

#[derive(Debug)]
struct BlurCache {
    inner: Mutex<BlurCacheInner>,
}

impl Default for BlurCache {
    fn default() -> Self {
        Self {
            inner: Mutex::new(BlurCacheInner::default()),
        }
    }
}

#[derive(Debug, Default)]
struct BlurCacheInner {
    framebuffer: Option<GlesTexture>,
    blurred: Option<GlesTexture>,
    pipeline: Option<BlurPipeline>,
}

#[derive(Debug, Default)]
struct BlurCommitState(Mutex<(u64, CommitCounter)>);

#[derive(Clone, Debug)]
pub struct BlurElement {
    id: Id,
    commit: CommitCounter,
    geometry: Rectangle<i32, Physical>,
    regions: Vec<Rectangle<i32, Physical>>,
    alpha: f32,
}

#[derive(Clone, Debug)]
pub struct BlurRenderElement<R: smithay::backend::renderer::Renderer> {
    inner: BlurElement,
    renderer: PhantomData<fn() -> R>,
}

impl<R: smithay::backend::renderer::Renderer> From<BlurElement> for BlurRenderElement<R> {
    fn from(inner: BlurElement) -> Self {
        Self {
            inner,
            renderer: PhantomData,
        }
    }
}

impl<R: smithay::backend::renderer::Renderer> Element for BlurRenderElement<R> {
    fn id(&self) -> &Id {
        self.inner.id()
    }

    fn current_commit(&self) -> CommitCounter {
        self.inner.current_commit()
    }

    fn src(&self) -> Rectangle<f64, Buffer> {
        self.inner.src()
    }

    fn geometry(&self, scale: Scale<f64>) -> Rectangle<i32, Physical> {
        self.inner.geometry(scale)
    }

    fn damage_since(
        &self,
        scale: Scale<f64>,
        commit: Option<CommitCounter>,
    ) -> DamageSet<i32, Physical> {
        self.inner.damage_since(scale, commit)
    }

    fn opaque_regions(&self, scale: Scale<f64>) -> OpaqueRegions<i32, Physical> {
        self.inner.opaque_regions(scale)
    }

    fn kind(&self) -> Kind {
        self.inner.kind()
    }

    fn is_framebuffer_effect(&self) -> bool {
        true
    }
}

impl<R> RenderElement<R> for BlurRenderElement<R>
where
    R: BlurRenderer,
{
    fn draw(
        &self,
        frame: &mut R::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
        cache: Option<&UserDataMap>,
    ) -> Result<(), R::Error> {
        R::draw_blur(&self.inner, frame, src, dst, damage, opaque_regions, cache)
    }

    fn capture_framebuffer(
        &self,
        frame: &mut R::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        cache: &UserDataMap,
    ) -> Result<(), R::Error> {
        R::capture_blur(&self.inner, frame, src, dst, cache)
    }
}

impl BlurElement {
    pub fn from_geometry(
        id: Id,
        geometry: Rectangle<i32, Physical>,
        regions: Vec<Rectangle<i32, Physical>>,
    ) -> Self {
        Self {
            id: id.namespaced(0x53_53_44_42),
            commit: CommitCounter::default(),
            geometry,
            regions,
            alpha: 1.0,
        }
    }

    pub fn from_surface(
        surface: &WlSurface,
        location: Point<i32, Physical>,
        scale: Scale<f64>,
    ) -> Option<Self> {
        let (region, surface_size, commit, alpha) = with_states(surface, |states| {
            let region = states
                .cached_state
                .get::<BackgroundEffectSurfaceCachedState>()
                .current()
                .blur_region
                .clone()?;
            let renderer_state = states.data_map.get::<RendererSurfaceStateUserData>()?;
            let renderer_state = renderer_state.lock().unwrap();
            let surface_size = renderer_state.surface_size()?;
            let alpha = states
                .cached_state
                .get::<AlphaModifierSurfaceCachedState>()
                .current()
                .multiplier_f32()
                .unwrap_or(1.0);
            let mut hasher = DefaultHasher::new();
            surface_size.w.hash(&mut hasher);
            surface_size.h.hash(&mut hasher);
            for (kind, rect) in &region.rects {
                match kind {
                    RectangleKind::Add => 1_u8,
                    RectangleKind::Subtract => 2_u8,
                }
                .hash(&mut hasher);
                rect.loc.x.hash(&mut hasher);
                rect.loc.y.hash(&mut hasher);
                rect.size.w.hash(&mut hasher);
                rect.size.h.hash(&mut hasher);
            }
            let signature = hasher.finish();
            let commit_state = states.data_map.get_or_insert(BlurCommitState::default);
            let mut commit_state = commit_state.0.lock().unwrap();
            if commit_state.0 != signature {
                commit_state.0 = signature;
                commit_state.1.increment();
            }
            Some((region, surface_size, commit_state.1, alpha))
        })?;

        if alpha <= f32::EPSILON {
            return None;
        }

        let clip = Rectangle::from_size(surface_size);
        let mut logical_regions = Vec::<Rectangle<i32, Logical>>::new();
        for (kind, rect) in region.rects {
            let Some(rect) = rect.intersection(clip) else {
                continue;
            };
            match kind {
                RectangleKind::Add => {
                    let additions = rect.subtract_rects(logical_regions.iter().copied());
                    logical_regions.extend(additions);
                }
                RectangleKind::Subtract => {
                    logical_regions = Rectangle::subtract_rects_many(logical_regions, [rect]);
                }
            }
        }
        let logical_bounds = logical_regions.iter().copied().reduce(Rectangle::merge)?;
        let mut geometry = logical_bounds.to_physical_precise_round(scale);
        geometry.loc += location;
        let regions: Vec<Rectangle<i32, Physical>> = logical_regions
            .into_iter()
            .map(|rect| {
                let mut rect = rect.to_physical_precise_round(scale);
                rect.loc += location - geometry.loc;
                rect
            })
            .collect();

        Some(Self {
            id: Id::from(surface).namespaced(0x4c_55_46_54),
            commit,
            geometry,
            regions,
            alpha,
        })
    }

    pub fn surface_id(surface: &WlSurface) -> Id {
        Id::from(surface)
    }
}

impl Element for BlurElement {
    fn id(&self) -> &Id {
        &self.id
    }

    fn current_commit(&self) -> CommitCounter {
        self.commit
    }

    fn src(&self) -> Rectangle<f64, Buffer> {
        Rectangle::from_size((self.geometry.size.w as f64, self.geometry.size.h as f64).into())
    }

    fn geometry(&self, _scale: Scale<f64>) -> Rectangle<i32, Physical> {
        self.geometry
    }

    fn damage_since(
        &self,
        _scale: Scale<f64>,
        commit: Option<CommitCounter>,
    ) -> DamageSet<i32, Physical> {
        if commit == Some(self.commit) {
            DamageSet::default()
        } else {
            self.regions.iter().copied().collect()
        }
    }

    fn opaque_regions(&self, _scale: Scale<f64>) -> OpaqueRegions<i32, Physical> {
        OpaqueRegions::default()
    }

    fn alpha(&self) -> f32 {
        self.alpha
    }

    fn kind(&self) -> Kind {
        Kind::Unspecified
    }

    fn is_framebuffer_effect(&self) -> bool {
        true
    }
}

impl RenderElement<GlesRenderer> for BlurElement {
    fn draw(
        &self,
        frame: &mut GlesFrame<'_, '_>,
        _src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        _opaque_regions: &[Rectangle<i32, Physical>],
        cache: Option<&UserDataMap>,
    ) -> Result<(), GlesError> {
        let Some(cache) = cache.and_then(UserDataMap::get::<BlurCache>) else {
            return Ok(());
        };
        let texture = cache.inner.lock().unwrap().blurred.clone();
        let Some(texture) = texture else {
            return Ok(());
        };

        let visible_damage = self
            .regions
            .iter()
            .flat_map(|region| {
                damage
                    .iter()
                    .filter_map(|damage| region.intersection(*damage))
            })
            .collect::<Vec<_>>();
        if visible_damage.is_empty() {
            return Ok(());
        }
        frame.render_texture_from_to(
            &texture,
            Rectangle::from_size(texture.size()).to_f64(),
            dst,
            &visible_damage,
            &[],
            frame.transformation().invert(),
            self.alpha,
            None,
            &[],
        )
    }

    fn capture_framebuffer(
        &self,
        frame: &mut GlesFrame<'_, '_>,
        _src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        cache: &UserDataMap,
    ) -> Result<(), GlesError> {
        let cache = cache.get_or_insert(BlurCache::default);
        let output_rect = Rectangle::from_size(frame.output_size());
        let transform = frame.transformation();
        let Some(clamped_dst) = dst.intersection(output_rect) else {
            return Ok(());
        };
        let framebuffer_rect = transform.transform_rect_in(clamped_dst, &output_rect.size);
        let size = (framebuffer_rect.size.w, framebuffer_rect.size.h).into();

        let mut texture = {
            let mut cache = cache.inner.lock().unwrap();
            if cache
                .framebuffer
                .as_ref()
                .is_none_or(|texture| texture.size() != size)
            {
                let mut renderer = frame.renderer();
                cache.framebuffer = Some(renderer.as_mut().create_buffer(Fourcc::Abgr8888, size)?);
            }
            let mut renderer = frame.renderer();
            if cache
                .pipeline
                .as_ref()
                .is_none_or(|pipeline| !pipeline.matches(renderer.as_ref()))
            {
                cache.pipeline = Some(BlurPipeline::new(renderer.as_mut())?);
            }
            let texture = cache.framebuffer.clone().unwrap();
            cache
                .pipeline
                .as_mut()
                .unwrap()
                .prepare(renderer.as_mut(), &texture)?;
            texture
        };

        let mut renderer = frame.renderer();
        let mut target = renderer.as_mut().bind(&mut texture)?;
        drop(renderer);
        let sync = frame.blit_to(
            &mut target,
            framebuffer_rect,
            Rectangle::from_size(framebuffer_rect.size),
            TextureFilter::Linear,
        )?;
        frame.wait(&sync)?;
        drop(target);

        let mut cache = cache.inner.lock().unwrap();
        let mut renderer = frame.renderer();
        cache.blurred = Some(
            cache
                .pipeline
                .as_mut()
                .unwrap()
                .render(renderer.as_mut(), &texture)?,
        );
        Ok(())
    }
}
