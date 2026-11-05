mod branches;
pub mod encoders;
mod filters;
pub mod frame;
mod gif_sink;
mod pipeline;
mod plan;
pub mod probe;
mod tags;
pub mod waveform;

use std::fs;

use gstreamer as gst;

use self::pipeline::Rates;
use self::plan::{Plan, VideoPlan};
use self::probe::MediaInfo;
use super::Progress;
use super::error::{Failure, Result};
use super::formats::{self, Family};
use super::job::Job;
use crate::l10n::L10N;
use luft_i18n::t;

const AUDIO_SHARE_KILOBITS: u32 = 128;
const CONTAINER_MARGIN: f64 = 0.96;
const OVERSHOOT_TRIES: u32 = 3;

fn span_seconds(job: &Job, info: &MediaInfo) -> f64 {
    job.edits
        .trim
        .map_or(info.duration, |trim| trim.end - trim.start)
}

fn target_rates(job: &Job, info: &MediaInfo, plan: &Plan, scale: f64) -> Result<Rates> {
    let Some(target) = job.options.target_bytes else {
        return Ok(Rates {
            video_kilobits: None,
            audio_kilobits: None,
        });
    };
    let seconds = span_seconds(job, info).max(0.1);
    let budget = (target as f64 * 8.0 / 1000.0 / seconds * CONTAINER_MARGIN * scale) as u32;
    let streams = plan.audio.len() as u32;
    if plan.video == VideoPlan::None {
        return Ok(Rates {
            video_kilobits: None,
            audio_kilobits: Some(budget / streams.max(1)),
        });
    }
    let audio = job
        .options
        .audio_bitrate
        .unwrap_or(AUDIO_SHARE_KILOBITS.min(budget / 5))
        * streams;
    if budget <= audio {
        return Err(Failure::new(t!(L10N, "failure-target-size")));
    }
    let share = (streams > 0).then_some(audio / streams.max(1));
    Ok(Rates {
        video_kilobits: Some(budget - audio),
        audio_kilobits: share,
    })
}

fn encode_with(job: &Job, info: &MediaInfo, hardware: bool, progress: &Progress) -> Result<()> {
    let plan = plan::plan(job, info, hardware)?;
    let mut scale = 1.0;
    for _ in 0..OVERSHOOT_TRIES {
        let rates = target_rates(job, info, &plan, scale)?;
        pipeline::run(job, info, &plan, &rates, progress)?;
        let Some(target) = job.options.target_bytes else {
            return Ok(());
        };
        let written = fs::metadata(&job.temp)?.len();
        if written <= target {
            return Ok(());
        }
        scale *= target as f64 / written as f64 * CONTAINER_MARGIN;
    }
    Err(Failure::new(t!(L10N, "failure-target-size")))
}

fn used_hardware(job: &Job, info: &MediaInfo) -> bool {
    job.options.hardware
        && plan::plan(job, info, true).is_ok_and(|plan| {
            matches!(plan.video, VideoPlan::Encode { element, .. } if encoders::is_hardware(element))
        })
}

pub fn convert(job: &Job, progress: &Progress) -> Result<()> {
    gst::init().map_err(Failure::damaged)?;
    let info = probe::discover(&job.inputs[0])?;
    let result = encode_with(job, &info, job.options.hardware, progress);
    let result = match result {
        Err(_) if used_hardware(job, &info) => encode_with(job, &info, false, progress),
        other => other,
    };
    result?;
    let audio_output =
        formats::by_id(&job.format).is_some_and(|format| format.family == Family::Audio);
    if audio_output && job.options.keep_metadata {
        tags::carry(&job.inputs[0], &job.temp)?;
    }
    Ok(())
}
