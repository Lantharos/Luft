use super::BLUR_SHADER;
use smithay::{
    backend::{
        allocator::Fourcc,
        renderer::{
            Offscreen,
            gles::{
                GlesError, GlesRenderer, GlesTexProgram, GlesTexture, UniformName, UniformType,
            },
        },
    },
    utils::{Buffer, Physical, Size},
};

pub(super) struct BlurInner {
    pub capture: GlesTexture,
    pub scratch: GlesTexture,
    pub blurred: GlesTexture,
    pub output: GlesTexture,
    pub intermediate: Option<GlesTexture>,
    pub program: Option<GlesTexProgram>,
    pub texture_size: Size<i32, Physical>,
    pub capture_size: Size<i32, Physical>,
    pub backdrop_generation: Option<u64>,
}

impl BlurInner {
    pub fn new(
        renderer: &mut GlesRenderer,
        texture_size: Size<i32, Physical>,
        capture_size: Size<i32, Physical>,
    ) -> Result<Self, GlesError> {
        Ok(Self {
            capture: texture(renderer, capture_size)?,
            scratch: texture(renderer, capture_size)?,
            blurred: texture(renderer, capture_size)?,
            output: texture(renderer, texture_size)?,
            intermediate: None,
            program: None,
            texture_size,
            capture_size,
            backdrop_generation: None,
        })
    }

    pub fn program(&mut self, renderer: &mut GlesRenderer) -> Result<GlesTexProgram, GlesError> {
        if let Some(program) = &self.program {
            return Ok(program.clone());
        }
        let program = renderer.compile_custom_texture_shader(
            BLUR_SHADER,
            &[
                UniformName::new("texel", UniformType::_2f),
                UniformName::new("target_size", UniformType::_2f),
                UniformName::new("radius", UniformType::_1f),
                UniformName::new("shape", UniformType::_1f),
                UniformName::new("direction", UniformType::_2f),
                UniformName::new("final_pass", UniformType::_1f),
                UniformName::new("mask_pass", UniformType::_1f),
            ],
        )?;
        self.program = Some(program.clone());
        Ok(program)
    }
}

fn texture(
    renderer: &mut GlesRenderer,
    size: Size<i32, Physical>,
) -> Result<GlesTexture, GlesError> {
    renderer.create_buffer(
        Fourcc::Abgr8888,
        Size::<i32, Buffer>::from((size.w, size.h)),
    )
}
