use std::path::Path;

use gstreamer as gst;
use gstreamer::prelude::*;
use gstreamer_app::AppSink;

use super::frame::Frame;

const SETTLE_TIMEOUT: gst::ClockTime = gst::ClockTime::from_seconds(10);
const SKIPPED_STREAMS: [&str; 3] = ["audio/", "text/", "subpicture/"];

pub struct Player {
    pipeline: gst::Pipeline,
    sink: AppSink,
}

impl Player {
    pub fn open(input: &Path, size: u32) -> Result<Self, String> {
        gst::init().map_err(failed)?;
        let pipeline = gst::Pipeline::new();
        let source = element("filesrc")
            .property("location", input.to_string_lossy().as_ref())
            .build()
            .map_err(failed)?;
        let decoder = element("decodebin")
            .property(
                "caps",
                gst::Caps::builder("video/x-raw").any_features().build(),
            )
            .property("expose-all-streams", false)
            .build()
            .map_err(failed)?;
        let scale = element("videoconvertscale").build().map_err(failed)?;
        let fit = element("capsfilter")
            .property("caps", fitted_caps(size))
            .build()
            .map_err(failed)?;
        let orient = element("videoflip").build().map_err(failed)?;
        orient.set_property_from_str("video-direction", "auto");
        let sink = AppSink::builder()
            .caps(
                &gst::Caps::builder("video/x-raw")
                    .field("format", "RGB")
                    .build(),
            )
            .sync(false)
            .max_buffers(1)
            .build();
        pipeline
            .add_many([&source, &decoder, &scale, &fit, &orient, sink.upcast_ref()])
            .map_err(failed)?;
        source.link(&decoder).map_err(failed)?;
        gst::Element::link_many([&scale, &fit, &orient, sink.upcast_ref()]).map_err(failed)?;
        decoder.connect("autoplug-continue", false, |values| {
            let caps = values[2].get::<gst::Caps>().ok()?;
            Some(decodes_further(&caps).to_value())
        });
        let target = scale.static_pad("sink").ok_or("The scaler has no input")?;
        let linked = target.clone();
        decoder.connect_pad_added(move |_, pad| {
            if !target.is_linked() {
                let _ = pad.link(&target);
            }
        });
        decoder.connect_no_more_pads(move |decoder| {
            if !linked.is_linked() {
                gst::element_error!(
                    decoder,
                    gst::StreamError::WrongType,
                    ("The file has no video")
                );
            }
        });
        let player = Self { pipeline, sink };
        player
            .pipeline
            .set_state(gst::State::Paused)
            .map_err(failed)?;
        Ok(player)
    }

    pub fn preroll(&self) -> Result<Frame, String> {
        self.settle()?;
        let sample = self
            .sink
            .try_pull_preroll(SETTLE_TIMEOUT)
            .ok_or("The video has no picture")?;
        Frame::from_sample(&sample)
    }

    pub fn duration(&self) -> Option<gst::ClockTime> {
        let seekable = {
            let mut query = gst::query::Seeking::new(gst::Format::Time);
            self.pipeline.query(&mut query) && query.result().0
        };
        self.pipeline
            .query_duration::<gst::ClockTime>()
            .filter(|duration| seekable && !duration.is_zero())
    }

    pub fn seek(&self, position: gst::ClockTime) -> Result<Frame, String> {
        self.pipeline
            .seek_simple(
                gst::SeekFlags::FLUSH | gst::SeekFlags::KEY_UNIT | gst::SeekFlags::SNAP_NEAREST,
                position,
            )
            .map_err(failed)?;
        self.preroll()
    }

    fn settle(&self) -> Result<(), String> {
        let bus = self.pipeline.bus().ok_or("The pipeline has no bus")?;
        let message = bus
            .timed_pop_filtered(
                SETTLE_TIMEOUT,
                &[gst::MessageType::AsyncDone, gst::MessageType::Error],
            )
            .ok_or("The video took too long to open")?;
        match message.view() {
            gst::MessageView::Error(error) => Err(error.error().to_string()),
            _ => Ok(()),
        }
    }
}

impl Drop for Player {
    fn drop(&mut self) {
        let _ = self.pipeline.set_state(gst::State::Null);
    }
}

fn element(factory: &str) -> gst::element_factory::ElementBuilder<'_> {
    gst::ElementFactory::make(factory)
}

fn fitted_caps(size: u32) -> gst::Caps {
    let side = gst::IntRange::new(1, size as i32);
    gst::Caps::builder("video/x-raw")
        .field("format", "RGB")
        .field("pixel-aspect-ratio", gst::Fraction::new(1, 1))
        .field("width", side)
        .field("height", side)
        .build()
}

fn decodes_further(caps: &gst::Caps) -> bool {
    caps.structure(0).is_none_or(|structure| {
        !SKIPPED_STREAMS
            .iter()
            .any(|prefix| structure.name().starts_with(prefix))
    })
}

fn failed(error: impl ToString) -> String {
    error.to_string()
}
