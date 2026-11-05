use std::path::Path;
use std::sync::{Arc, Mutex};

use gstreamer as gst;
use gstreamer::prelude::*;
use gstreamer_app::{AppSink, AppSinkCallbacks};

use super::branches::element;
use crate::engine::error::{Failure, Result};

const SAMPLE_RATE: i32 = 4000;

pub fn peaks(source: &Path, duration: f64, buckets: usize) -> Result<Vec<f32>> {
    gst::init().map_err(Failure::damaged)?;
    let pipeline = gst::Pipeline::new();
    let file = gst::ElementFactory::make("filesrc")
        .property("location", source)
        .build()
        .map_err(Failure::damaged)?;
    let decoder = element("decodebin")?;
    let convert = element("audioconvert")?;
    let resample = element("audioresample")?;
    let caps = gst::Caps::builder("audio/x-raw")
        .field("format", "F32LE")
        .field("layout", "interleaved")
        .field("channels", 1)
        .field("rate", SAMPLE_RATE)
        .build();
    let total = ((duration * f64::from(SAMPLE_RATE)) as usize).max(buckets);
    let per_bucket = total / buckets;
    let peaks = Arc::new(Mutex::new(vec![0f32; buckets]));
    let written = peaks.clone();
    let mut index = 0usize;
    let sink = AppSink::builder().caps(&caps).sync(false).build();
    sink.set_callbacks(
        AppSinkCallbacks::builder()
            .new_sample(move |sink| {
                let sample = sink.pull_sample().map_err(|_| gst::FlowError::Eos)?;
                let buffer = sample.buffer().ok_or(gst::FlowError::Error)?;
                let map = buffer.map_readable().map_err(|_| gst::FlowError::Error)?;
                let mut peaks = written.lock().expect("the peaks aren't poisoned");
                for value in map.as_chunks::<4>().0 {
                    let level = f32::from_le_bytes(*value).abs();
                    if let Some(peak) = peaks.get_mut(index / per_bucket) {
                        *peak = peak.max(level);
                    }
                    index += 1;
                }
                Ok(gst::FlowSuccess::Ok)
            })
            .build(),
    );
    let tail: &gst::Element = sink.upcast_ref();
    pipeline
        .add_many([&file, &decoder, &convert, &resample, tail])
        .map_err(Failure::damaged)?;
    file.link(&decoder).map_err(Failure::damaged)?;
    gst::Element::link_many([&convert, &resample, tail]).map_err(Failure::damaged)?;
    let head = convert
        .static_pad("sink")
        .expect("audioconvert has a sink pad");
    let bin = pipeline.clone();
    decoder.connect_pad_added(move |_, pad| {
        let audio = pad
            .current_caps()
            .and_then(|caps| Some(caps.structure(0)?.name().starts_with("audio/")))
            .unwrap_or(false);
        if audio && !head.is_linked() {
            let _ = pad.link(&head);
            return;
        }
        let sink = gst::ElementFactory::make("fakesink")
            .property("sync", false)
            .build()
            .expect("fakesink is part of GStreamer");
        bin.add(&sink).expect("a new element can join the pipeline");
        sink.sync_state_with_parent().expect("fakesink starts");
        let _ = pad.link(&sink.static_pad("sink").expect("fakesink has a sink pad"));
    });
    pipeline
        .set_state(gst::State::Playing)
        .map_err(|_| Failure::damaged("pipeline"))?;
    let bus = pipeline.bus().expect("a pipeline has a bus");
    let ended = bus.timed_pop_filtered(
        gst::ClockTime::NONE,
        &[gst::MessageType::Eos, gst::MessageType::Error],
    );
    let _ = pipeline.set_state(gst::State::Null);
    if let Some(message) = ended
        && let gst::MessageView::Error(error) = message.view()
    {
        return Err(Failure::damaged(error.error()));
    }
    let peaks = peaks.lock().expect("the peaks aren't poisoned").clone();
    let loudest = peaks.iter().copied().fold(f32::EPSILON, f32::max);
    Ok(peaks.into_iter().map(|peak| peak / loudest).collect())
}
