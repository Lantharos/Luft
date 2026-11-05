use std::fs::File;
use std::io::BufWriter;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};

use gstreamer as gst;
use gstreamer::prelude::*;
use gstreamer_app::{AppSink, AppSinkCallbacks};
use gstreamer_video as gst_video;
use gstreamer_video::prelude::*;

use crate::engine::error::{Failure, Result};
use crate::engine::image::gif::Writer;
use crate::engine::job::Job;

pub const DEFAULT_RATE: f64 = 15.0;

type GifWriter = Writer<BufWriter<File>>;

static FAILURE: Mutex<Option<String>> = Mutex::new(None);

fn push(
    sample: &gst::Sample,
    writer: &mut Option<GifWriter>,
    temp: &std::path::Path,
    delay: u32,
) -> Result<()> {
    let caps = sample.caps().ok_or_else(|| Failure::damaged("caps"))?;
    let info = gst_video::VideoInfo::from_caps(caps).map_err(Failure::damaged)?;
    let buffer = sample.buffer().ok_or_else(|| Failure::damaged("buffer"))?;
    let frame = gst_video::VideoFrameRef::from_buffer_ref_readable(buffer, &info)
        .map_err(Failure::damaged)?;
    let (width, height) = (frame.width() as u16, frame.height() as u16);
    let row = usize::from(width) * 4;
    let stride = frame.plane_stride()[0] as usize;
    let plane = frame.plane_data(0).map_err(Failure::damaged)?;
    let mut pixels = Vec::with_capacity(row * usize::from(height));
    for line in plane.chunks(stride).take(usize::from(height)) {
        pixels.extend_from_slice(&line[..row]);
    }
    let writer = match writer {
        Some(writer) => writer,
        empty => empty.insert(Writer::new(
            BufWriter::new(File::create(temp)?),
            width,
            height,
        )?),
    };
    writer.push(&pixels, width, height, delay)
}

pub fn sink(job: &Job, position: Arc<AtomicU64>) -> Result<gst::Element> {
    let sink = AppSink::builder().sync(false).max_buffers(4).build();
    let temp = job.temp.clone();
    let rate = job.options.frame_rate.unwrap_or(DEFAULT_RATE);
    let delay = (1000.0 / rate).round() as u32;
    let writer = Arc::new(Mutex::new(None));
    let closing = writer.clone();
    sink.set_callbacks(
        AppSinkCallbacks::builder()
            .eos(move |_| {
                closing.lock().expect("the writer isn't poisoned").take();
            })
            .new_sample(move |sink| {
                let sample = sink.pull_sample().map_err(|_| gst::FlowError::Eos)?;
                if let Some(time) = sample.buffer().and_then(|buffer| buffer.pts()) {
                    position.fetch_max(time.nseconds(), Ordering::Relaxed);
                }
                match push(
                    &sample,
                    &mut writer.lock().expect("the writer isn't poisoned"),
                    &temp,
                    delay,
                ) {
                    Ok(()) => Ok(gst::FlowSuccess::Ok),
                    Err(failure) => {
                        *FAILURE.lock().expect("the failure isn't poisoned") = Some(failure.0);
                        Err(gst::FlowError::Error)
                    }
                }
            })
            .build(),
    );
    Ok(sink.upcast())
}

pub fn finish() -> Result<()> {
    match FAILURE.lock().expect("the failure isn't poisoned").take() {
        Some(message) => Err(Failure::new(message)),
        None => Ok(()),
    }
}
