use std::fs::File;
use std::io::BufWriter;
use std::path::Path;

use gstreamer as gst;
use gstreamer_video::{VideoFrameExt, VideoFrameRef, VideoInfo};
use image::codecs::png::{CompressionType, FilterType, PngEncoder};
use image::{ImageEncoder, RgbImage};

const DARKEST_MEAN: f64 = 24.0;
const FLATTEST_SPREAD: f64 = 10.0;
const SAMPLED_PIXELS: u32 = 4096;

pub struct Frame {
    pub timestamp: Option<gst::ClockTime>,
    image: RgbImage,
    brightness: f64,
    spread: f64,
}

impl Frame {
    pub fn from_sample(sample: &gst::Sample) -> Result<Self, String> {
        let unreadable = || "The video frame could not be read".to_string();
        let caps = sample.caps().ok_or_else(unreadable)?;
        let buffer = sample.buffer().ok_or_else(unreadable)?;
        let info = VideoInfo::from_caps(caps).map_err(|error| error.to_string())?;
        let frame = VideoFrameRef::from_buffer_ref_readable(buffer, &info)
            .map_err(|error| error.to_string())?;
        let (width, height) = (frame.width(), frame.height());
        let row = width as usize * 3;
        let stride = usize::try_from(frame.plane_stride()[0])
            .ok()
            .filter(|stride| *stride >= row)
            .ok_or_else(unreadable)?;
        let data = frame.plane_data(0).map_err(|error| error.to_string())?;
        let mut pixels = Vec::with_capacity(row * height as usize);
        for line in data.chunks(stride).take(height as usize) {
            pixels.extend_from_slice(line.get(..row).ok_or_else(unreadable)?);
        }
        let image = RgbImage::from_raw(width, height, pixels).ok_or_else(unreadable)?;
        let (brightness, spread) = luma_statistics(&image);
        Ok(Self {
            timestamp: buffer.pts(),
            image,
            brightness,
            spread,
        })
    }

    pub fn has_content(&self) -> bool {
        self.brightness >= DARKEST_MEAN && self.spread >= FLATTEST_SPREAD
    }

    pub fn detail(&self) -> f64 {
        self.spread + self.brightness.min(DARKEST_MEAN)
    }

    pub fn save(&self, output: &Path) -> Result<(), String> {
        let file = File::create(output).map_err(|error| error.to_string())?;
        PngEncoder::new_with_quality(
            BufWriter::new(file),
            CompressionType::Fast,
            FilterType::Adaptive,
        )
        .write_image(
            self.image.as_raw(),
            self.image.width(),
            self.image.height(),
            image::ExtendedColorType::Rgb8,
        )
        .map_err(|error| error.to_string())
    }
}

fn luma_statistics(image: &RgbImage) -> (f64, f64) {
    let pixels = image.width() * image.height();
    let step = (pixels / SAMPLED_PIXELS).max(1) as usize;
    let (mut count, mut sum, mut squares) = (0.0, 0.0, 0.0);
    for pixel in image.pixels().step_by(step) {
        let [red, green, blue] = pixel.0.map(f64::from);
        let luma = 0.299 * red + 0.587 * green + 0.114 * blue;
        count += 1.0;
        sum += luma;
        squares += luma * luma;
    }
    let mean = sum / count;
    (mean, (squares / count - mean * mean).max(0.0).sqrt())
}
