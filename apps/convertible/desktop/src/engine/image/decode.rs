use std::fs::File;
use std::io::{BufReader, Read};
use std::path::Path;
use std::sync::{LazyLock, Mutex};

use gio::glib;
use glycin::{Loader, MemoryFormat, MemoryFormatSelection};
use image::codecs::gif::GifDecoder;
use image::{
    AnimationDecoder, DynamicImage, Frames, ImageDecoder, ImageReader, Limits, RgbImage, RgbaImage,
};

use crate::engine::error::{Failure, Result};
use crate::engine::formats::Format;

#[derive(Default)]
pub struct Metadata {
    pub icc: Option<Vec<u8>>,
    pub exif: Option<Vec<u8>>,
}

static MAIN_CONTEXT: Mutex<()> = Mutex::new(());
static RUNTIME: LazyLock<tokio::runtime::Runtime> = LazyLock::new(|| {
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .enable_all()
        .build()
        .expect("a small runtime always starts")
});

pub struct Decoded {
    pub image: DynamicImage,
    pub metadata: Metadata,
}

const NATIVE: &[&str] = &[
    "png", "jpeg", "webp", "gif", "tiff", "bmp", "ico", "tga", "qoi", "pnm", "exr", "hdr", "dds",
];
const SVG_DPI: f32 = 96.0;
const SVG_FLOOR: f32 = 1024.0;

pub fn decode(path: &Path, format: &Format) -> Result<Decoded> {
    match format.id {
        "svg" => rasterize_svg(path).map(|image| Decoded {
            image,
            metadata: Metadata::default(),
        }),
        id if NATIVE.contains(&id) => native(path).or_else(|_| sandboxed(path)),
        _ => sandboxed(path),
    }
}

fn native(path: &Path) -> Result<Decoded> {
    let mut reader = ImageReader::open(path)?.with_guessed_format()?;
    reader.limits(Limits::no_limits());
    let mut decoder = reader.into_decoder().map_err(Failure::damaged)?;
    let orientation = decoder.orientation().map_err(Failure::damaged)?;
    let metadata = Metadata {
        icc: decoder.icc_profile().ok().flatten(),
        exif: decoder.exif_metadata().ok().flatten(),
    };
    let mut image = DynamicImage::from_decoder(decoder).map_err(Failure::damaged)?;
    image.apply_orientation(orientation);
    Ok(Decoded { image, metadata })
}

fn sandboxed(path: &Path) -> Result<Decoded> {
    let file = gio::File::for_path(path);
    glycin_block_on(async move {
        let mut loader = Loader::new(file);
        loader.accepted_memory_formats(
            MemoryFormatSelection::R8g8b8 | MemoryFormatSelection::R8g8b8a8,
        );
        let mut image = loader.load().await.map_err(Failure::damaged)?;
        let exif = image.details().metadata_exif().map(<[u8]>::to_vec);
        let frame = image.next_frame().await.map_err(Failure::damaged)?;
        let image = from_frame(&frame)?;
        Ok(Decoded {
            image,
            metadata: Metadata { icc: None, exif },
        })
    })
}

fn from_frame(frame: &glycin::Frame) -> Result<DynamicImage> {
    let (width, height, stride) = (frame.width(), frame.height(), frame.stride() as usize);
    let channels = if frame.memory_format() == MemoryFormat::R8g8b8a8 {
        4
    } else {
        3
    };
    let row = width as usize * channels;
    let mut pixels = Vec::with_capacity(row * height as usize);
    for line in frame.buf_slice().chunks(stride).take(height as usize) {
        pixels.extend_from_slice(&line[..row]);
    }
    let damaged = || Failure::damaged("frame size");
    if channels == 4 {
        RgbaImage::from_raw(width, height, pixels)
            .map(DynamicImage::ImageRgba8)
            .ok_or_else(damaged)
    } else {
        RgbImage::from_raw(width, height, pixels)
            .map(DynamicImage::ImageRgb8)
            .ok_or_else(damaged)
    }
}

pub fn glycin_block_on<T>(future: impl Future<Output = T>) -> T {
    let _one_at_a_time = MAIN_CONTEXT.lock().expect("the lock isn't poisoned");
    let _entered = RUNTIME.enter();
    glib::MainContext::default().block_on(future)
}

fn rasterize_svg(path: &Path) -> Result<DynamicImage> {
    use resvg::{tiny_skia, usvg};
    let mut options = usvg::Options {
        dpi: SVG_DPI,
        resources_dir: path.parent().map(Path::to_path_buf),
        ..usvg::Options::default()
    };
    options.fontdb_mut().load_system_fonts();
    let mut data = Vec::new();
    File::open(path)?.read_to_end(&mut data)?;
    let tree = usvg::Tree::from_data(&data, &options).map_err(Failure::damaged)?;
    let size = tree.size();
    let scale = (SVG_FLOOR / size.width().max(size.height())).max(1.0);
    let (width, height) = (
        (size.width() * scale).ceil() as u32,
        (size.height() * scale).ceil() as u32,
    );
    let mut pixmap =
        tiny_skia::Pixmap::new(width, height).ok_or_else(|| Failure::damaged("size"))?;
    resvg::render(
        &tree,
        tiny_skia::Transform::from_scale(scale, scale),
        &mut pixmap.as_mut(),
    );
    let mut image = RgbaImage::from_raw(width, height, pixmap.take())
        .ok_or_else(|| Failure::damaged("size"))?;
    image.pixels_mut().for_each(unpremultiply);
    Ok(DynamicImage::ImageRgba8(image))
}

fn unpremultiply(pixel: &mut image::Rgba<u8>) {
    let alpha = u16::from(pixel[3]);
    if alpha == 0 || alpha == 255 {
        return;
    }
    for channel in &mut pixel.0[..3] {
        *channel = (u16::from(*channel) * 255 / alpha).min(255) as u8;
    }
}

pub fn gif_frames(path: &Path) -> Result<Frames<'static>> {
    let decoder = GifDecoder::new(BufReader::new(File::open(path)?)).map_err(Failure::damaged)?;
    Ok(decoder.into_frames())
}

pub fn dimensions(path: &Path) -> Option<(u32, u32)> {
    let size = imagesize::size(path).ok()?;
    Some((size.width as u32, size.height as u32))
}

pub fn is_animated(path: &Path, format: &Format) -> bool {
    format.id == "gif" && gif_frames(path).is_ok_and(|frames| frames.take(2).count() > 1)
}
