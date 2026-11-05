use gstreamer as gst;
use image::{DynamicImage, RgbImage};
use serde::{Deserialize, Serialize};
use specta::Type;

use super::formats::{FORMATS, Family};
use super::image::encode::{self, Settings};
use super::media::encoders::{self, VIDEO_CODECS};

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Codec {
    pub id: String,
    pub encoder: String,
    pub hardware: bool,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Capabilities {
    pub missing: Vec<String>,
    pub video_codecs: Vec<Codec>,
    pub hardware_codecs: Vec<Codec>,
    pub audio_codecs: Vec<String>,
}

const CHECKED_IMAGES: &[&str] = &["avif", "heic", "jxl"];
const AUDIO_NEEDS: &[(&str, &str)] = &[
    ("mp3", "mp3"),
    ("flac", "flac"),
    ("ogg", "vorbis"),
    ("opus", "opus"),
    ("m4a", "aac"),
];
const TEST_EDGE: u32 = 64;

fn image_encodes(id: &str) -> bool {
    let sample = DynamicImage::ImageRgb8(RgbImage::from_pixel(
        TEST_EDGE,
        TEST_EDGE,
        image::Rgb([40, 120, 200]),
    ));
    let settings = Settings {
        quality: 50,
        lossless: false,
    };
    encode::encode(&sample, id, &settings).is_ok_and(|bytes| !bytes.is_empty())
}

fn codec(id: &str, element: &str) -> Codec {
    Codec {
        id: id.to_owned(),
        encoder: element.to_owned(),
        hardware: encoders::is_hardware(element),
    }
}

pub fn detect() -> Capabilities {
    let mut found = Capabilities::default();
    if gst::init().is_err() {
        return found;
    }
    for (id, _) in VIDEO_CODECS {
        if let Some(element) = encoders::pick_video(id, false) {
            found.video_codecs.push(codec(id, element));
        }
        if let Some(element) =
            encoders::pick_video(id, true).filter(|element| encoders::is_hardware(element))
        {
            found.hardware_codecs.push(codec(id, element));
        }
    }
    let mut audio: Vec<String> = ["aac", "mp3", "opus", "vorbis", "flac", "alac"]
        .into_iter()
        .filter(|id| encoders::pick_audio(id).is_some())
        .map(str::to_owned)
        .collect();
    audio.shrink_to_fit();
    let has_video = |format: &str| {
        encoders::container_codecs(format).iter().any(|id| {
            found
                .video_codecs
                .iter()
                .chain(&found.hardware_codecs)
                .any(|codec| codec.id == *id)
        })
    };
    let mut missing: Vec<String> = FORMATS
        .iter()
        .filter(|format| format.writable && format.family == Family::Video && !has_video(format.id))
        .map(|format| format.id.to_owned())
        .collect();
    missing.extend(
        AUDIO_NEEDS
            .iter()
            .filter(|(_, needed)| !audio.iter().any(|id| id == needed))
            .map(|(format, _)| (*format).to_owned()),
    );
    missing.extend(
        CHECKED_IMAGES
            .iter()
            .filter(|id| !image_encodes(id))
            .map(|id| (*id).to_owned()),
    );
    found.missing = missing;
    found.audio_codecs = audio;
    found
}
