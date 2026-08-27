use std::{cmp::max, sync::Mutex};

use smithay::{
    backend::{
        allocator::Fourcc,
        renderer::{
            ContextId, Offscreen, Renderer, Texture,
            gles::{GlesError, GlesRenderer, GlesTexture, ffi, link_program},
        },
    },
    utils::{Buffer, Size},
};

const PASSES: usize = 3;
const OFFSET: f32 = 3.0;

const VERTEX_SHADER: &str = r#"#version 100
attribute vec2 position;
varying vec2 uv;

void main() {
    uv = position;
    gl_Position = vec4(position * 2.0 - 1.0, 1.0, 1.0);
}
"#;

const DOWNSAMPLE_SHADER: &str = r#"#version 100
precision highp float;
varying vec2 uv;
uniform sampler2D image;
uniform vec2 half_pixel;
uniform float offset;

void main() {
    vec2 sample_offset = half_pixel * offset;
    vec4 color = texture2D(image, uv) * 4.0;
    color += texture2D(image, uv + vec2(-sample_offset.x, -sample_offset.y));
    color += texture2D(image, uv + vec2( sample_offset.x, -sample_offset.y));
    color += texture2D(image, uv + vec2(-sample_offset.x,  sample_offset.y));
    color += texture2D(image, uv + vec2( sample_offset.x,  sample_offset.y));
    gl_FragColor = color / 8.0;
}
"#;

const UPSAMPLE_SHADER: &str = r#"#version 100
precision highp float;
varying vec2 uv;
uniform sampler2D image;
uniform vec2 half_pixel;
uniform float offset;

void main() {
    vec2 sample_offset = half_pixel * offset;
    vec4 color = vec4(0.0);
    color += texture2D(image, uv + vec2(-sample_offset.x * 2.0, 0.0));
    color += texture2D(image, uv + vec2( sample_offset.x * 2.0, 0.0));
    color += texture2D(image, uv + vec2(0.0, -sample_offset.y * 2.0));
    color += texture2D(image, uv + vec2(0.0,  sample_offset.y * 2.0));
    color += texture2D(image, uv + vec2(-sample_offset.x,  sample_offset.y)) * 2.0;
    color += texture2D(image, uv + vec2( sample_offset.x,  sample_offset.y)) * 2.0;
    color += texture2D(image, uv + vec2(-sample_offset.x, -sample_offset.y)) * 2.0;
    color += texture2D(image, uv + vec2( sample_offset.x, -sample_offset.y)) * 2.0;
    gl_FragColor = color / 12.0;
}
"#;

#[derive(Clone, Copy, Debug)]
struct PassProgram {
    id: ffi::types::GLuint,
    image: ffi::types::GLint,
    half_pixel: ffi::types::GLint,
    offset: ffi::types::GLint,
    position: ffi::types::GLint,
}

impl PassProgram {
    unsafe fn compile(gl: &ffi::Gles2, fragment: &str) -> Result<Self, GlesError> {
        let id = unsafe { link_program(gl, VERTEX_SHADER, fragment)? };
        Ok(Self {
            id,
            image: unsafe { gl.GetUniformLocation(id, c"image".as_ptr()) },
            half_pixel: unsafe { gl.GetUniformLocation(id, c"half_pixel".as_ptr()) },
            offset: unsafe { gl.GetUniformLocation(id, c"offset".as_ptr()) },
            position: unsafe { gl.GetAttribLocation(id, c"position".as_ptr()) },
        })
    }
}

#[derive(Clone, Copy, Debug)]
struct Programs {
    downsample: PassProgram,
    upsample: PassProgram,
}

#[derive(Debug, Default)]
struct ProgramCache(Mutex<Option<Programs>>);

#[derive(Debug)]
pub struct BlurPipeline {
    context: ContextId<GlesTexture>,
    textures: Vec<GlesTexture>,
}

impl BlurPipeline {
    pub fn new(renderer: &mut GlesRenderer) -> Result<Self, GlesError> {
        if renderer
            .egl_context()
            .user_data()
            .get::<ProgramCache>()
            .is_none_or(|cache| cache.0.lock().unwrap().is_none())
        {
            let programs = renderer.with_context(|gl| unsafe {
                Ok::<_, GlesError>(Programs {
                    downsample: PassProgram::compile(gl, DOWNSAMPLE_SHADER)?,
                    upsample: PassProgram::compile(gl, UPSAMPLE_SHADER)?,
                })
            })??;
            let cache = renderer
                .egl_context()
                .user_data()
                .get_or_insert_threadsafe(ProgramCache::default);
            *cache.0.lock().unwrap() = Some(programs);
        }
        Ok(Self {
            context: renderer.context_id(),
            textures: Vec::new(),
        })
    }

    pub fn matches(&self, renderer: &GlesRenderer) -> bool {
        self.context == renderer.context_id()
    }

