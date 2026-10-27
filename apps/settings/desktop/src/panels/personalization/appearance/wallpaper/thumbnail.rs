use std::fs;
use std::path::{Path, PathBuf};

use gstreamer as gst;
use gstreamer::prelude::*;
use image::{DynamicImage, RgbImage};
use luft_i18n::t;
use serde::Deserialize;
use specta::Type;

use super::cache::{cached_path, failed};
use super::library::{extension, is_video};
use crate::L10N;

const THUMBNAIL_WIDTH: u32 = 480;
const DECODABLE_IMAGES: [&str; 5] = ["jpg", "jpeg", "png", "webp", "jxl"];
const PREROLL_TIMEOUT_SECONDS: u64 = 10;
const DECODED_FRAME_SINK: &str = "capsfilter caps=video/x-raw ! fakesink";

#[derive(Deserialize, Type)]
pub struct Image {
    pub path: String,
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
    let sample = sample.ok_or_else(no_picture)?;
    let height = sample
        .caps()
        .and_then(|caps| caps.structure(0)?.get::<i32>("height").ok())
        .ok_or_else(no_picture)?;
    let frame = sample
        .buffer()
        .ok_or_else(no_picture)?
        .map_readable()
        .map_err(failed)?;
    RgbImage::from_raw(THUMBNAIL_WIDTH, height as u32, frame.to_vec()).ok_or_else(no_picture)
}

fn no_picture() -> String {
    t!(L10N, "desktop-wallpaper-video-no-picture")
}

pub fn thumbnail(Image { path }: Image) -> Result<String, String> {
    Ok(preview(Path::new(&path))?.to_string_lossy().into_owned())
}

pub fn preview(source: &Path) -> Result<PathBuf, String> {
    if !is_video(source) && !DECODABLE_IMAGES.contains(&extension(source).as_str()) {
        return Ok(source.to_owned());
    }
    let target = cached_path(source, "wallpapers", "jpg")?;
    if !target.exists() {
        let preview = if is_video(source) {
            first_frame(source)?
        } else {
            shrink(decode_image(source)?)
        };
        fs::create_dir_all(
            target
                .parent()
                .ok_or_else(|| t!(L10N, "desktop-no-cache-folder"))?,
        )
        .map_err(failed)?;
        preview.save(&target).map_err(failed)?;
    }
    Ok(target)
}
