use std::sync::Arc;

use gstreamer as gst;
use gstreamer::prelude::*;
use gstreamer_video as gst_video;
use gstreamer_video::prelude::*;
use image::RgbaImage;
use resvg::tiny_skia::Pixmap;

use super::branches::element;
use super::probe::MediaInfo;
use crate::engine::error::{Failure, Result};
use crate::engine::image::marks;
use crate::engine::job::{Job, Mark, Options};

fn threaded(factory: &str) -> Result<gst::Element> {
    let element = element(factory)?;
    if element.has_property("n-threads") {
        let threads = std::thread::available_parallelism().map_or(4, |count| count.get() as u32);
        element.set_property("n-threads", threads.min(8));
    }
    Ok(element)
}

fn flip(job: &Job) -> Result<Option<gst::Element>> {
    let edits = &job.edits;
    let rotation = edits.rotate % 360;
    let method = match (rotation, edits.flip_horizontal, edits.flip_vertical) {
        (0, false, false) => return Ok(None),
        (0, true, false) => "horizontal-flip",
        (0, false, true) | (180, true, false) => "vertical-flip",
        (0, true, true) | (180, false, false) => "rotate-180",
        (180, false, true) => "horizontal-flip",
        (180, true, true) => return Ok(None),
        (90, false, false) | (270, true, true) => "clockwise",
        (270, false, false) | (90, true, true) => "counterclockwise",
        (90, true, false) | (270, false, true) => "upper-right-diagonal",
        (90, false, true) | (270, true, false) => "upper-left-diagonal",
        _ => return Ok(None),
    };
    let element = element("videoflip")?;
    element.set_property_from_str("method", method);
    Ok(Some(element))
}

fn oriented(job: &Job, info: &MediaInfo) -> (u32, u32) {
    let stream = info
        .video
        .as_ref()
        .expect("video filters run on a video stream");
    if matches!(job.edits.rotate % 360, 90 | 270) {
        (stream.height, stream.width)
    } else {
        (stream.width, stream.height)
    }
}

fn crop(job: &Job, info: &MediaInfo) -> Result<Option<gst::Element>> {
    let Some(area) = job.edits.crop else {
        return Ok(None);
    };
    let (width, height) = oriented(job, info);
    let left = area.x.round().max(0.0) as i32;
    let top = area.y.round().max(0.0) as i32;
    let right = (i64::from(width) - (area.x + area.width).round() as i64).max(0) as i32;
    let bottom = (i64::from(height) - (area.y + area.height).round() as i64).max(0) as i32;
    let element = gst::ElementFactory::make("videocrop")
        .property("left", left)
        .property("top", top)
        .property("right", right)
        .property("bottom", bottom)
        .build()
        .map_err(Failure::damaged)?;
    Ok(Some(element))
}

fn balance(job: &Job) -> Result<Option<gst::Element>> {
    let edits = &job.edits;
    if !edits.adjusts() {
        return Ok(None);
    }
    let element = gst::ElementFactory::make("videobalance")
        .property("brightness", edits.brightness.clamp(-1.0, 1.0) / 2.0)
        .property("contrast", (1.0 + edits.contrast).clamp(0.0, 2.0))
        .property("saturation", (1.0 + edits.saturation).clamp(0.0, 2.0))
        .build()
        .map_err(Failure::damaged)?;
    Ok(Some(element))
}

fn even(value: f64) -> i32 {
    ((value / 2.0).round() as i32 * 2).max(2)
}

fn final_caps(job: &Job, info: &MediaInfo) -> gst::Caps {
    let (mut width, mut height) = oriented(job, info);
    if let Some(area) = job.edits.crop {
        (width, height) = (area.width.round() as u32, area.height.round() as u32);
    }
    let resized = job.options.width.is_some() || job.options.height.is_some();
    if !resized && width % 2 == 0 && height % 2 == 0 && job.format != "gif" {
        return gst::Caps::new_any();
    }
    let ratio = f64::from(width) / f64::from(height.max(1));
    let size = match (job.options.width, job.options.height) {
        (Some(w), Some(h)) => (f64::from(w), f64::from(h)),
        (Some(w), None) => (f64::from(w), f64::from(w) / ratio),
        (None, Some(h)) => (f64::from(h) * ratio, f64::from(h)),
        (None, None) => (f64::from(width), f64::from(height)),
    };
    let builder = gst::Caps::builder("video/x-raw")
        .field("width", even(size.0))
        .field("height", even(size.1))
        .field("pixel-aspect-ratio", gst::Fraction::new(1, 1));
    if job.format == "gif" {
        return builder.field("format", "RGBA").build();
    }
    builder.build()
}