    pub fn prepare(
        &mut self,
        renderer: &mut GlesRenderer,
        source: &GlesTexture,
    ) -> Result<(), GlesError> {
        let source_size = source.size();
        if self
            .textures
            .first()
            .is_some_and(|texture| texture.size() != source_size)
        {
            self.textures.clear();
        }

        let mut width = source_size.w;
        let mut height = source_size.h;
        for index in 0..=PASSES {
            if self.textures.len() <= index {
                self.textures.push(
                    renderer.create_buffer(
                        Fourcc::Abgr8888,
                        Size::<i32, Buffer>::from((width, height)),
                    )?,
                );
            }
            width = max(1, width / 2);
            height = max(1, height / 2);
        }
        self.textures.truncate(PASSES + 1);
        Ok(())
    }

    pub fn render(
        &mut self,
        renderer: &mut GlesRenderer,
        source: &GlesTexture,
    ) -> Result<GlesTexture, GlesError> {
        let programs = renderer
            .egl_context()
            .user_data()
            .get::<ProgramCache>()
            .and_then(|cache| *cache.0.lock().unwrap())
            .ok_or(GlesError::BlitError)?;
        let down_steps = (0..PASSES)
            .map(|index| {
                let source = if index == 0 {
                    source
                } else {
                    &self.textures[index]
                };
                (source.clone(), self.textures[index + 1].clone())
            })
            .collect::<Vec<_>>();
        let up_steps = (0..PASSES)
            .rev()
            .map(|index| {
                (
                    self.textures[index + 1].clone(),
                    self.textures[index].clone(),
                )
            })
            .collect::<Vec<_>>();

        renderer.with_context(|gl| unsafe {
            while gl.GetError() != ffi::NO_ERROR {}
            gl.Disable(ffi::BLEND);
            gl.Disable(ffi::SCISSOR_TEST);
            gl.ActiveTexture(ffi::TEXTURE0);

            let mut framebuffer = 0;
            gl.GenFramebuffers(1, &mut framebuffer);
            gl.BindFramebuffer(ffi::FRAMEBUFFER, framebuffer);

            let vertices = [
                0.0_f32, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0,
            ];
            let result = draw_steps(gl, &programs.downsample, &vertices, &down_steps, true)
                .and_then(|()| draw_steps(gl, &programs.upsample, &vertices, &up_steps, false));

            gl.BindTexture(ffi::TEXTURE_2D, 0);
            gl.BindFramebuffer(ffi::FRAMEBUFFER, 0);
            gl.DeleteFramebuffers(1, &framebuffer);

            result?;
            (gl.GetError() == ffi::NO_ERROR)
                .then_some(())
                .ok_or(GlesError::BlitError)
        })??;

        Ok(self.textures[0].clone())
    }
}

unsafe fn draw_steps(
    gl: &ffi::Gles2,
    program: &PassProgram,
    vertices: &[f32; 12],
    steps: &[(GlesTexture, GlesTexture)],
    downsampling: bool,
) -> Result<(), GlesError> {
    unsafe {
        gl.UseProgram(program.id);
        gl.Uniform1i(program.image, 0);
        gl.Uniform1f(program.offset, OFFSET);
        gl.EnableVertexAttribArray(program.position as u32);
        gl.BindBuffer(ffi::ARRAY_BUFFER, 0);
        gl.VertexAttribPointer(
            program.position as u32,
            2,
            ffi::FLOAT,
            ffi::FALSE,
            0,
            vertices.as_ptr().cast(),
        );

        for (source, destination) in steps {
            let destination_size = destination.size();
            let sample_size = if downsampling {
                destination_size
            } else {
                source.size()
            };
            gl.Viewport(0, 0, destination_size.w, destination_size.h);
            gl.Uniform2f(
                program.half_pixel,
                0.5 / sample_size.w.max(1) as f32,
                0.5 / sample_size.h.max(1) as f32,
            );
            gl.FramebufferTexture2D(
                ffi::FRAMEBUFFER,
                ffi::COLOR_ATTACHMENT0,
                ffi::TEXTURE_2D,
                destination.tex_id(),
                0,
            );
            if gl.CheckFramebufferStatus(ffi::FRAMEBUFFER) != ffi::FRAMEBUFFER_COMPLETE {
                gl.DisableVertexAttribArray(program.position as u32);
                return Err(GlesError::BlitError);
            }
            gl.BindTexture(ffi::TEXTURE_2D, source.tex_id());
            gl.TexParameteri(ffi::TEXTURE_2D, ffi::TEXTURE_MIN_FILTER, ffi::LINEAR as i32);
            gl.TexParameteri(ffi::TEXTURE_2D, ffi::TEXTURE_MAG_FILTER, ffi::LINEAR as i32);
            gl.TexParameteri(
                ffi::TEXTURE_2D,
                ffi::TEXTURE_WRAP_S,
                ffi::CLAMP_TO_EDGE as i32,
            );
            gl.TexParameteri(
                ffi::TEXTURE_2D,
                ffi::TEXTURE_WRAP_T,
                ffi::CLAMP_TO_EDGE as i32,
            );
            gl.DrawArrays(ffi::TRIANGLES, 0, 6);
        }

        gl.DisableVertexAttribArray(program.position as u32);
        Ok(())
    }
}
