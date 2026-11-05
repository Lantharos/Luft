use std::path::Path;

use gstreamer as gst;
use gstreamer_pbutils::prelude::*;
use gstreamer_pbutils::{Discoverer, DiscovererAudioInfo, DiscovererVideoInfo};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::engine::error::{Failure, Result};

const DISCOVER_TIMEOUT_SECONDS: u64 = 20;

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct VideoStream {
    pub codec: String,
    pub width: u32,
    pub height: u32,
    pub frame_rate: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AudioStream {
    pub codec: String,
    pub sample_rate: u32,
    pub channels: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct MediaInfo {
    pub duration: f64,
    pub video: Option<VideoStream>,
    pub audio: Vec<AudioStream>,
}

fn codec_id(caps: &gst::CapsRef) -> String {
    let Some(structure) = caps.structure(0) else {
        return String::new();
    };
    let version = structure.get::<i32>("mpegversion").unwrap_or_default();
    let layer = structure.get::<i32>("layer").unwrap_or_default();
    let name = structure.name().as_str();
    match name {
        "video/x-h264" => "h264",
        "video/x-h265" => "hevc",
        "video/x-av1" => "av1",
        "video/x-vp9" => "vp9",
        "video/x-vp8" => "vp8",
        "video/mpeg" if version == 4 => "mpeg4",
        "video/mpeg" => "mpeg2",
        "audio/mpeg" if version == 1 && layer == 3 => "mp3",
        "audio/mpeg" if version != 1 => "aac",
        "audio/x-opus" => "opus",
        "audio/x-vorbis" => "vorbis",
        "audio/x-flac" => "flac",
        "audio/x-ac3" => "ac3",
        "audio/x-alac" => "alac",
        other => {
            return other
                .rsplit('/')
                .next()
                .unwrap_or(other)
                .trim_start_matches("x-")
                .to_owned();
        }
    }
    .to_owned()
}

pub fn discover(path: &Path) -> Result<MediaInfo> {
    gst::init().map_err(Failure::damaged)?;
    let discoverer = Discoverer::new(gst::ClockTime::from_seconds(DISCOVER_TIMEOUT_SECONDS))
        .map_err(Failure::damaged)?;
    let uri = gst::glib::filename_to_uri(path, None).map_err(Failure::damaged)?;
    let info = discoverer.discover_uri(&uri).map_err(Failure::damaged)?;
    let video = info.video_streams().first().map(|stream| {
        let details = stream
            .downcast_ref::<DiscovererVideoInfo>()
            .expect("a video stream is listed as video");
        let rate = details.framerate();
        VideoStream {
            codec: stream
                .caps()
                .as_ref()
                .map_or_else(String::new, |caps| codec_id(caps)),
            width: details.width(),
            height: details.height(),
            frame_rate: f64::from(rate.numer()) / f64::from(rate.denom().max(1)),
        }
    });
    let audio = info
        .audio_streams()
        .iter()
        .map(|stream| {
            let details = stream
                .downcast_ref::<DiscovererAudioInfo>()
                .expect("an audio stream is listed as audio");
            AudioStream {
                codec: stream
                    .caps()
                    .as_ref()
                    .map_or_else(String::new, |caps| codec_id(caps)),
                sample_rate: details.sample_rate(),
                channels: details.channels(),
            }
        })
        .collect();
    let duration = info.duration().map_or(0.0, |time| time.seconds_f64());
    Ok(MediaInfo {
        duration,
        video,
        audio,
    })
}
