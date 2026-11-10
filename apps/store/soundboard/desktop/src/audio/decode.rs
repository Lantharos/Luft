use std::path::Path;

use gstreamer as gst;
use gstreamer::prelude::*;
use gstreamer_app::AppSink;
use luft_i18n::t;

use super::RATE;
use crate::L10N;

const WAIT: gst::ClockTime = gst::ClockTime::from_mseconds(50);
const CAPS: &str = "audio/x-raw,format=F32LE,channels=2,layout=interleaved";

pub fn decode(path: &Path) -> Result<Vec<f32>, String> {
    gst::init().map_err(|error| error.to_string())?;
    let source = gst::ElementFactory::make("filesrc")
        .property("location", path)
        .build()
        .map_err(|e| e.to_string())?;
    let pipeline = gst::parse::launch(&format!(
        "decodebin name=decoder ! audioconvert ! audioresample ! {CAPS},rate={RATE} ! appsink name=sink sync=false"
    ))
    .map_err(|error| error.to_string())?
    .downcast::<gst::Pipeline>()
    .map_err(|_| "GStreamer didn't make a pipeline".to_string())?;
    pipeline.add(&source).map_err(|error| error.to_string())?;
    let decoder = pipeline
        .by_name("decoder")
        .expect("the pipeline names its decoder");
    source.link(&decoder).map_err(|error| error.to_string())?;
    let sink = pipeline
        .by_name("sink")
        .and_then(|sink| sink.downcast::<AppSink>().ok())
        .expect("the pipeline names its sink");
    let bus = pipeline.bus().expect("a pipeline has a bus");
    pipeline
        .set_state(gst::State::Playing)
        .map_err(|error| error.to_string())?;
    let samples = pull(&sink, &bus);
    let _ = pipeline.set_state(gst::State::Null);
    samples
}

fn pull(sink: &AppSink, bus: &gst::Bus) -> Result<Vec<f32>, String> {
    let mut samples = Vec::new();
    while !sink.is_eos() {
        if let Some(sample) = sink.try_pull_sample(WAIT) {
            let Some(buffer) = sample.buffer() else {
                continue;
            };
            let map = buffer.map_readable().map_err(|error| error.to_string())?;
            let (chunks, _) = map.as_slice().as_chunks::<4>();
            samples.extend(chunks.iter().map(|bytes| f32::from_le_bytes(*bytes)));
        } else if let Some(message) = bus.pop_filtered(&[gst::MessageType::Error])
            && let gst::MessageView::Error(error) = message.view()
        {
            return Err(error.error().to_string());
        }
    }
    if samples.is_empty() {
        return Err(t!(L10N, "error-no-sound"));
    }
    Ok(samples)
}
