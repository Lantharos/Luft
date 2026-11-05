use std::path::Path;

use gstreamer as gst;
use gstreamer::prelude::*;
use gstreamer_app::AppSink;
use gstreamer_video as gst_video;
use gstreamer_video::prelude::*;
use image::{DynamicImage, RgbImage};

use super::branches::element;
use crate::engine::error::{Failure, Result};
use crate::engine::image::proxy;

const PREROLL_SECONDS: u64 = 15;

fn sample_image(sample: &gst::Sample) -> Result<DynamicImage> {
    let caps = sample.caps().ok_or_else(|| Failure::damaged("caps"))?;
    let info = gst_video::VideoInfo::from_caps(caps).map_err(Failure::damaged)?;
    let buffer = sample.buffer().ok_or_else(|| Failure::damaged("buffer"))?;
    let frame = gst_video::VideoFrameRef::from_buffer_ref_readable(buffer, &info)
        .map_err(Failure::damaged)?;
    let (width, height) = (frame.width(), frame.height());
    let row = width as usize * 3;
    let stride = frame.plane_stride()[0] as usize;
    let plane = frame.plane_data(0).map_err(Failure::damaged)?;
    let mut pixels = Vec::with_capacity(row * height as usize);
    for line in plane.chunks(stride).take(height as usize) {
        pixels.extend_from_slice(&line[..row]);
    }
    let image =
        RgbImage::from_raw(width, height, pixels).ok_or_else(|| Failure::damaged("frame"))?;
    Ok(DynamicImage::ImageRgb8(image))
}

pub fn grab(source: &Path, time: f64) -> Result<DynamicImage> {
    gst::init().map_err(Failure::damaged)?;
    let pipeline = gst::Pipeline::new();
    let file = gst::ElementFactory::make("filesrc")
        .property("location", source)
        .build()
        .map_err(Failure::damaged)?;
    let decoder = element("decodebin")?;
    let convert = element("videoconvert")?;
    let caps = gst::Caps::builder("video/x-raw")
        .field("format", "RGB")
        .build();
    let sink = AppSink::builder()
        .caps(&caps)
        .sync(false)
        .max_buffers(1)
        .build();
    let tail: &gst::Element = sink.upcast_ref();
    pipeline
        .add_many([&file, &decoder, &convert, tail])
        .map_err(Failure::damaged)?;
    file.link(&decoder).map_err(Failure::damaged)?;
    convert.link(tail).map_err(Failure::damaged)?;
    let head = convert
        .static_pad("sink")
        .expect("videoconvert has a sink pad");
    let bin = pipeline.clone();
    decoder.connect_pad_added(move |_, pad| {
        let video = pad
            .current_caps()
            .and_then(|caps| Some(caps.structure(0)?.name().starts_with("video/")))
            .unwrap_or(false);
        if video && !head.is_linked() {
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
    let stop = |pipeline: &gst::Pipeline| {
        let _ = pipeline.set_state(gst::State::Null);
    };
    pipeline
        .set_state(gst::State::Paused)
        .map_err(|_| Failure::damaged("pipeline"))?;
    let (state, _, _) = pipeline.state(gst::ClockTime::from_seconds(PREROLL_SECONDS));
    if state.is_err() {
        stop(&pipeline);
        return Err(Failure::damaged("preroll"));
    }
    if time > 0.0 {
        let position = gst::ClockTime::from_nseconds((time * 1e9) as u64);
        let flags = gst::SeekFlags::FLUSH | gst::SeekFlags::ACCURATE;
        let _ = pipeline.seek_simple(flags, position);
        let _ = pipeline.state(gst::ClockTime::from_seconds(PREROLL_SECONDS));
    }
    let sample = sink.pull_preroll().map_err(Failure::damaged);
    let image = sample.and_then(|sample| sample_image(&sample));
    stop(&pipeline);
    image
}

pub fn write(source: &Path, time: f64, edge: u32, out: &Path) -> Result<(u32, u32)> {
    let image = grab(source, time)?;
    let dimensions = (image.width(), image.height());
    proxy::store(&image, edge, out)?;
    Ok(dimensions)
}
