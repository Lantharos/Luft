use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use gstreamer as gst;
use gstreamer::prelude::*;
use image::{DynamicImage, RgbImage};
use serde::Deserialize;

use super::library::{extension, is_video};

const THUMBNAIL_WIDTH: u32 = 480;
const DECODABLE_IMAGES: [&str; 5] = ["jpg", "jpeg", "png", "webp", "jxl"];
const PREROLL_TIMEOUT_SECONDS: u64 = 10;
const DECODED_FRAME_SINK: &str = "capsfilter caps=video/x-raw ! fakesink";

#[derive(Deserialize)]
pub struct Image {
    path: String,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn cached_path(source: &Path) -> Result<PathBuf, String> {
    let metadata = fs::metadata(source).map_err(failed)?;
    let mut hasher = DefaultHasher::new();
    source.hash(&mut hasher);
    metadata.len().hash(&mut hasher);
    metadata
        .modified()
        .ok()
        .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
        .map(|modified| modified.as_secs())
        .hash(&mut hasher);
    Ok(dirs::cache_dir()
        .ok_or("There is no cache folder")?
        .join("com.lantharos.settings")
        .join("wallpapers")
        .join(format!("{:016x}.jpg", hasher.finish())))
}

fn decode_image(source: &Path) -> Result<DynamicImage, String> {
    if extension(source) == "jxl" {
        let decoder =
            jxl_oxide::integration::JxlDecoder::new(fs::File::open(source).map_err(failed)?)
                .map_err(failed)?;
        return DynamicImage::from_decoder(decoder).map_err(failed);
    }
    image::open(source).map_err(failed)
}

fn shrink(image: DynamicImage) -> RgbImage {
    let height = (image.height() as f64 * THUMBNAIL_WIDTH as f64 / image.width().max(1) as f64)
        .round() as u32;
    image.thumbnail(THUMBNAIL_WIDTH, height.max(1)).into_rgb8()
}

fn first_frame(source: &Path) -> Result<RgbImage, String> {
    gst::init().map_err(failed)?;
    let pipeline = gst::ElementFactory::make("playbin3")
        .property(
            "uri",
            gio::glib::filename_to_uri(source, None)
                .map_err(failed)?
                .as_str(),
        )
        .property(
            "video-sink",
            gst::parse::bin_from_description(DECODED_FRAME_SINK, true).map_err(failed)?,
        )
        .build()
        .map_err(failed)?;
    pipeline.set_property_from_str("flags", "video");
    pipeline.set_state(gst::State::Paused).map_err(failed)?;
    let (prerolled, ..) = pipeline.state(gst::ClockTime::from_seconds(PREROLL_TIMEOUT_SECONDS));
    let caps = gst::Caps::builder("video/x-raw")
        .field("format", "RGB")
        .field("width", THUMBNAIL_WIDTH as i32)
        .field("pixel-aspect-ratio", gst::Fraction::new(1, 1))
        .build();
    let sample = prerolled
        .ok()
        .and_then(|_| pipeline.emit_by_name::<Option<gst::Sample>>("convert-sample", &[&caps]));
    let _ = pipeline.set_state(gst::State::Null);
    let sample = sample.ok_or("This video has no picture")?;
    let height = sample
        .caps()
        .and_then(|caps| caps.structure(0)?.get::<i32>("height").ok())
        .ok_or("This video has no picture")?;
    let frame = sample
        .buffer()
        .ok_or("This video has no picture")?
        .map_readable()
        .map_err(failed)?;
    RgbImage::from_raw(THUMBNAIL_WIDTH, height as u32, frame.to_vec())
        .ok_or_else(|| "This video has no picture".into())
}

pub fn thumbnail(Image { path }: Image) -> Result<String, String> {
    let source = Path::new(&path);
    if !is_video(source) && !DECODABLE_IMAGES.contains(&extension(source).as_str()) {
        return Ok(path);
    }
    let target = cached_path(source)?;
    if !target.exists() {
        let preview = if is_video(source) {
            first_frame(source)?
        } else {
            shrink(decode_image(source)?)
        };
        fs::create_dir_all(target.parent().ok_or("There is no cache folder")?).map_err(failed)?;
        preview.save(&target).map_err(failed)?;
    }
    Ok(target.to_string_lossy().into_owned())
}
