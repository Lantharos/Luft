use glam::{Mat3, Vec2};
use smithay::{
    backend::renderer::{
        ImportAll, Renderer, buffer_y_inverted,
        element::{
            Element, Kind, RenderElement, UnderlyingStorage, surface::WaylandSurfaceRenderElement,
        },
        gles::{
            GlesError, GlesRenderer, GlesTexProgram, Uniform, UniformName, UniformType,
            UniformValue,
        },
        utils::{CommitCounter, DamageSet, OpaqueRegions},
    },
    utils::{Buffer, Logical, Physical, Rectangle, Scale, Transform, user_data::UserDataMap},
};

#[derive(Debug)]
struct RoundedShader(GlesTexProgram);

pub trait RoundedRenderer: Renderer + ImportAll {
    fn rounded_program(&mut self) -> Result<GlesTexProgram, Self::Error>;

    fn draw_rounded(
        element: &RoundedSurfaceRenderElement<Self>,
        frame: &mut Self::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
        cache: Option<&UserDataMap>,
    ) -> Result<(), Self::Error>
    where
        Self: Sized;
}

impl RoundedRenderer for GlesRenderer {
    fn rounded_program(&mut self) -> Result<GlesTexProgram, Self::Error> {
        rounded_program(self)
    }

    fn draw_rounded(
        element: &RoundedSurfaceRenderElement<Self>,
        frame: &mut Self::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
        cache: Option<&UserDataMap>,
    ) -> Result<(), Self::Error> {
        frame.override_default_tex_program(element.program.clone(), element.uniforms());
        let result = RenderElement::<GlesRenderer>::draw(
            &element.inner,
            frame,
            src,
            dst,
            damage,
            opaque_regions,
            cache,
        );
        frame.clear_tex_program_override();
        result
    }
}

#[cfg(feature = "session-backend")]
impl<'render, 'target> RoundedRenderer
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
    fn rounded_program(&mut self) -> Result<GlesTexProgram, Self::Error> {
        rounded_program(self.as_mut()).map_err(smithay::backend::renderer::multigpu::Error::Render)
    }

    fn draw_rounded(
        element: &RoundedSurfaceRenderElement<Self>,
        frame: &mut Self::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
        cache: Option<&UserDataMap>,
    ) -> Result<(), Self::Error> {
        frame
            .as_mut()
            .override_default_tex_program(element.program.clone(), element.uniforms());
        let result = RenderElement::<Self>::draw(
            &element.inner,
            frame,
            src,
            dst,
            damage,
            opaque_regions,
            cache,
        );
        frame.as_mut().clear_tex_program_override();
        result
    }
}

fn rounded_program(renderer: &mut GlesRenderer) -> Result<GlesTexProgram, GlesError> {
    if let Some(shader) = renderer.egl_context().user_data().get::<RoundedShader>() {
        return Ok(shader.0.clone());
    }

    let program = renderer.compile_custom_texture_shader(
        include_str!("shaders/rounded_surface.frag"),
        &[
            UniformName::new("output_scale", UniformType::_1f),
            UniformName::new("geometry_size", UniformType::_2f),
            UniformName::new("corner_radius", UniformType::_4f),
            UniformName::new("input_to_geometry", UniformType::Matrix3x3),
        ],
    )?;
    renderer
        .egl_context()
        .user_data()
        .insert_if_missing(|| RoundedShader(program.clone()));
    Ok(program)
}

#[derive(Debug)]
pub struct RoundedSurfaceRenderElement<R: Renderer> {
    inner: WaylandSurfaceRenderElement<R>,
    program: GlesTexProgram,
    geometry: Rectangle<f64, Logical>,
    corner_radius: [f32; 4],
    scale: f32,
}

impl<R: RoundedRenderer> RoundedSurfaceRenderElement<R> {
    pub fn new(
        inner: WaylandSurfaceRenderElement<R>,
        program: GlesTexProgram,
        geometry: Rectangle<f64, Logical>,
        corner_radius: [f32; 4],
        scale: Scale<f64>,
    ) -> Self {
        Self {
            inner,
            program,
            geometry,
            corner_radius,
            scale: scale.x as f32,
        }
    }

