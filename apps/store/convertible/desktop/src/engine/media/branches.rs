use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};

use gstreamer as gst;
use gstreamer::prelude::*;

use super::filters;
use super::plan::{AudioPlan, Plan, VideoPlan};
use super::probe::MediaInfo;
use super::{encoders, gif_sink};
use crate::engine::error::{Failure, Result};
use crate::engine::formats::{self, Family};
use crate::engine::job::Job;
use crate::l10n::L10N;
use luft_i18n::t;

pub fn element(factory: &str) -> Result<gst::Element> {
    gst::ElementFactory::make(factory)
        .build()
        .map_err(|_| Failure::new(t!(L10N, "failure-missing-part", name = factory.to_owned())))
}

fn add_chain(pipeline: &gst::Pipeline, chain: &[gst::Element]) -> Result<()> {
    pipeline.add_many(chain).map_err(Failure::damaged)?;
    gst::Element::link_many(chain).map_err(Failure::damaged)
}

pub struct Route {
    pub video: bool,
    pub target: gst::Element,
    pub taken: bool,
}

pub fn muxer(format: &str) -> Result<Option<gst::Element>> {
    let name = match format {
        "mp4" | "m4a" => "mp4mux",
        "mov" => "qtmux",
        "webm" => "webmmux",
        "mkv" => "matroskamux",
        "avi" => "avimux",
        "ogg" | "opus" => "oggmux",
        "aiff" => "aiffmux",
        "wav" => "wavenc",
        _ => return Ok(None),
    };
    element(name).map(Some)
}

fn entry_for(pipeline: &gst::Pipeline, head: &gst::Element) -> Result<gst::Element> {
    let decoder = element("decodebin")?;
    pipeline.add(&decoder).map_err(Failure::damaged)?;
    let head = head.clone();
    decoder.connect_pad_added(move |_, pad| {
        if let Some(sink) = head.static_pad("sink")
            && !sink.is_linked()
        {
            let _ = pad.link(&sink);
        }
    });
    Ok(decoder)
}

fn mux_pad(mux: &gst::Element, video: bool) -> Result<gst::Pad> {
    let wanted = if video { "video_%u" } else { "audio_%u" };
    mux.request_pad_simple(wanted)
        .or_else(|| mux.request_pad_simple("sink_%u"))
        .or_else(|| mux.static_pad("sink"))
        .ok_or_else(|| Failure::damaged("muxer"))
}

fn unbounded_queue() -> Result<gst::Element> {
    gst::ElementFactory::make("queue")
        .property("max-size-buffers", 0u32)
        .property("max-size-bytes", 0u32)
        .property("max-size-time", 0u64)
        .build()
        .map_err(Failure::damaged)
}

fn mux_output(
    pipeline: &gst::Pipeline,
    tail: &gst::Element,
    mux: &gst::Element,
    video: bool,
    keep_tags: bool,
) -> Result<()> {
    let queue = unbounded_queue()?;
    pipeline.add(&queue).map_err(Failure::damaged)?;
    tail.link(&queue).map_err(Failure::damaged)?;
    let pad = mux_pad(mux, video)?;
    queue
        .static_pad("src")
        .expect("a queue has a source pad")
        .link(&pad)
        .map_err(Failure::damaged)?;
    if !keep_tags {
        drop_tags(&queue);
    }
    Ok(())
}

fn drop_tags(element: &gst::Element) {
    let pad = element.static_pad("src").expect("a queue has a source pad");
    pad.add_probe(gst::PadProbeType::EVENT_DOWNSTREAM, |_, info| {
        match info.event() {
            Some(event) if event.type_() == gst::EventType::Tag => gst::PadProbeReturn::Drop,
            _ => gst::PadProbeReturn::Ok,
        }
    });
}

fn watch_position(element: &gst::Element, position: &Arc<AtomicU64>) {
    let pad = element
        .static_pad("sink")
        .expect("the watched element has a sink pad");
    let position = position.clone();
    pad.add_probe(gst::PadProbeType::BUFFER, move |_, info| {
        if let Some(time) = info.buffer().and_then(|buffer| buffer.pts()) {
            position.fetch_max(time.nseconds(), Ordering::Relaxed);
        }
        gst::PadProbeReturn::Ok
    });
}

pub struct Build<'a> {
    pub job: &'a Job,
    pub info: &'a MediaInfo,
    pub pipeline: gst::Pipeline,
    pub mux: Option<gst::Element>,
    pub routes: Vec<Route>,
    pub position: Arc<AtomicU64>,
    pub video_kilobits: Option<u32>,
    pub audio_kilobits: Option<u32>,
}

