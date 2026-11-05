use super::encoders;
use super::probe::{AudioStream, MediaInfo};
use crate::engine::error::{Failure, Result};
use crate::engine::formats::{self, Family};
use crate::engine::job::{Audio, Job};
use crate::l10n::L10N;
use luft_i18n::t;

#[derive(Clone, Debug, PartialEq)]
pub enum VideoPlan {
    None,
    Copy,
    Encode {
        element: &'static str,
        codec: &'static str,
    },
    Gif,
}

#[derive(Clone, Debug, PartialEq)]
pub enum AudioPlan {
    Copy,
    Encode {
        element: &'static str,
        codec: &'static str,
    },
}

#[derive(Clone, Debug)]
pub struct Plan {
    pub video: VideoPlan,
    pub audio: Vec<AudioPlan>,
}

const AUDIO_TARGETS: &[(&str, &str)] = &[
    ("mp3", "mp3"),
    ("flac", "flac"),
    ("ogg", "vorbis"),
    ("opus", "opus"),
    ("m4a", "aac"),
];

fn wants_new_frames(job: &Job) -> bool {
    let edits = &job.edits;
    job.options.width.is_some()
        || job.options.height.is_some()
        || job.options.frame_rate.is_some()
        || job.options.target_bytes.is_some()
        || job.options.video_codec.is_some()
        || edits.changes_pixels()
        || edits.trim.is_some()
}

fn plan_video(job: &Job, info: &MediaInfo, hardware: bool) -> Result<VideoPlan> {
    let Some(stream) = &info.video else {
        return Ok(VideoPlan::None);
    };
    let family = formats::by_id(&job.format).map(|format| format.family);
    if family == Some(Family::Audio) {
        return Ok(VideoPlan::None);
    }
    if job.format == "gif" {
        return Ok(VideoPlan::Gif);
    }
    let codecs = encoders::container_codecs(&job.format);
    if job.options.copy_streams && !wants_new_frames(job) && codecs.contains(&stream.codec.as_str())
    {
        return Ok(VideoPlan::Copy);
    }
    let requested = job.options.video_codec.as_deref();
    let chosen = codecs
        .iter()
        .filter(|codec| requested.is_none_or(|wanted| wanted == **codec))
        .find_map(|codec| Some((*codec, encoders::pick_video(codec, hardware)?)));
    let (codec, element) = chosen.ok_or_else(|| {
        Failure::new(t!(
            L10N,
            "failure-no-video-encoder",
            format = job.format.clone()
        ))
    })?;
    Ok(VideoPlan::Encode { element, codec })
}

fn plan_stream(job: &Job, stream: &AudioStream) -> Result<AudioPlan> {
    let container = encoders::container_audio(&job.format);
    let target = AUDIO_TARGETS
        .iter()
        .find(|(format, _)| *format == job.format)
        .map(|(_, codec)| *codec);
    let single = target.map(|codec| [codec]);
    let wanted: &[&str] = single.as_ref().map_or(container, |codec| codec);
    let settings_change = job.options.audio_bitrate.is_some()
        || job.options.sample_rate.is_some()
        || job.options.channels.is_some()
        || job.options.target_bytes.is_some();
    let copyable = job.options.copy_streams && job.edits.trim.is_none() && !settings_change;
    if copyable && wanted.contains(&stream.codec.as_str()) {
        return Ok(AudioPlan::Copy);
    }
    let chosen = wanted
        .iter()
        .find_map(|codec| Some((*codec, encoders::pick_audio(codec)?)));
    match chosen {
        Some((codec, element)) => Ok(AudioPlan::Encode { element, codec }),
        None => Err(Failure::new(t!(
            L10N,
            "failure-no-audio-encoder",
            format = job.format.clone()
        ))),
    }
}

fn pcm_target(format: &str) -> bool {
    matches!(format, "wav" | "aiff")
}

pub fn plan(job: &Job, info: &MediaInfo, hardware: bool) -> Result<Plan> {
    let video = plan_video(job, info, hardware)?;
    let keeps_audio = job.options.audio == Audio::Keep && video != VideoPlan::Gif;
    let audio = match keeps_audio {
        false => Vec::new(),
        true if pcm_target(&job.format) => info
            .audio
            .iter()
            .take(1)
            .map(|_| AudioPlan::Encode {
                element: "identity",
                codec: "pcm",
            })
            .collect(),
        true => info
            .audio
            .iter()
            .map(|stream| plan_stream(job, stream))
            .collect::<Result<_>>()?,
    };
    if video == VideoPlan::None && audio.is_empty() {
        return Err(Failure::new(t!(L10N, "failure-no-streams")));
    }
    Ok(Plan { video, audio })
}