    fn uniforms(&self) -> Vec<Uniform<'static>> {
        let scale = Scale::from(self.scale as f64);
        let element_geometry = self.inner.geometry(scale);
        let element_location =
            Vec2::new(element_geometry.loc.x as f32, element_geometry.loc.y as f32);
        let element_size = Vec2::new(
            element_geometry.size.w as f32,
            element_geometry.size.h as f32,
        );
        let geometry = self.geometry.to_physical_precise_round(scale);
        let geometry_location = Vec2::new(geometry.loc.x, geometry.loc.y);
        let geometry_size = Vec2::new(geometry.size.w, geometry.size.h);
        let buffer_size = self.inner.buffer_size();
        let buffer_size = Vec2::new(buffer_size.w as f32, buffer_size.h as f32);
        let view = self.inner.view();
        let source_location = Vec2::new(view.src.loc.x as f32, view.src.loc.y as f32);
        let source_size = Vec2::new(view.src.size.w as f32, view.src.size.h as f32);
        let transform = match self.inner.transform() {
            Transform::_90 => Transform::_270,
            Transform::_270 => Transform::_90,
            transform => transform,
        };
        let [m00, m01, m10, m11, tx, ty] = transform.matrix().to_cols_array();
        let transform = Mat3::from_translation(Vec2::splat(0.5))
            * Mat3::from_cols_array(&[m00, m01, 0.0, m10, m11, 0.0, tx, ty, 1.0])
            * Mat3::from_translation(Vec2::splat(-0.5));
        let y_invert = if buffer_y_inverted(self.inner.buffer()).unwrap_or(false) {
            Mat3::from_scale(Vec2::new(1.0, -1.0))
        } else {
            Mat3::IDENTITY
        };
        let input_to_geometry = transform
            * Mat3::from_scale(element_size / geometry_size)
            * Mat3::from_translation((element_location - geometry_location) / element_size)
            * Mat3::from_scale(buffer_size / source_size)
            * Mat3::from_translation(-source_location / buffer_size)
            * y_invert;

        vec![
            Uniform::new("output_scale", self.scale),
            Uniform::new(
                "geometry_size",
                (self.geometry.size.w as f32, self.geometry.size.h as f32),
            ),
            Uniform::new("corner_radius", self.corner_radius),
            Uniform::new(
                "input_to_geometry",
                UniformValue::Matrix3x3 {
                    matrices: vec![input_to_geometry.to_cols_array()],
                    transpose: false,
                },
            ),
        ]
    }
}

impl<R: RoundedRenderer> Element for RoundedSurfaceRenderElement<R> {
    fn id(&self) -> &smithay::backend::renderer::element::Id {
        self.inner.id()
    }

    fn current_commit(&self) -> CommitCounter {
        self.inner.current_commit()
    }

    fn geometry(&self, scale: Scale<f64>) -> Rectangle<i32, Physical> {
        self.inner.geometry(scale)
    }

    fn src(&self) -> Rectangle<f64, Buffer> {
        self.inner.src()
    }

    fn transform(&self) -> Transform {
        self.inner.transform()
    }

    fn damage_since(
        &self,
        scale: Scale<f64>,
        commit: Option<CommitCounter>,
    ) -> DamageSet<i32, Physical> {
        let mut clip = self.geometry.to_physical_precise_round(scale);
        clip.loc -= self.geometry(scale).loc;
        self.inner
            .damage_since(scale, commit)
            .into_iter()
            .filter_map(|damage| damage.intersection(clip))
            .collect()
    }

    fn opaque_regions(&self, scale: Scale<f64>) -> OpaqueRegions<i32, Physical> {
        let mut clip = self.geometry.to_physical_precise_round(scale);
        clip.loc -= self.geometry(scale).loc;
        let regions = self
            .inner
            .opaque_regions(scale)
            .into_iter()
            .filter_map(|region| region.intersection(clip));
        let corners = rounded_corner_bounds(self.geometry, self.corner_radius).map(|corner| {
            let mut corner = corner.to_physical_precise_up(scale);
            corner.loc -= self.geometry(scale).loc;
            corner
        });
        OpaqueRegions::from_slice(&Rectangle::subtract_rects_many(regions, corners))
    }

    fn alpha(&self) -> f32 {
        self.inner.alpha()
    }

    fn kind(&self) -> Kind {
        self.inner.kind()
    }
}

impl<R: RoundedRenderer> RenderElement<R> for RoundedSurfaceRenderElement<R> {
    fn draw(
        &self,
        frame: &mut R::Frame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
        cache: Option<&UserDataMap>,
    ) -> Result<(), R::Error> {
        R::draw_rounded(self, frame, src, dst, damage, opaque_regions, cache)
    }

    fn underlying_storage(&self, _renderer: &mut R) -> Option<UnderlyingStorage<'_>> {
        None
    }
}

fn rounded_corner_bounds(
    geometry: Rectangle<f64, Logical>,
    radius: [f32; 4],
) -> [Rectangle<f64, Logical>; 4] {
    let [top_left, top_right, bottom_right, bottom_left] = radius.map(f64::from);
    [
        Rectangle::new(geometry.loc, (top_left, top_left).into()),
        Rectangle::new(
            (geometry.loc.x + geometry.size.w - top_right, geometry.loc.y).into(),
            (top_right, top_right).into(),
        ),
        Rectangle::new(
            (
                geometry.loc.x + geometry.size.w - bottom_right,
                geometry.loc.y + geometry.size.h - bottom_right,
            )
                .into(),
            (bottom_right, bottom_right).into(),
        ),
        Rectangle::new(
            (
                geometry.loc.x,
                geometry.loc.y + geometry.size.h - bottom_left,
            )
                .into(),
            (bottom_left, bottom_left).into(),
        ),
    ]
}
