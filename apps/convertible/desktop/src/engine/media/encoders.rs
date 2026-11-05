use gstreamer as gst;
use gstreamer::prelude::*;

pub const VIDEO_CODECS: &[(&str, &[&str])] = &[
    (
        "h264",
        &[
            "nvh264enc",
            "vah264enc",
            "vah264lpenc",
            "qsvh264enc",
            "x264enc",
            "openh264enc",
        ],
    ),
    (
        "hevc",
        &[
            "nvh265enc",
            "vah265enc",
            "vah265lpenc",
            "qsvh265enc",
            "x265enc",
        ],
    ),
    (
        "av1",
        &[
            "nvav1enc",
            "vaav1enc",
            "qsvav1enc",
            "svtav1enc",
            "rav1enc",
            "av1enc",
        ],
    ),
    ("vp9", &["vavp9enc", "vp9enc"]),
    ("vp8", &["vavp8enc", "vp8enc"]),
    ("prores", &["avenc_prores_ks"]),
    ("ffv1", &["avenc_ffv1"]),
];

const HARDWARE: &[&str] = &["nv", "va", "qsv"];
const GOOD_DEADLINE: u32 = 1_000_000;

pub fn is_hardware(element: &str) -> bool {
    HARDWARE.iter().any(|prefix| element.starts_with(prefix)) && !element.starts_with("vp")
}

pub const fn container_codecs(format: &str) -> &'static [&'static str] {
    match format.as_bytes() {
        b"mp4" => &["h264", "hevc", "av1"],
        b"webm" => &["vp9", "av1", "vp8"],
        b"mkv" => &["h264", "hevc", "av1", "vp9", "vp8", "ffv1"],
        b"mov" => &["h264", "hevc", "prores"],
        b"avi" => &["h264"],
        _ => &[],
    }
}

pub const fn container_audio(format: &str) -> &'static [&'static str] {
    match format.as_bytes() {
        b"mp4" | b"mov" => &["aac", "mp3", "ac3", "alac"],
        b"webm" => &["opus", "vorbis"],
        b"mkv" => &["opus", "aac", "mp3", "vorbis", "flac", "ac3"],
        b"avi" => &["mp3", "ac3"],
        _ => &[],
    }
}

const fn crf(quality: u8, best: u32, worst: u32) -> u32 {
    let quality = quality as u32;
    worst - (worst - best) * quality / 100
}

fn set(element: &gst::Element, name: &str, value: impl ToString) {
    let parsed = element.find_property(name).and_then(|property| {
        gst::glib::Value::deserialize_with_pspec(&value.to_string(), &property).ok()
    });
    if let Some(parsed) = parsed {
        element.set_property_from_value(name, &parsed);
    }
}

fn configure_x26x(
    encoder: &gst::Element,
    quality: u8,
    kilobits: Option<u32>,
    constant: impl Fn(u32),
) {
    set(encoder, "speed-preset", "medium");
    match kilobits {
        Some(rate) => {
            set(encoder, "pass", "cbr");
            set(encoder, "bitrate", rate);
        }
        None => constant(crf(quality, 14, 40)),
    }
}

fn configure_vpx(encoder: &gst::Element, quality: u8, kilobits: Option<u32>, threads: u32) {
    set(encoder, "threads", threads);
    set(encoder, "cpu-used", 4);
    set(encoder, "deadline", GOOD_DEADLINE);
    set(encoder, "row-mt", true);
    match kilobits {
        Some(rate) => {
            set(encoder, "end-usage", "vbr");
            set(encoder, "target-bitrate", rate * 1000);
        }
        None => {
            set(encoder, "end-usage", "cq");
            set(encoder, "cq-level", crf(quality, 12, 50));
            set(encoder, "target-bitrate", 0);
        }
    }
}

fn configure_nvenc(encoder: &gst::Element, quality: u8, kilobits: Option<u32>) {
    set(encoder, "preset", "hq");
    set(encoder, "rc-mode", "vbr");
    match kilobits {
        Some(rate) => set(encoder, "bitrate", rate),
        None => {
            set(encoder, "bitrate", 0);
            set(encoder, "const-quality", crf(quality, 18, 42));
        }
    }
}

fn configure_vaapi(encoder: &gst::Element, quality: u8, kilobits: Option<u32>) {
    match kilobits {
        Some(rate) => {
            set(encoder, "rate-control", "vbr");
            set(encoder, "bitrate", rate);
        }
        None => {
            let parameter = crf(quality, 16, 40);
            set(encoder, "rate-control", "cqp");
            set(encoder, "qpi", parameter);
            set(encoder, "qpp", parameter);
            set(encoder, "qpb", parameter);
        }
    }
}

