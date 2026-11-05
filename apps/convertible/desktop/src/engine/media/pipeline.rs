use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex, mpsc};
use std::time::Duration;

use gstreamer as gst;
use gstreamer::prelude::*;

use super::branches::{self, Build, Route, muxer};
use super::gif_sink;
use super::plan::{Plan, VideoPlan};
use super::probe::MediaInfo;
use crate::engine::Progress;
use crate::engine::error::{Failure, Result};
use crate::engine::job::{Job, Range};

const TICK: Duration = Duration::from_millis(250);
fn seconds(value: f64) -> gst::ClockTime {
    gst::ClockTime::from_nseconds((value.max(0.0) * 1e9) as u64)
}

fn route_pad(routes: &Mutex<Vec<Route>>, pipeline: &gst::Pipeline, pad: &gst::Pad) {
    let caps = pad.current_caps().unwrap_or_else(|| pad.query_caps(None));
    let name = caps
        .structure(0)
        .map_or("", |structure| structure.name().as_str());
    let video = name.starts_with("video/") || name.starts_with("image/");
    let audio = name.starts_with("audio/");
    let mut routes = routes.lock().expect("the route list isn't poisoned");
    let route = routes
        .iter_mut()
        .find(|route| !route.taken && ((video && route.video) || (audio && !route.video)));
    let target = route.map(|route| {
        route.taken = true;
        route.target.clone()
    });
    let target = target.unwrap_or_else(|| {
        let sink = gst::ElementFactory::make("fakesink")
            .property("sync", false)
            .build()
            .expect("fakesink is part of GStreamer");
        pipeline
            .add(&sink)
            .expect("a new element can join the pipeline");
        sink.sync_state_with_parent().expect("fakesink starts");
        sink
    });
    let sink = target
        .static_pad("sink")
        .expect("every route has a sink pad");
    let _ = pad.link(&sink);
}

fn wait_for_end(
    pipeline: &gst::Pipeline,
    total: f64,
    origin: f64,
    position: &AtomicU64,
    progress: &Progress,
) -> Result<()> {
    let bus = pipeline.bus().expect("a pipeline has a bus");
    loop {
        let message = bus.timed_pop_filtered(
            gst::ClockTime::from_mseconds(TICK.as_millis() as u64),
            &[gst::MessageType::Eos, gst::MessageType::Error],
        );
        if total > 0.0 {
            let done = position.load(Ordering::Relaxed) as f64 / 1e9 - origin;
            progress.report((done / total).clamp(0.0, 0.99) as f32);
        }
        match message.as_ref().map(|message| message.view()) {
            Some(gst::MessageView::Eos(_)) => return Ok(()),
            Some(gst::MessageView::Error(error)) => {
                return Err(Failure::damaged(error.error()));
            }
            _ => {}
        }
    }
}

pub struct Rates {
    pub video_kilobits: Option<u32>,
    pub audio_kilobits: Option<u32>,
}

fn range(job: &Job, info: &MediaInfo) -> Range {
    job.edits.trim.unwrap_or(Range {
        start: 0.0,
        end: info.duration,
    })
}

