mod common;

use std::fs;

use common::{fixture, job, run};
use convertible_lib::engine::capabilities;
use convertible_lib::engine::job::{Audio, Range};
use convertible_lib::engine::media::{frame, probe};
use gstreamer as gst;
use lofty::config::WriteOptions;
use lofty::file::TaggedFileExt;
use lofty::picture::{MimeType, Picture, PictureType};
use lofty::tag::{Accessor, ItemKey, Tag, TagExt, TagType};
use tempfile::tempdir;

fn close(value: f64, expected: f64, margin: f64) -> bool {
    (value - expected).abs() <= margin
}

fn tagged_song(folder: &std::path::Path) -> std::path::PathBuf {
    let path = folder.join("song.flac");
    fs::copy(fixture("tone.flac"), &path).unwrap();
    let mut tag = Tag::new(TagType::VorbisComments);
    tag.set_title("Harbour Lights".to_owned());
    tag.set_artist("The Tide".to_owned());
    tag.insert_text(ItemKey::AlbumTitle, "Low Water".to_owned());
    let mut cover = Vec::new();
    image::RgbImage::from_pixel(16, 16, image::Rgb([200, 40, 40]))
        .write_to(
            &mut std::io::Cursor::new(&mut cover),
            image::ImageFormat::Png,
        )
        .unwrap();
    tag.push_picture(
        Picture::unchecked(cover)
            .pic_type(PictureType::CoverFront)
            .mime_type(MimeType::Png)
            .build(),
    );
    tag.save_to_path(&path, WriteOptions::default()).unwrap();
    path
}

#[test]
fn audio_converts_and_keeps_tags_and_cover() {
    gst::init().unwrap();
    let found = capabilities::detect();
    let folder = tempdir().unwrap();
    let source = tagged_song(folder.path());
    for (id, extension) in [
        ("mp3", "mp3"),
        ("ogg", "ogg"),
        ("opus", "opus"),
        ("m4a", "m4a"),
        ("flac", "flac"),
    ] {
        if found.missing.iter().any(|missing| missing == id) {
            continue;
        }
        let output = run(&job(
            &[&source],
            folder.path(),
            &format!("out.{extension}"),
            id,
        ))
        .unwrap();
        let info = probe::discover(&output).unwrap();
        assert!(
            close(info.duration, 0.93, 0.15),
            "{id} lasts {}",
            info.duration
        );
        assert_eq!(info.audio[0].channels, 2);
        let file = lofty::read_from_path(&output).unwrap();
        let tag = file
            .primary_tag()
            .unwrap_or_else(|| panic!("{id} has no tags"));
        assert_eq!(tag.title().as_deref(), Some("Harbour Lights"), "{id}");
        assert_eq!(tag.artist().as_deref(), Some("The Tide"), "{id}");
        assert_eq!(tag.pictures().len(), 1, "{id} lost its cover");
    }
    let wav = run(&job(&[&source], folder.path(), "out.wav", "wav")).unwrap();
    assert_eq!(probe::discover(&wav).unwrap().audio[0].sample_rate, 44100);
}

#[test]
fn stripping_metadata_drops_tags() {
    let folder = tempdir().unwrap();
    let source = tagged_song(folder.path());
    let mut strip = job(&[&source], folder.path(), "out.ogg", "ogg");
    strip.options.keep_metadata = false;
    let output = run(&strip).unwrap();
    let file = lofty::read_from_path(&output).unwrap();
    assert!(file.primary_tag().is_none_or(|tag| tag.title().is_none()));
}

#[test]
fn video_converts_between_containers() {
    let folder = tempdir().unwrap();
    let found = capabilities::detect();
    let source = fixture("clip.webm");
    let output = run(&job(&[&source], folder.path(), "out.mkv", "mkv")).unwrap();
    let info = probe::discover(&output).unwrap();
    let video = info.video.unwrap();
    assert_eq!((video.width, video.height), (160, 120));
    assert_eq!(
        video.codec, "vp9",
        "matching codecs are copied, not encoded again"
    );

    if found.video_codecs.iter().any(|codec| codec.id == "h264") {
        let output = run(&job(&[&source], folder.path(), "out.mp4", "mp4")).unwrap();
        let info = probe::discover(&output).unwrap();
        assert_eq!(info.video.unwrap().codec, "h264");
        assert!(close(info.duration, 1.0, 0.2));
        assert!(!info.audio.is_empty());
    }
}

#[test]
fn trimming_and_resizing_video_works() {
    let folder = tempdir().unwrap();
    let source = fixture("clip.webm");
    let mut edit = job(&[&source], folder.path(), "cut.webm", "webm");
    edit.edits.trim = Some(Range {
        start: 0.25,
        end: 0.75,
    });
    edit.options.height = Some(60);
    edit.options.frame_rate = Some(10.0);
    let output = run(&edit).unwrap();
    let info = probe::discover(&output).unwrap();
    assert!(close(info.duration, 0.5, 0.2), "lasts {}", info.duration);
    let video = info.video.unwrap();
    assert_eq!((video.width, video.height), (80, 60));
    assert!(frame::grab(&output, 0.0).is_ok());
}

#[test]
fn video_gives_up_its_audio_or_keeps_only_it() {
    let folder = tempdir().unwrap();
    let source = fixture("clip.webm");
    let mut silent = job(&[&source], folder.path(), "silent.webm", "webm");
    silent.options.audio = Audio::Remove;
    assert!(
        probe::discover(&run(&silent).unwrap())
            .unwrap()
            .audio
            .is_empty()
    );
    let only = run(&job(&[&source], folder.path(), "sound.ogg", "ogg")).unwrap();
    let info = probe::discover(&only).unwrap();
    assert!(info.video.is_none());
    assert_eq!(info.audio.len(), 1);
}

#[test]
fn video_becomes_an_animated_gif() {
    let folder = tempdir().unwrap();
    let source = fixture("clip.webm");
    let mut gif = job(&[&source], folder.path(), "clip.gif", "gif");
    gif.options.width = Some(80);
    gif.options.frame_rate = Some(10.0);
    let output = run(&gif).unwrap();
    let frames = convertible_lib::engine::image::decode::gif_frames(&output)
        .unwrap()
        .map_while(Result::ok)
        .count();
    assert!((8..=12).contains(&frames), "{frames} frames");
}

#[test]
fn target_size_is_kept_for_video() {
    let folder = tempdir().unwrap();
    let source = fixture("clip.webm");
    let mut small = job(&[&source], folder.path(), "small.webm", "webm");
    small.options.target_bytes = Some(40_000);
    let output = run(&small).unwrap();
    assert!(fs::metadata(&output).unwrap().len() <= 40_000);
}

#[test]
fn rotation_swaps_the_frame() {
    let folder = tempdir().unwrap();
    let mut turn = job(
        &[&fixture("clip.webm")],
        folder.path(),
        "turned.webm",
        "webm",
    );
    turn.edits.rotate = 90;
    let info = probe::discover(&run(&turn).unwrap()).unwrap();
    let video = info.video.unwrap();
    assert_eq!((video.width, video.height), (120, 160));
}