pub fn configure_video(
    encoder: &gst::Element,
    name: &str,
    quality: u8,
    kilobits: Option<u32>,
    threads: u32,
) {
    match name {
        "x264enc" => configure_x26x(encoder, quality, kilobits, |value| {
            set(encoder, "pass", "qual");
            set(encoder, "quantizer", value);
        }),
        "x265enc" => configure_x26x(encoder, quality, kilobits, |value| {
            set(encoder, "option-string", format!("crf={value}"));
        }),
        "svtav1enc" => {
            set(encoder, "preset", 8);
            match kilobits {
                Some(rate) => set(encoder, "target-bitrate", rate),
                None => set(encoder, "crf", crf(quality, 18, 55)),
            }
        }
        "vp9enc" | "vp8enc" => configure_vpx(encoder, quality, kilobits, threads),
        "nvh264enc" | "nvh265enc" | "nvav1enc" => configure_nvenc(encoder, quality, kilobits),
        "openh264enc" => set(encoder, "bitrate", kilobits.unwrap_or(8000) * 1000),
        "rav1enc" => {
            set(encoder, "speed-preset", 8);
            match kilobits {
                Some(rate) => set(encoder, "bitrate", rate * 1000),
                None => set(encoder, "quantizer", crf(quality, 40, 200)),
            }
        }
        "av1enc" => {
            set(encoder, "cpu-used", 6);
            set(encoder, "threads", threads);
            set(encoder, "row-mt", true);
            match kilobits {
                Some(rate) => set(encoder, "target-bitrate", rate),
                None => {
                    set(encoder, "end-usage", "cq");
                    set(encoder, "cq-level", crf(quality, 14, 50));
                }
            }
        }
        hardware if is_hardware(hardware) => configure_vaapi(encoder, quality, kilobits),
        _ => {}
    }
}

pub const fn parser(codec: &str) -> Option<&'static str> {
    match codec.as_bytes() {
        b"h264" => Some("h264parse"),
        b"hevc" => Some("h265parse"),
        b"av1" => Some("av1parse"),
        _ => None,
    }
}

pub fn audio_encoders(codec: &str) -> &'static [&'static str] {
    match codec {
        "aac" => &["fdkaacenc", "avenc_aac", "voaacenc"],
        "mp3" => &["lamemp3enc"],
        "opus" => &["opusenc"],
        "vorbis" => &["vorbisenc"],
        "flac" => &["flacenc"],
        "alac" => &["avenc_alac"],
        _ => &[],
    }
}

pub fn configure_audio(encoder: &gst::Element, name: &str, quality: u8, kilobits: Option<u32>) {
    let chosen = kilobits.unwrap_or(96 + 224 * u32::from(quality) / 100);
    match name {
        "lamemp3enc" => {
            set(encoder, "target", "bitrate");
            set(encoder, "bitrate", chosen.min(320));
            set(encoder, "cbr", false);
        }
        "fdkaacenc" | "avenc_aac" | "voaacenc" => set(encoder, "bitrate", chosen * 1000),
        "opusenc" => set(encoder, "bitrate", chosen.clamp(6, 510) * 1000),
        "vorbisenc" => match kilobits {
            Some(rate) => set(encoder, "bitrate", rate * 1000),
            None => set(encoder, "quality", f32::from(quality) / 100.0),
        },
        _ => {}
    }
}

pub fn available(element: &str) -> bool {
    gst::ElementFactory::find(element).is_some()
}

pub fn pick_audio(codec: &str) -> Option<&'static str> {
    audio_encoders(codec)
        .iter()
        .copied()
        .find(|element| available(element))
}

pub fn pick_video(codec: &str, hardware: bool) -> Option<&'static str> {
    let (_, candidates) = VIDEO_CODECS.iter().find(|(id, _)| *id == codec)?;
    candidates
        .iter()
        .copied()
        .filter(|element| hardware || !is_hardware(element))
        .find(|element| available(element) && (!is_hardware(element) || works(element)))
}

fn works(element: &str) -> bool {
    let description = format!(
        "videotestsrc num-buffers=4 ! video/x-raw,width=640,height=480 ! videoconvert ! {element} ! fakesink"
    );
    let Ok(pipeline) = gst::parse::launch(&description) else {
        return false;
    };
    if pipeline.set_state(gst::State::Playing).is_err() {
        let _ = pipeline.set_state(gst::State::Null);
        return false;
    }
    let bus = pipeline.bus().expect("a pipeline has a bus");
    let ended = bus.timed_pop_filtered(
        gst::ClockTime::from_seconds(5),
        &[gst::MessageType::Eos, gst::MessageType::Error],
    );
    let _ = pipeline.set_state(gst::State::Null);
    ended.is_some_and(|message| matches!(message.view(), gst::MessageView::Eos(_)))
}