pub fn run(
    job: &Job,
    info: &MediaInfo,
    plan: &Plan,
    rates: &Rates,
    progress: &Progress,
) -> Result<()> {
    let pipeline = gst::Pipeline::new();
    let source = gst::ElementFactory::make("filesrc")
        .property("location", &job.inputs[0])
        .build()
        .map_err(Failure::damaged)?;
    let parser = branches::element("parsebin")?;
    let sink = gst::ElementFactory::make("filesink")
        .name("output")
        .property("location", &job.temp)
        .property("sync", false)
        .build()
        .map_err(Failure::damaged)?;
    pipeline
        .add_many([&source, &parser])
        .map_err(Failure::damaged)?;
    source.link(&parser).map_err(Failure::damaged)?;
    let mux = muxer(&job.format)?;
    let writes_file = plan.video != VideoPlan::Gif;
    if writes_file {
        pipeline.add(&sink).map_err(Failure::damaged)?;
    }
    if let Some(mux) = &mux {
        pipeline.add(mux).map_err(Failure::damaged)?;
        mux.link(&sink).map_err(Failure::damaged)?;
    }
    let position = Arc::new(AtomicU64::new(0));
    let mut build = Build {
        job,
        info,
        pipeline: pipeline.clone(),
        mux,
        routes: Vec::new(),
        position: position.clone(),
        video_kilobits: rates.video_kilobits,
        audio_kilobits: rates.audio_kilobits,
    };
    build.routes_for(plan)?;
    let routes = Arc::new(Mutex::new(std::mem::take(&mut build.routes)));
    let (ready_sender, ready) = mpsc::channel::<()>();
    let streams = usize::from(info.video.is_some()) + info.audio.len();
    let blocks: Arc<Mutex<Vec<(gst::Pad, gst::PadProbeId)>>> = Arc::default();
    let trimming = job.edits.trim.is_some();
    {
        let (routes, pipeline, blocks) = (routes.clone(), pipeline.clone(), blocks.clone());
        let sender = Mutex::new(ready_sender);
        parser.connect_pad_added(move |_, pad| {
            if trimming {
                let probe = pad.add_probe(
                    gst::PadProbeType::BLOCK | gst::PadProbeType::BUFFER,
                    |_, _| gst::PadProbeReturn::Ok,
                );
                if let Some(probe) = probe {
                    blocks
                        .lock()
                        .expect("the block list isn't poisoned")
                        .push((pad.clone(), probe));
                }
            }
            route_pad(&routes, &pipeline, pad);
            let seen = blocks.lock().expect("the block list isn't poisoned").len();
            if trimming && seen == streams {
                let _ = sender.lock().expect("the sender isn't poisoned").send(());
            }
        });
    }
    parser.connect_no_more_pads({
        let routes = routes.clone();
        move |_| release_unused(&routes)
    });
    pipeline
        .set_state(gst::State::Playing)
        .map_err(|_| Failure::damaged("pipeline"))?;
    let span = range(job, info);
    let result = (|| {
        if let Some(trim) = job.edits.trim {
            seek(&ready, &pipeline, trim, &blocks)?;
        }
        wait_for_end(
            &pipeline,
            span.end - span.start,
            span.start,
            &position,
            progress,
        )
    })();
    pipeline
        .set_state(gst::State::Null)
        .map_err(|_| Failure::damaged("pipeline"))?;
    result?;
    gif_sink::finish()
}

fn release_unused(routes: &Mutex<Vec<Route>>) {
    for route in routes
        .lock()
        .expect("the route list isn't poisoned")
        .iter()
        .filter(|route| !route.taken)
    {
        if let Some(pad) = route.target.static_pad("sink") {
            pad.send_event(gst::event::Eos::new());
        }
    }
}

fn seek(
    ready: &mpsc::Receiver<()>,
    pipeline: &gst::Pipeline,
    trim: Range,
    blocks: &Mutex<Vec<(gst::Pad, gst::PadProbeId)>>,
) -> Result<()> {
    let bus = pipeline.bus().expect("a pipeline has a bus");
    while ready.recv_timeout(TICK).is_err() {
        if let Some(message) = bus.pop_filtered(&[gst::MessageType::Error])
            && let gst::MessageView::Error(error) = message.view()
        {
            return Err(Failure::damaged(error.error()));
        }
    }
    let flags = gst::SeekFlags::FLUSH | gst::SeekFlags::ACCURATE;
    let event = gst::event::Seek::new(
        1.0,
        flags,
        gst::SeekType::Set,
        seconds(trim.start),
        gst::SeekType::Set,
        seconds(trim.end),
    );
    let mut blocks = blocks.lock().expect("the block list isn't poisoned");
    let sent = blocks.first().is_some_and(|(pad, _)| pad.send_event(event));
    for (pad, probe) in blocks.drain(..) {
        pad.remove_probe(probe);
    }
    if sent {
        Ok(())
    } else {
        Err(Failure::damaged("seek"))
    }
}