impl Build<'_> {
    fn keeps_tags(&self) -> bool {
        let audio_file =
            formats::by_id(&self.job.format).is_some_and(|format| format.family == Family::Audio);
        self.job.options.keep_metadata && !audio_file
    }

    fn sink_target(&self, tail: &gst::Element, video: bool) -> Result<()> {
        match &self.mux {
            Some(mux) => mux_output(&self.pipeline, tail, mux, video, self.keeps_tags()),
            None => {
                let sink = self
                    .pipeline
                    .by_name("output")
                    .expect("the file sink was added");
                tail.link(&sink).map_err(Failure::damaged)
            }
        }
    }

    fn copy_route(&mut self, video: bool) -> Result<()> {
        let queue = element("queue")?;
        self.pipeline.add(&queue).map_err(Failure::damaged)?;
        self.sink_target(&queue, video)?;
        watch_position(&queue, &self.position);
        self.routes.push(Route {
            video,
            target: queue,
            taken: false,
        });
        Ok(())
    }

    fn video_chain(&mut self, tail: Vec<gst::Element>) -> Result<gst::Element> {
        let mut chain = vec![element("queue")?];
        chain.extend(filters::video(self.job, self.info)?);
        chain.extend(tail);
        add_chain(&self.pipeline, &chain)?;
        filters::paint_marks(&chain, self.job, self.info)?;
        Ok(chain[0].clone())
    }

    fn encode_video(&mut self, name: &str, codec: &str) -> Result<()> {
        let encoder = element(name)?;
        let threads = std::thread::available_parallelism().map_or(4, |count| count.get() as u32);
        encoders::configure_video(
            &encoder,
            name,
            self.job.options.quality,
            self.video_kilobits,
            threads,
        );
        let mut tail = vec![encoder.clone()];
        if let Some(parser) = encoders::parser(codec) {
            tail.push(element(parser)?);
        }
        let last = tail.last().expect("the encoder is in the tail").clone();
        let head = self.video_chain(tail)?;
        self.sink_target(&last, true)?;
        watch_position(&encoder, &self.position);
        let entry = entry_for(&self.pipeline, &head)?;
        self.routes.push(Route {
            video: true,
            target: entry,
            taken: false,
        });
        Ok(())
    }

    fn gif_video(&mut self) -> Result<()> {
        let sink = gif_sink::sink(self.job, self.position.clone())?;
        let head = self.video_chain(vec![sink])?;
        let entry = entry_for(&self.pipeline, &head)?;
        self.routes.push(Route {
            video: true,
            target: entry,
            taken: false,
        });
        Ok(())
    }

    fn encode_audio(&mut self, name: &str, codec: &str) -> Result<()> {
        let mut chain = vec![
            element("queue")?,
            element("audioconvert")?,
            element("audioresample")?,
        ];
        if let Some(caps) = filters::audio_caps(&self.job.options) {
            chain.push(
                gst::ElementFactory::make("capsfilter")
                    .property("caps", caps)
                    .build()
                    .map_err(Failure::damaged)?,
            );
        }
        if codec != "pcm" {
            let encoder = element(name)?;
            let kilobits = self.audio_kilobits.or(self.job.options.audio_bitrate);
            encoders::configure_audio(&encoder, name, self.job.options.quality, kilobits);
            chain.push(encoder);
            match codec {
                "mp3" => chain.extend([element("mpegaudioparse")?, element("xingmux")?]),
                "aac" => chain.push(element("aacparse")?),
                "opus" => chain.push(element("opusparse")?),
                "flac" => chain.push(element("flacparse")?),
                _ => {}
            }
        }
        let tail = chain.last().expect("the chain has a queue").clone();
        let head = chain[0].clone();
        watch_position(&chain[1], &self.position);
        add_chain(&self.pipeline, &chain)?;
        if !self.keeps_tags() {
            drop_tags(&head);
        }
        self.sink_target(&tail, false)?;
        let entry = entry_for(&self.pipeline, &head)?;
        self.routes.push(Route {
            video: false,
            target: entry,
            taken: false,
        });
        Ok(())
    }

    pub fn routes_for(&mut self, plan: &Plan) -> Result<()> {
        match &plan.video {
            VideoPlan::None => {}
            VideoPlan::Copy => self.copy_route(true)?,
            VideoPlan::Encode { element, codec } => self.encode_video(element, codec)?,
            VideoPlan::Gif => self.gif_video()?,
        }
        for stream in &plan.audio {
            match stream {
                AudioPlan::Copy => self.copy_route(false)?,
                AudioPlan::Encode { element, codec } => self.encode_audio(element, codec)?,
            }
        }
        Ok(())
    }
}