fn rate(job: &Job) -> Result<Vec<gst::Element>> {
    let fps = job
        .options
        .frame_rate
        .or((job.format == "gif").then_some(super::gif_sink::DEFAULT_RATE));
    let Some(fps) = fps else {
        return Ok(Vec::new());
    };
    let fraction = gst::Fraction::approximate_f64(fps).unwrap_or(gst::Fraction::new(30, 1));
    let caps = gst::Caps::builder("video/x-raw")
        .field("framerate", fraction)
        .build();
    let filter = gst::ElementFactory::make("capsfilter")
        .property("caps", caps)
        .build()
        .map_err(Failure::damaged)?;
    Ok(vec![element("videorate")?, filter])
}

pub fn video(job: &Job, info: &MediaInfo) -> Result<Vec<gst::Element>> {
    let mut chain = vec![threaded("videoconvert")?];
    chain.extend(flip(job)?);
    if !job.edits.marks.is_empty() {
        let caps = gst::Caps::builder("video/x-raw")
            .field("format", "RGBA")
            .build();
        chain.push(
            gst::ElementFactory::make("capsfilter")
                .name("marked")
                .property("caps", caps)
                .build()
                .map_err(Failure::damaged)?,
        );
        chain.push(threaded("videoconvert")?);
    }
    chain.extend(crop(job, info)?);
    chain.extend(balance(job)?);
    chain.push(threaded("videoscale")?);
    chain.extend(rate(job)?);
    chain.push(threaded("videoconvert")?);
    let caps = final_caps(job, info);
    chain.push(
        gst::ElementFactory::make("capsfilter")
            .property("caps", caps)
            .build()
            .map_err(Failure::damaged)?,
    );
    Ok(chain)
}

fn paint(
    frame: &mut gst::BufferRef,
    info: &gst_video::VideoInfo,
    marks_list: &[Mark],
    layer: Option<&Pixmap>,
) -> Option<()> {
    let mut frame = gst_video::VideoFrameRef::from_buffer_ref_writable(frame, info).ok()?;
    let (width, height) = (frame.width(), frame.height());
    let row = width as usize * 4;
    let stride = frame.plane_stride()[0] as usize;
    let data = frame.plane_data_mut(0).ok()?;
    let mut canvas = Vec::with_capacity(row * height as usize);
    for line in data.chunks(stride).take(height as usize) {
        canvas.extend_from_slice(&line[..row]);
    }
    let mut canvas = RgbaImage::from_raw(width, height, canvas)?;
    marks::censor(&mut canvas, marks_list);
    if let Some(layer) = layer {
        marks::composite(&mut canvas, layer);
    }
    for (line, painted) in data.chunks_mut(stride).zip(canvas.chunks(row)) {
        line[..row].copy_from_slice(painted);
    }
    Some(())
}

pub fn paint_marks(chain: &[gst::Element], job: &Job, info: &MediaInfo) -> Result<()> {
    let Some(filter) = chain.iter().find(|element| element.name() == "marked") else {
        return Ok(());
    };
    let (width, height) = oriented(job, info);
    let layer = marks::overlay(&job.edits.marks, width, height)?;
    let marks_list: Arc<[Mark]> = job.edits.marks.clone().into();
    let pad = filter
        .static_pad("src")
        .expect("a capsfilter has a source pad");
    let video_info = gst_video::VideoInfo::builder(gst_video::VideoFormat::Rgba, width, height)
        .build()
        .map_err(Failure::damaged)?;
    pad.add_probe(gst::PadProbeType::BUFFER, move |_, probe| {
        if let Some(gst::PadProbeData::Buffer(buffer)) = &mut probe.data
            && paint(buffer.make_mut(), &video_info, &marks_list, layer.as_ref()).is_none()
        {
            probe.flow_res = Err(gst::FlowError::Error);
            return gst::PadProbeReturn::Drop;
        }
        gst::PadProbeReturn::Ok
    });
    Ok(())
}

pub fn audio_caps(options: &Options) -> Option<gst::Caps> {
    if options.sample_rate.is_none() && options.channels.is_none() {
        return None;
    }
    let mut builder = gst::Caps::builder("audio/x-raw");
    if let Some(rate) = options.sample_rate {
        builder = builder.field("rate", rate as i32);
    }
    if let Some(channels) = options.channels {
        builder = builder.field("channels", channels as i32);
    }
    Some(builder.build())
}
