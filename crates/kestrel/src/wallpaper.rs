use luft_config::CompositorConfig;
use smithay::{
    backend::{
        allocator::Fourcc,
        renderer::{
            ImportMem, Renderer,
            element::{Kind, memory::MemoryRenderBuffer, memory::MemoryRenderBufferRenderElement},
        },
    },
    output::Output,
    utils::{Buffer, Logical, Rectangle, Size, Transform},
};
use tracing::warn;

const DEFAULT_WALLPAPER: &[u8] = include_bytes!("../resources/default-wallpaper.jpg");

#[derive(Debug, Clone)]
pub struct Wallpaper {
    buffer: MemoryRenderBuffer,
    size: Size<i32, Buffer>,
}

impl Wallpaper {
    pub fn load(config: &CompositorConfig) -> Self {
        if let Some(path) = config.background_image.as_deref() {
            match image::open(path) {
                Ok(image) => return Self::from_image(image),
                Err(error) => {
                    warn!(path = %path.display(), %error, "failed to load wallpaper; using packaged default")
                }
            }
        }

        let image = image::load_from_memory(DEFAULT_WALLPAPER)
            .expect("packaged default wallpaper must be a valid image");
        Self::from_image(image)
    }

    pub fn render_element<R>(
        &self,
        renderer: &mut R,
        output: &Output,
    ) -> Result<MemoryRenderBufferRenderElement<R>, R::Error>
    where
        R: Renderer + ImportMem,
        R::TextureId: Send + Clone + 'static,
    {
        let mode = output.current_mode().expect("output must have a mode");
        let scale = output.current_scale().fractional_scale();
        let target = output
            .current_transform()
            .transform_size(mode.size)
            .to_f64()
            .to_logical(scale)
            .to_i32_round();
        let src = cover_crop(self.size, target);

        MemoryRenderBufferRenderElement::from_buffer(
            renderer,
            (0.0, 0.0),
            &self.buffer,
            None,
            Some(src),
            Some(target),
            Kind::Unspecified,
        )
    }

    fn from_image(image: image::DynamicImage) -> Self {
        let pixels = image.into_rgba8();
        let size = Size::from((pixels.width() as i32, pixels.height() as i32));
        let opaque = Rectangle::from_size(size);
        let buffer = MemoryRenderBuffer::from_slice(
            pixels.as_raw(),
            Fourcc::Abgr8888,
            size,
            1,
            Transform::Normal,
            Some(vec![opaque]),
        );
        Self { buffer, size }
    }
}

fn cover_crop(source: Size<i32, Buffer>, target: Size<i32, Logical>) -> Rectangle<f64, Logical> {
    let source_width = f64::from(source.w);
    let source_height = f64::from(source.h);
    let target_ratio = f64::from(target.w) / f64::from(target.h);
    let source_ratio = source_width / source_height;

    if source_ratio > target_ratio {
        let width = source_height * target_ratio;
        Rectangle::new(
            ((source_width - width) / 2.0, 0.0).into(),
            (width, source_height).into(),
        )
    } else {
        let height = source_width / target_ratio;
        Rectangle::new(
            (0.0, (source_height - height) / 2.0).into(),
            (source_width, height).into(),
        )
    }
}
