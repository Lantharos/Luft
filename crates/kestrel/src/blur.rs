use std::{marker::PhantomData, sync::Mutex};

use smithay::{
    backend::{
        allocator::Fourcc,
        renderer::{
            Frame, FrameContext, Offscreen, Texture,
            element::{Element, Id, Kind, RenderElement},
            gles::{
                GlesError, GlesFrame, GlesRenderer, GlesTexProgram, GlesTexture, Uniform,
                UniformName, UniformType, ffi,
            },
            utils::{CommitCounter, DamageSet, OpaqueRegions, RendererSurfaceStateUserData},
        },
    },
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    utils::{
        Buffer, Logical, Physical, Point, Rectangle, Scale, Transform, user_data::UserDataMap,
    },
    wayland::{
        background_effect::BackgroundEffectSurfaceCachedState,
        compositor::{RectangleKind, with_states},
    },
};

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

const BLUR_SHADER: &str = r#"#version 100

//_DEFINES_

#if defined(EXTERNAL)
#extension GL_OES_EGL_image_external : require
#endif

precision highp float;
#if defined(EXTERNAL)
uniform samplerExternalOES tex;
#else
uniform sampler2D tex;
#endif

uniform float alpha;
uniform vec2 blur_step;
varying vec2 v_coords;

#if defined(DEBUG_FLAGS)
uniform float tint;
#endif

void main() {
    vec4 color = texture2D(tex, v_coords) * 0.20;
    color += texture2D(tex, v_coords + vec2( blur_step.x, 0.0)) * 0.10;
    color += texture2D(tex, v_coords + vec2(-blur_step.x, 0.0)) * 0.10;
    color += texture2D(tex, v_coords + vec2(0.0,  blur_step.y)) * 0.10;
    color += texture2D(tex, v_coords + vec2(0.0, -blur_step.y)) * 0.10;
    color += texture2D(tex, v_coords + blur_step) * 0.10;
    color += texture2D(tex, v_coords - blur_step) * 0.10;
    color += texture2D(tex, v_coords + vec2( blur_step.x, -blur_step.y)) * 0.10;
    color += texture2D(tex, v_coords + vec2(-blur_step.x,  blur_step.y)) * 0.10;
    color *= alpha;
#if defined(NO_ALPHA)
    color.a = alpha;
#endif
#if defined(DEBUG_FLAGS)
    if (tint == 1.0)
        color = vec4(0.0, 0.2, 0.0, 0.2) + color * 0.8;
#endif
    gl_FragColor = color;
}
"#;

#[derive(Debug)]
struct BlurCache {
    texture: Mutex<Option<GlesTexture>>,
    program: Mutex<Option<GlesTexProgram>>,
    transform: Mutex<Transform>,
}

impl Default for BlurCache {
    fn default() -> Self {
        Self {
            texture: Mutex::new(None),
            program: Mutex::new(None),
            transform: Mutex::new(Transform::Normal),
        }
    }
}

#[derive(Clone, Debug)]
pub struct BlurElement {
    id: Id,
    commit: CommitCounter,
    geometry: Rectangle<i32, Physical>,
    regions: Vec<Rectangle<i32, Physical>>,
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
    pub fn from_surface(
        surface: &WlSurface,
        location: Point<i32, Physical>,
        scale: Scale<f64>,
    ) -> Option<Self> {
        let (region, surface_size, commit) = with_states(surface, |states| {
            let region = states
                .cached_state
                .get::<BackgroundEffectSurfaceCachedState>()
                .current()
                .blur_region
                .clone()?;
            let renderer_state = states.data_map.get::<RendererSurfaceStateUserData>()?;
            let renderer_state = renderer_state.lock().unwrap();
            Some((
                region,
                renderer_state.surface_size()?,
                renderer_state.current_commit(),
            ))
        })?;

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
        let regions = logical_regions
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
        self.regions.iter().copied().collect()
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
        let texture = cache.texture.lock().unwrap().clone();
        let program = cache.program.lock().unwrap().clone();
        let transform = *cache.transform.lock().unwrap();
        let (Some(texture), Some(program)) = (texture, program) else {
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
        let size = texture.size();
        let blur_step = Uniform::new(
            "blur_step",
            (7.0 / size.w.max(1) as f32, 7.0 / size.h.max(1) as f32),
        );
        frame.render_texture_from_to(
            &texture,
            Rectangle::from_size(size).to_f64(),
            dst,
            &visible_damage,
            &[],
            transform,
            1.0,
            Some(&program),
            &[blur_step],
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
        let output_size = frame.output_size();
        let transform = frame.transformation();
        let framebuffer_rect = transform.transform_rect_in(dst, &output_size);
        let size = (framebuffer_rect.size.w, framebuffer_rect.size.h).into();
        *cache.transform.lock().unwrap() = transform;

        {
            let mut texture = cache.texture.lock().unwrap();
            if texture
                .as_ref()
                .is_none_or(|texture| texture.size() != size)
            {
                let mut renderer = frame.renderer();
                *texture = Some(renderer.as_mut().create_buffer(Fourcc::Argb8888, size)?);
            }
        }
        {
            let mut program = cache.program.lock().unwrap();
            if program.is_none() {
                let mut renderer = frame.renderer();
                *program = Some(renderer.as_mut().compile_custom_texture_shader(
                    BLUR_SHADER,
                    &[UniformName::new("blur_step", UniformType::_2f)],
                )?);
            }
        }

        let texture = cache.texture.lock().unwrap().clone().unwrap();
        frame.with_context(|gl| unsafe {
            gl.BindTexture(ffi::TEXTURE_2D, texture.tex_id());
            gl.CopyTexSubImage2D(
                ffi::TEXTURE_2D,
                0,
                0,
                0,
                framebuffer_rect.loc.x,
                transform.transform_size(output_size).h
                    - framebuffer_rect.loc.y
                    - framebuffer_rect.size.h,
                framebuffer_rect.size.w,
                framebuffer_rect.size.h,
            );
            gl.BindTexture(ffi::TEXTURE_2D, 0);
        })
    }
}
